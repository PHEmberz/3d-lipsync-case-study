'use client';
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Lipsync } from "wawa-lipsync";

interface AvatarProps {
    avatarNumber?: number; // 1-6
    position?: [number, number, number];
    rotation?: [number, number, number]; // Euler angles in radians
    scale?: number;
}

export interface AvatarHandle {
    speak: (audioElement: HTMLAudioElement) => void;
    stopSpeaking: () => void;
}

const Avatar = forwardRef<AvatarHandle, AvatarProps>(({
    avatarNumber = 1,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1
}, ref) => {
    const avatarPath = `/avatars/avatar${avatarNumber}.glb`;
    const { scene } = useGLTF(avatarPath);
    const headMeshesRef = useRef<THREE.SkinnedMesh[]>([]);
    const lipsyncRef = useRef<Lipsync | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize lipsync
        lipsyncRef.current = new Lipsync();

        // Clear previous meshes
        headMeshesRef.current = [];

        // Enable shadows and find ALL meshes with morph targets
        scene.traverse((object: THREE.Object3D) => {
            if ((object as THREE.Mesh).isMesh) {
                const mesh = object as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                // Find meshes with morph targets for facial animation
                if (mesh instanceof THREE.SkinnedMesh && mesh.morphTargetDictionary) {
                    headMeshesRef.current.push(mesh);
                }
            }
        });
    }, [scene, avatarNumber]);

    // Expose speak method to parent
    useImperativeHandle(ref, () => ({
        speak: (audioElement: HTMLAudioElement) => {
            audioRef.current = audioElement;
            if (lipsyncRef.current) {
                lipsyncRef.current.connectAudio(audioElement);
            }
        },
        stopSpeaking: () => {
            audioRef.current = null;
            // Reset all meshes' morph targets
            headMeshesRef.current.forEach(mesh => {
                if (mesh.morphTargetInfluences) {
                    for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
                        mesh.morphTargetInfluences[i] = 0;
                    }
                }
            });
        }
    }));

    // Update lipsync every frame
    useFrame(() => {
        if (!audioRef.current || !lipsyncRef.current || headMeshesRef.current.length === 0) {
            // When not speaking, ensure mouth is closed on all meshes
            headMeshesRef.current.forEach(mesh => {
                if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                    const mouthOpen = mesh.morphTargetDictionary['mouthOpen'] ?? mesh.morphTargetDictionary['jawOpen'] ?? mesh.morphTargetDictionary['mouth_open'];
                    if (mouthOpen !== undefined) {
                        mesh.morphTargetInfluences[mouthOpen] = 0;
                    }
                }
            });
            return;
        }

        // Process audio and get viseme
        lipsyncRef.current.processAudio();

        // Apply morph targets to ALL meshes with mouthOpen
        if (lipsyncRef.current.features) {
            const volume = lipsyncRef.current.features.volume;
            const morphValue = Math.min(volume * 3, 1);

            headMeshesRef.current.forEach(mesh => {
                if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                    const mouthOpen = mesh.morphTargetDictionary['mouthOpen'] ?? mesh.morphTargetDictionary['jawOpen'] ?? mesh.morphTargetDictionary['mouth_open'];

                    if (mouthOpen !== undefined) {
                        mesh.morphTargetInfluences[mouthOpen] = morphValue;
                    }
                }
            });
        }
    });

    return (
        <primitive object={scene} position={position} rotation={rotation} scale={scale} />
    );
});

Avatar.displayName = 'Avatar';

// Preload all avatar models
[1, 2, 3, 4, 5, 6].forEach((num) => {
    useGLTF.preload(`/avatars/avatar${num}.glb`);
});

export default Avatar;