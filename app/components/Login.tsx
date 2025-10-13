'use client';

import {useRouter} from "next/navigation";
import {useState} from 'react'

import {createClient} from '@/utils/supabase/component'
import {saveAuthToLocal} from "@/utils/auth-to-local";

export default function Login() {
    const router = useRouter()
    const supabase = createClient()

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')

    // Clear up form
    const resetForm = () => {
        setUsername('');
        setEmail('');
        setPassword('');
    };

    // Log In function
    async function logIn() {
        if(email !== '' && password !== ''){
            const {data, error} = await supabase.auth.signInWithPassword({email, password})
            if (error) {
                console.error(error);
                alert(error.message);
            }
            saveAuthToLocal(data.user);
            router.push('/experience')
        } else {
          alert("Please fill in all required fields.")
        }
    }

    // Sign Up function
    async function signUp() {
        if(email !== '' && password !== '' && username !== ''){
            const {error} = await supabase.auth.signUp({email, password, options: {data: {username: username}}})
            if (error) {
                console.error(error);
                alert(error.message);
            }
            alert("Email sent! Please check your inbox and confirm your email before logging in.");
            resetForm();
            setIsSignUp(false);
        } else {
            alert("Please fill in all required fields.");
        }
    }

    return (
        <main id="login" className="flex flex-col min-h-dvh items-center justify-center">
            <form className="rounded-2xl bg-black/50 p-[2%] backdrop-blur-sm">
                {isSignUp && (
                    <>
                        <label>User Name:</label>
                        <input id='username' type='text' value={username} required
                               onChange={(e) => setUsername(e.target.value)}/>
                    </>
                )}
                <label htmlFor="email">Email:</label>
                <input id="email" type="email" value={email} required onChange={(e) => setEmail(e.target.value)}/>
                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />

                {isSignUp ? (
                    <button type="button" onClick={signUp}>
                        Sign up
                    </button>
                ) : (
                    <button type="button" onClick={logIn}>
                        Log in
                    </button>
                )}

                <p className="text-xs text-gray-300 text-center mt-2 cursor-pointer">
                    {isSignUp ? (
                        <>
                            Already have an account?{' '}
                            <span className="underline text-indigo-500" onClick={() => {
                                setIsSignUp(false);
                                resetForm();
                            }}>Log in</span>
                        </>
                    ) : (
                        <>
                            Don’t have an account?{' '}
                            <span className="underline text-indigo-500" onClick={() => {
                                setIsSignUp(true);
                                resetForm();
                            }}>Sign up</span>
                        </>
                    )}
                </p>
            </form>
        </main>
    )
}