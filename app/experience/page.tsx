'use client';

import Login from "@/app/components/Login";
import {useEffect, useState} from "react";
import Chat from "@/app/components/Chat";
import LogoutButton from "@/app/components/LogoutButton";
import Link from "next/link";

const Experience = () => {
    const [isLogin, setIsLogin] = useState(false);

    // Check login status function
    const checkLoginStatus = () => {
        const username = localStorage.getItem('username');
        const sessionId = localStorage.getItem('sessionId');
        setIsLogin(!!(username && sessionId));
    };


    // Check if user login in real time
    useEffect(() => {
        checkLoginStatus();
        // Handle login status when local storage is changed
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'username' || e.key === 'sessionId') {
                checkLoginStatus();
            }
        };
        // Handle login event (triggered in same window)
        const handleLoginEvent = () => {
            checkLoginStatus();
        };

        // Local storage listener (only works across different tabs/windows)
        window.addEventListener('storage', handleStorageChange);
        // Custom login event listener (works in same window)
        window.addEventListener('login', handleLoginEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('login', handleLoginEvent);
        };
    }, []);

    return (
        <div id='experience'>
            {isLogin && <LogoutButton />}
            {!isLogin && (
                <Link href="/" className="fixed top-6 left-6 z-50 px-6 py-3 rounded-2xl bg-black/50 backdrop-blur-sm text-white font-semibold hover:bg-black/70 transition-all duration-200 shadow-lg hover:shadow-xl">
                    ← Back to Home
                </Link>
            )}
            {!isLogin ? (
                <Login />
            ):(
                <Chat />
            )}
        </div>
    );
};

export default Experience;