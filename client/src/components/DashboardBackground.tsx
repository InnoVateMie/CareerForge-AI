import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "./theme-provider";

function Shape({ color }: { color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.elapsedTime;
            meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
            meshRef.current.rotation.y = Math.cos(time * 0.2) * 0.2;
        }
    });


    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere ref={meshRef} args={[1, 64, 64]} position={[2, -1, -2]}>
                <MeshDistortMaterial
                    color={color}
                    speed={3}
                    distort={0.4}
                    radius={1}
                    transparent
                    opacity={0.15}
                />
            </Sphere>
        </Float>
    );
}

function Grid({ color }: { color: string }) {
    return (
        <gridHelper
            args={[40, 40, color, color]}
            position={[0, -2, 0]}
            rotation={[0, 0, 0]}
            // @ts-ignore - Material props on gridHelper
            transparent
            opacity={0.05}
        />
    );
}

export function DashboardBackground() {
    const { theme } = useTheme();

    const colors = useMemo(() => {
        return theme === "dark"
            ? { primary: "#6366f1", accent: "#ff2e63", grid: "#1e293b" }
            : { primary: "#4f46e5", accent: "#db2777", grid: "#e2e8f0" };
    }, [theme]);

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background transition-colors duration-500">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color={colors.primary} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color={colors.accent} />

                <Shape color={colors.primary} />
                <Grid color={colors.grid} />

                <fog attach="fog" args={[theme === "dark" ? "#0A0B10" : "#F8FAFC", 5, 15]} />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-background opacity-60" />
        </div>
    );
}
