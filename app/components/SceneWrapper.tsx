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
            const isLoggedIn = !!(username && sessionId);

            setIsLogin(isLoggedIn);

            // If user is logged in, assign avatar, position, and rotation
            if (isLoggedIn) {
                // Get or create avatar number (persisted across refreshes)
                let avatarNum = localStorage.getItem('avatarNumber');
                if (!avatarNum) {
                    // First time login - assign random avatar
                    avatarNum = String(Math.floor(Math.random() * 6) + 1);
                    localStorage.setItem('avatarNumber', avatarNum);
                }
                setAvatarNumber(parseInt(avatarNum));

                // Always get random position on page load
                const spawnPoint = getRandomSpawnPoint();
                setAvatarPosition(spawnPoint.position);
                setAvatarRotation(spawnPoint.rotation);
            }
        };

        checkLoginStatus();

        // Listen for storage changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'username' || e.key === 'sessionId') {
                checkLoginStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Listen for custom event when login happens to assign random avatar
        const handleLoginEvent = () => {
            checkLoginStatus();
        };
        window.addEventListener('login', handleLoginEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('login', handleLoginEvent);
        };
    }, []);

    return <Scene showAvatar={isLogin} avatarNumber={avatarNumber} avatarPosition={avatarPosition} avatarRotation={avatarRotation} onAvatarReady={handleAvatarReady} />;
};

export default SceneWrapper;