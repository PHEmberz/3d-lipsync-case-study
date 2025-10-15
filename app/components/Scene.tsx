'use client';
import {ContactShadows, Environment, Preload} from "@react-three/drei";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {Suspense, useEffect, useRef, forwardRef, useImperativeHandle} from "react";
import {Room} from "@/app/components/Room";
import Avatar, { AvatarHandle } from "@/app/components/Avatar";
import * as THREE from "three";

interface SceneProps {
    showAvatar?: boolean;
    avatarNumber?: number;
    avatarPosition?: [number, number, number];
    avatarRotation?: [number, number, number];
    onAvatarReady?: (avatar: AvatarHandle | null) => void;
}

const Scene = ({ showAvatar = false, avatarNumber = 1, avatarPosition = [-3, 4.4, -2], avatarRotation = [0, 0, 0], onAvatarReady }: SceneProps) => {
    // Use callback ref to get notified when the Avatar ref is set
    const avatarRef = useRef<AvatarHandle>(null);
    const onAvatarReadyRef = useRef(onAvatarReady);

    useEffect(() => {
        onAvatarReadyRef.current = onAvatarReady;
    }, [onAvatarReady]);

    const handleAvatarRef = (instance: AvatarHandle | null) => {
        avatarRef.current = instance;
        if (onAvatarReadyRef.current) {
            onAvatarReadyRef.current(instance);
        }
    };

    useEffect(() => {
        if (!showAvatar && onAvatarReadyRef.current) {
            onAvatarReadyRef.current(null);
        }
    }, [showAvatar]);
    // Parallax camera
    const LOOK_AT: [number, number, number] = [1.56, 4.13, -2];
    function CameraParallax({
                                strength = 0.6,
                                smooth = 0.08,
                                limit = 0.3
                            }: { strength?: number; smooth?: number; limit?: number }) {
        const { camera } = useThree();
        const base = useRef(new THREE.Vector3());
        const targetX = useRef(0);

        useEffect(() => {
            base.current.copy(camera.position);

            const onMove = (e: PointerEvent) => {
                const x = (e.clientX / window.innerWidth) * 2 - 1;
                targetX.current = THREE.MathUtils.clamp(x, -1, 1);
            };

            window.addEventListener('pointermove', onMove, { passive: true });
            return () => window.removeEventListener('pointermove', onMove);
        }, [camera]);

        useFrame(() => {
            const dx = THREE.MathUtils.clamp(targetX.current * strength, -limit, limit);
            const goal = new THREE.Vector3(base.current.x + dx, base.current.y, base.current.z);
            camera.position.lerp(goal, smooth);
            camera.lookAt(...LOOK_AT);
        });

        return null;
    }
    return (
        <Canvas
            shadows
            camera={{ position: [-4.15, 6.3, 3.5], fov: 60 }}
            onCreated={({camera}) => {
                camera.lookAt(...LOOK_AT);
            }}
        >
            <CameraParallax />
            <ambientLight intensity={0.3} />
            <directionalLight position={[0,0,0]} intensity={1} castShadow />
            <Suspense fallback={null}>
                <Room />
                {showAvatar && (
                    <Avatar
                        ref={handleAvatarRef}
                        avatarNumber={avatarNumber}
                        position={avatarPosition}
                        rotation={avatarRotation}
                        scale={1}
                    />
                )}
                <Environment preset="apartment" />
                <ContactShadows opacity={0.35} scale={10} blur={2.5} far={4} />
                <Preload all />
            </Suspense>
        </Canvas>

    );
};

export default Scene;