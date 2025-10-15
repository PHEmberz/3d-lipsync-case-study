'use client';
import { useEffect, useState, useCallback } from "react";
import Scene from "@/app/components/Scene";
import { AvatarHandle } from "@/app/components/Avatar";

// Global avatar reference that can be accessed by Chat component
export let globalAvatarRef: AvatarHandle | null = null;
export let globalAvatarNumber: number = 1;

// Define spawn points with position and rotation
type SpawnPoint = {
    position: [number, number, number];
    rotation: [number, number, number]; // [x, y, z] in radians
};

const SPAWN_POINTS: SpawnPoint[] = [
    { position: [-3, 4.4, -2], rotation: [0, 0, 0] },
    { position: [-4, 4.4, 0], rotation: [0, 0, 0] },
    { position: [0, 4.4, -2], rotation: [0, 0, 0] },
    { position: [1, 4.4, -2], rotation: [0, 0, 0] },
    { position: [2, 4.4, -2], rotation: [0, 0, 0] },
    { position: [3, 4.4, -2], rotation: [0, 0, 0] },
    { position: [4, 4.4, -2], rotation: [0, 0, 0] },
    { position: [2.5, 4.4, 2], rotation: [0, -Math.PI / 2, 0] },
    { position: [1, 4.4, 3], rotation: [0, -Math.PI / 2, 0] },
    { position: [3.5, 4.4, 3.5], rotation: [0, -Math.PI / 2, 0] },
];

const SceneWrapper = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [avatarNumber, setAvatarNumber] = useState(1);
    const [avatarPosition, setAvatarPosition] = useState<[number, number, number]>([-3, 4.4, -2]);
    const [avatarRotation, setAvatarRotation] = useState<[number, number, number]>([0, 0, 0]);

    const handleAvatarReady = useCallback((avatar: AvatarHandle | null) => {
        globalAvatarRef = avatar;
    }, []);

    // Update global avatar number when it changes
    useEffect(() => {
        globalAvatarNumber = avatarNumber;
    }, [avatarNumber]);

    // Get random spawn point
    const getRandomSpawnPoint = (): SpawnPoint => {
        return SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
    };

    useEffect(() => {
        // Check login status and assign avatar
        const checkLoginStatus = () => {
            const username = localStorage.getItem('username');
            const sessionId = localStorage.getItem('sessionId');
            const avatarNum = localStorage.getItem('avatarNumber');
            const isLoggedIn = !!(username && sessionId);

            // If user is logged in, assign avatar, position, and rotation
            if (isLoggedIn) {
                // Get or create avatar number (persisted across refreshes)
                let newAvatarNum = avatarNum;
                if (!newAvatarNum) {
                    // First time login - assign random avatar
                    newAvatarNum = String(Math.floor(Math.random() * 6) + 1);
                    localStorage.setItem('avatarNumber', newAvatarNum);
                }

                const parsedAvatarNum = parseInt(newAvatarNum);
                setAvatarNumber(parsedAvatarNum);

                // Always get random position on page load or login
                const spawnPoint = getRandomSpawnPoint();
                setAvatarPosition(spawnPoint.position);
                setAvatarRotation(spawnPoint.rotation);

                // Set login state AFTER all avatar data is set
                setIsLogin(true);
            } else {
                setIsLogin(false);
            }
        };

        // Initial check with a small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            checkLoginStatus();
        }, 50);

        // Listen for storage changes (works across tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'username' || e.key === 'sessionId' || e.key === 'avatarNumber') {
                checkLoginStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Listen for custom event when login happens (works in same tab)
        const handleLoginEvent = () => {
            // Add a delay to ensure localStorage is fully updated
            setTimeout(() => {
                checkLoginStatus();
            }, 150);
        };
        window.addEventListener('login', handleLoginEvent);

        // Listen for logout event
        const handleLogoutEvent = () => {
            setIsLogin(false);
            setAvatarNumber(1);
        };
        window.addEventListener('logout', handleLogoutEvent);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('login', handleLoginEvent);
            window.removeEventListener('logout', handleLogoutEvent);
        };
    }, []);

    return <Scene showAvatar={isLogin} avatarNumber={avatarNumber} avatarPosition={avatarPosition} avatarRotation={avatarRotation} onAvatarReady={handleAvatarReady} />;
};

export default SceneWrapper;