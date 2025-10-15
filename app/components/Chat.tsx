import React, {useEffect, useMemo, useRef, useState} from "react";
import {createClient} from "@/utils/supabase/component";
import {User} from "@supabase/supabase-js";
import {getTTSService} from "@/utils/tts";
import {globalAvatarRef, globalAvatarNumber} from "@/app/components/SceneWrapper";

// Define message type
type Message = {
    id: string;
    user_id: string;
    name: string;
    message: string;
    created_at: string;
};

const Chat = () => {
    const supabase = useMemo(() => createClient(), []);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [me, setMe] = useState<{ id: string; name: string }>({ id: '', name: '' });
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const ttsService = useMemo(() => {
        try {
            return getTTSService();
        } catch (e) {
            console.error('Failed to initialize TTS:', e);
            return null;
        }
    }, []);

    // Recording the login time for getting chat history
    const loginStartedAt = useMemo(() => {
        if (typeof window === 'undefined') return new Date().toISOString();
        const existing = localStorage.getItem('loginStartedAt');
        if (existing) return existing;
        const now = new Date().toISOString();
        localStorage.setItem('loginStartedAt', now);
        return now;
    }, []);

    // Scroll to bottom when a message is sent
    const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Handle TTS and lipsync for messages
    const speakMessage = async (message: Message) => {
        if (!ttsService || !globalAvatarRef) {
            return;
        }

        try {
            const audioData = await ttsService.speak(message.message, globalAvatarNumber);
            if (!audioData) {
                return;
            }

            const audio = await ttsService.playAudio(audioData);
            globalAvatarRef.speak(audio);

            audio.addEventListener('ended', () => {
                if (globalAvatarRef) {
                    globalAvatarRef.stopSpeaking();
                }
            });
        } catch (error) {
            console.error('Error speaking message:', error);
        }
    };

    // Fetch current user, load post-login history, and subscribe to realtime updates
    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null;
        let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;

        // Main initialization function
        const bootstrap = async () => {
            // Try to get the currently logged-in user
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;

            // If a user session exists, load their data
            if (user) {
                await loadUserData(user);
            }
        };

        // Load chat history and subscribe to realtime updates for the given user
        const loadUserData = async (user: User): Promise<void> => {
            const username = localStorage.getItem('username') as string;

            // Save user info locally for message sending
            setMe({ id: user.id, name: username });

            // Fetch chat history since the current login time
            const { data, error } = await supabase
                .from('chats')
                .select('id,user_id,name,message,created_at')
                .gte('created_at', loginStartedAt)
                .order('created_at', { ascending: true });

            if (!error) {
                setMessages(data || []);
                setTimeout(scrollToBottom, 0);
            }

            // Clean up existing channel if any
            if (channel) {
                await supabase.removeChannel(channel);
                channel = null;
            }

            // Subscribe to realtime chat updates
            channel = supabase
                .channel('realtime:chats:' + Date.now()) // Unique channel name to avoid conflicts
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'chats' },
                    (payload) => {
                        const row = payload.new as Message;
                        if (new Date(row.created_at) >= new Date(loginStartedAt)) {
                            setMessages((prev) => {
                                // Prevent duplicate messages
                                if (prev.some(m => m.id === row.id)) {
                                    return prev;
                                }
                                return [...prev, row];
                            });
                            setTimeout(scrollToBottom, 100);
                        }
                    }
                )
                .subscribe();
        };

        // Try to fetch the user immediately
        void bootstrap();

        // Listen for Supabase auth state changes
        authSubscription = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                // User signed in or session restored
                await loadUserData(session.user);
            } else {
                // User signed out
                setMe({ id: '', name: '' });
                setMessages([]);
                if (channel) {
                    await supabase.removeChannel(channel);
                    channel = null;
                }
            }
        });

        // Unsubscribe from realtime and auth listeners
        return () => {
            if (channel) {
                supabase.removeChannel(channel).catch(console.error);
            }
            if (authSubscription) {
                authSubscription.data.subscription.unsubscribe();
            }
        };
    }, [loginStartedAt, supabase]);

    // Insert the new message into the database
    const handleSend = async () => {
        const text = inputText.trim();
        if (!text) return;

        const { data, error: se } = await supabase.auth.getSession();
        if (se || !data.session?.user) {
            alert('You are not logged in.');
            return;
        }
        const user = data.session.user;

        const { data: insertedData, error } = await supabase.from('chats').insert({
            user_id: user.id,
            name: localStorage.getItem('username'),
            message: text,
        }).select();

        if (error) {
            alert('Send failed: ' + error.message);
            return;
        }

        setInputText('');

        // Automatically speak the message after sending
        if (insertedData && insertedData.length > 0) {
            const newMessage = insertedData[0] as Message;
            // Wait a bit for the message to appear in the chat
            setTimeout(() => {
                speakMessage(newMessage);
            }, 100);
        }
    };


    // Send message by Enter
    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            await handleSend();
        }
    };


    // Auto-scroll when messages update
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(scrollToBottom, 100);
        }
    }, [messages]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div
                className="w-full max-w-4xl h-[600px] bg-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/20 space-y-4">
                    {messages.map((m) => {
                        const isOwn = m.user_id === me.id;
                        const time = new Date(m.created_at);
                        const hh = time.getHours().toString().padStart(2, '0');
                        const mm = time.getMinutes().toString().padStart(2, '0');

                        return (
                            <div key={m.id} className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}>
                                <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                    <span className="text-xs text-black/70 mb-1 px-3">{m.name || 'Anonymous'}</span>
                                    <div
                                        className={`px-4 py-3 rounded-2xl ${
                                            isOwn
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-sm shadow-lg'
                                                : 'bg-white text-gray-800 rounded-bl-sm shadow-md'
                                        }`}
                                    >
                                        {m.message}
                                    </div>
                                    <span className="text-xs text-black/70 mt-1 px-3">{`${hh}:${mm}`}</span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <div className="p-5 bg-white border-t border-gray-200 flex items-center gap-3">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-purple-100 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold active:translate-y-0 transition-all"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;