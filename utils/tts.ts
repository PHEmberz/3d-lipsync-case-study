// Text-to-Speech utility using ElevenLabs API
export class TTSService {
    private readonly apiKey: string;
    private maleVoiceId: string = 'CwhRBWXzGAHq8TQ4Fs17'; // Male voice
    private femaleVoiceId: string = 'SAz9YHcvj6GT2YYXdXww'; // Female voice

    constructor(apiKey?: string) {
        // ElevenLabs API key
        this.apiKey = apiKey || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';
    }

    // Get voice ID based on avatar number
    // Avatar 3, 4, 5 are female, others are male
    private getVoiceId(avatarNumber: number): string {
        const femaleAvatars = [3, 4, 5];
        return femaleAvatars.includes(avatarNumber) ? this.femaleVoiceId : this.maleVoiceId;
    }

    // Generate speech from text using ElevenLabs
    async speak(text: string, avatarNumber: number = 1): Promise<ArrayBuffer | null> {
        if (!this.apiKey) {
            console.error('ElevenLabs API key not set');
            return null;
        }

        const voiceId = this.getVoiceId(avatarNumber);

        try {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': this.apiKey,
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: 'eleven_monolingual_v1',
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.5,
                        },
                    }),
                }
            );

            if (!response.ok) {
                console.error(`ElevenLabs API error: ${response.statusText}`);
                return null;
            }

            return await response.arrayBuffer();
        } catch (error) {
            console.error('TTS error:', error);
            return null;
        }
    }

    // Play audio and return audio element for lipsync
    async playAudio(audioData: ArrayBuffer): Promise<HTMLAudioElement> {
        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        await audio.play();

        // Clean up URL when audio ends
        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(url);
        });

        return audio;
    }
}

// Singleton instance
let ttsInstance: TTSService | null = null;

export function getTTSService(): TTSService {
    if (typeof window === 'undefined') {
        throw new Error('TTS is only available in browser environment');
    }
    if (!ttsInstance) {
        ttsInstance = new TTSService();
    }
    return ttsInstance;
}
