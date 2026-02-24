import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

function BackgroundScene({ hovered }: { hovered: boolean }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={hovered ? 2 : 1} />
            <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                <Sphere args={[1, 32, 32]} scale={2.5}>
                    <MeshDistortMaterial
                        color={hovered ? "#ff2e63" : "#6366f1"}
                        speed={hovered ? 5 : 2}
                        distort={0.4}
                        metalness={1}
                        roughness={0}
                        transparent
                        opacity={0.6}
                    />
                </Sphere>
            </Float>
        </>
    );
}

export function Button3D({ text, onClick }: { text: string; onClick: () => void }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="relative h-[100px] w-full max-w-[320px] flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* 3D Background Effect (Three.js) */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <Suspense fallback={null}>
                        <BackgroundScene hovered={hovered} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Main Premium Button (HTML/CSS for 100% Visibility) */}
            <motion.button
                onClick={onClick}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 w-full py-5 rounded-2xl font-bold text-xl text-white tracking-wide shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group"
                style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #ff2e63 100%)",
                    boxShadow: hovered
                        ? "0 20px 40px -10px rgba(99, 102, 241, 0.5), 0 0 20px rgba(255, 46, 99, 0.3)"
                        : "0 10px 20px -5px rgba(0, 0, 0, 0.5)",
                }}
            >
                {/* Shine Effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                <span className="relative z-10">{text}</span>
                <motion.div
                    animate={{ x: hovered ? 5 : 0 }}
                    transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                >
                    <ChevronRight className="w-6 h-6" />
                </motion.div>
            </motion.button>

            {/* Outer Glow */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -inset-4 bg-primary/20 blur-3xl -z-10 rounded-full"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
