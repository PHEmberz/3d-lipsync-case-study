'use client';

import Login from "@/app/components/Login";
import {useEffect, useState} from "react";

const Experience = () => {
    const [isLogin, setIsLogin] = useState(false);

    // Check login status function
    const checkLoginStatus = () => {
        const userName = localStorage.getItem('userName');
        const sessionId = localStorage.getItem('sessionId');
        setIsLogin(!!(userName && sessionId));
    };


    // Check if user login in real time
    useEffect(() => {
        checkLoginStatus();
        // Handle login status when local storage is changed
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'userName' || e.key === 'sessionId') {
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
            {!isLogin && (
                <Login />
            )}
        </div>
    );
};

export default Experience;