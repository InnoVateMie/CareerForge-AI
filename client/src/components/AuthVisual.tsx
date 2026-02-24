import React, { useRef, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars, PerspectiveCamera, useTexture } from "@react-three/drei";
// @ts-ignore - Ghost error: IDE out of sync with successful tsc build. Reset TS server (Ctrl+Shift+P) to clear permanently.
import { motion } from "framer-motion";
import * as THREE from "three";

const TEXTURE_URLS = [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800"
];

function AtmosphericVisual() {
    const sphereRef = useRef<THREE.Mesh>(null);
    const textures = useTexture(TEXTURE_URLS);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % TEXTURE_URLS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useFrame((state) => {
        // @ts-ignore - Modern Three.js property access
        const time = state.clock.elapsedTime || state.clock.getElapsedTime();
        if (sphereRef.current) {
            sphereRef.current.rotation.x = time * 0.1;
            sphereRef.current.rotation.y = time * 0.15;

            // Gentle mouse tracking
            const mouseX = state.mouse.x * 0.4;
            const mouseY = state.mouse.y * 0.4;
            sphereRef.current.position.x = THREE.MathUtils.lerp(sphereRef.current.position.x, mouseX, 0.05);
            sphereRef.current.position.y = THREE.MathUtils.lerp(sphereRef.current.position.y, mouseY, 0.05);
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ff2e63" />

            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                <Sphere ref={sphereRef} args={[1.8, 64, 64]}>
                    <MeshDistortMaterial
                        map={textures[index]}
                        color="#ffffff"
                        speed={1.5}
                        distort={0.4}
                        metalness={0.4}
                        roughness={0.2}
                        emissive="#4338ca"
                        emissiveIntensity={0.15}
                        transparent
                        opacity={0.9}
                    />
                </Sphere>
            </Float>

            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        </>
    );
}

export function AuthVisual() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-[#0A0B10]">
            {/* Premium Metallic Gradient Background */}
            <div
                className="absolute inset-0 opacity-40 z-0"
                style={{
                    background: "radial-gradient(circle at 20% 30%, #4338ca 0%, transparent 50%), radial-gradient(circle at 80% 70%, #ff2e63 0%, transparent 50%)",
                    filter: "blur(80px)"
                }}
            />

            {/* 3D Scene Overlay */}
            <div className="w-full h-full relative z-10">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                    <Suspense fallback={null}>
                        <AtmosphericVisual />
                    </Suspense>
                </Canvas>
            </div>

            {/* Narrative Content */}
            <div className="absolute bottom-12 left-12 z-20 max-w-sm hidden lg:block text-left">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <div className="h-1 w-12 bg-primary mb-6" />
                    <h2 className="text-4xl font-bold text-white mb-4 font-display leading-tight tracking-tight text-left">
                        Connect to the <br />
                        <span className="text-gradient">Future of Work</span>
                    </h2>
                    <p className="text-slate-400 leading-relaxed text-lg font-light text-left">
                        Our AI-driven engine provides real-time career synthesis and strategic gap analysis for the modern professional.
                    </p>
                </motion.div>
            </div>

            {/* Animated Overlay Grains */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
