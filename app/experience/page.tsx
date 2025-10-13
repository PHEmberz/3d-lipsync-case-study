'use client';

import Login from "@/app/components/Login";
import {useEffect, useState} from "react";
import Chat from "@/app/components/Chat";

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
        // Local storage listener
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <div id='experience'>
            {!isLogin ? (
                <Login />
            ):(
                <Chat />
            )}
        </div>
    );
};

export default Experience;