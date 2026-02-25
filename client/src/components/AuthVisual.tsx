import { motion } from "framer-motion";

export function AuthVisual() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-[#080a10]">
            {/* Cinematic Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src="/Cinematic.mp4"
            />

            {/* Darkening vignette overlay — keeps text legible */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    background:
                        "linear-gradient(to top, rgba(8,10,20,0.92) 0%, rgba(8,10,20,0.45) 50%, rgba(8,10,20,0.3) 100%)",
                }}
            />

            {/* Subtle colour tint overlay for brand feel */}
            <div
                className="absolute inset-0 z-10 opacity-30"
                style={{
                    background:
                        "radial-gradient(circle at 20% 80%, #4338ca 0%, transparent 55%), radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 55%)",
                    mixBlendMode: "screen",
                }}
            />

            {/* Narrative Content */}
            <div className="absolute bottom-12 left-12 z-20 max-w-sm hidden lg:block text-left">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="h-1 w-12 bg-primary mb-6 rounded-full" />
                    <h2 className="text-4xl font-bold text-white mb-4 font-display leading-tight tracking-tight">
                        Connect to the <br />
                        <span className="text-gradient">Future of Work</span>
                    </h2>
                    <p className="text-slate-300 leading-relaxed text-lg font-light">
                        Our AI-driven engine provides real-time career synthesis and strategic gap analysis for the modern professional.
                    </p>
                </motion.div>
            </div>

            {/* Animated film-grain texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
