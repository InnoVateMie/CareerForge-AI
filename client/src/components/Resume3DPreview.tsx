import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text, MeshDistortMaterial, PerspectiveCamera, ContactShadows, HemisphereLight } from "@react-three/drei";
import { useRef, Suspense } from "react";
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
        <Float speed={3} rotationIntensity={0.4} floatIntensity={0.6}>
            <mesh ref={meshRef} castShadow receiveShadow>
                <planeGeometry args={[3, 4, 32, 32]} />
                <MeshDistortMaterial
                    color="#ffffff"
                    speed={2}
                    distort={0.15}
                    radius={1}
                />
                <Text
                    position={[0, 1.2, 0.01]}
                    fontSize={0.22}
                    color="#1e1b4b"
                    anchorX="center"
                    anchorY="middle"
                >
                    CAREER FORGE AI
                </Text>
                <Text
                    position={[-1.2, 0.8, 0.01]}
                    fontSize={0.12}
                    color="#4338ca"
                    maxWidth={2.5}
                    anchorX="left"
                    anchorY="top"
                >
                    Executive Profile
                </Text>
                {/* Decorative border */}
                <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[3.05, 4.05]} />
                    <meshBasicMaterial color="#4f46e5" transparent opacity={0.3} />
                </mesh>
            </mesh>
        </Float>
    );
}

export function Resume3DPreview() {
    return (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50/50 via-background to-blue-50/50 border border-primary/10 relative">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Professional Profile Architecture</h3>
            </div>

            <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">Initializing Visualization...</div>}>
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 0, 6]} />

                    {/* Reliable Offline Lighting */}
                    <ambientLight intensity={1.2} />
                    <hemisphereLight intensity={0.5} strokeColor="#ffffff" groundColor="#4338ca" />
                    <pointLight position={[10, 10, 10]} intensity={2} castShadow />
                    <spotLight position={[-10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} castShadow />

                    <ResumeSheet />

                    <ContactShadows
                        position={[0, -2.5, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2.5}
                        far={4}
                    />

                    <OrbitControls
                        enableZoom={false}
                        makeDefault
                        autoRotate
                        autoRotateSpeed={1.2}
                        minPolarAngle={Math.PI / 2.5}
                        maxPolarAngle={Math.PI / 1.5}
                    />

                    {/* @ts-ignore */}
                    <gridHelper args={[20, 20, 0x4338ca, 0xe0e7ff]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -2.5]} opacity={0.05} transparent />
                </Canvas>
            </Suspense>
        </div>
    );
}
