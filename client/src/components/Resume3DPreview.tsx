import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function ResumeSheet() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
            meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.05;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <planeGeometry args={[3, 4, 32, 32]} />
                <MeshDistortMaterial
                    color="#ffffff"
                    speed={1}
                    distort={0.1}
                    radius={1}
                />
                <Text
                    position={[0, 1.2, 0.01]}
                    fontSize={0.2}
                    color="#1e293b"
                    font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-EkNo.woff"
                >
                    CAREER FORGE AI
                </Text>
                <Text
                    position={[-1, 0.8, 0.01]}
                    fontSize={0.1}
                    color="#64748b"
                    maxWidth={2}
                    anchorX="left"
                >
                    Senior Frontend Engineer
                </Text>
                <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[3.1, 4.1]} />
                    <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} />
                </mesh>
            </mesh>
        </Float>
    );
}

export function Resume3DPreview() {
    return (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-primary/5 to-accent/5 border border-primary/10 relative">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Interactive Preview</h3>
            </div>
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <ResumeSheet />
                <OrbitControls enableZoom={false} makeDefault />
                {/* @ts-ignore */}
                <gridHelper args={[20, 20, 0x3b82f6, 0x1e293b]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2]} opacity={0.1} transparent />
            </Canvas>
        </div>
    );
}
