import React, { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, ArrowLeft, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthVisual } from "@/components/AuthVisual";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";

export default function AuthPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = isLogin
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password });

            if (error) throw error;

            console.log(`[auth] ${isLogin ? 'Login' : 'Signup'} successful`);
            if (!isLogin) {
                toast({
                    title: "Registration successful!",
                    description: "Please check your email to confirm your account.",
                });
            } else {
                setLocation("/dashboard");
            }
        } catch (error: any) {
            console.error("[auth] Error details:", error);

            let errorMessage = error.message || "An unexpected error occurred.";
            let errorTitle = "Authentication Error";

            // Specific handling for common Supabase Email Provider limits
            if (error.message?.includes("Email link is invalid or has expired") ||
                error.message?.includes("Error sending confirmation mail")) {
                errorTitle = "Email Verification Limit";
                errorMessage = "We're having trouble sending your confirmation email. This usually happens when the daily email limit is reached. Please wait a few minutes or contact support.";
            }

            toast({
                title: errorTitle,
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0B10] flex overflow-hidden">
            {/* Left Side: 3D Visual */}
            <div className="hidden lg:block lg:w-1/2 h-screen relative">
                <AuthVisual />
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Mobile Background */}
                <div className="absolute inset-0 lg:hidden opacity-20 pointer-events-none">
                    <AuthVisual />
                </div>

                <div className="w-full max-w-md relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-2 mb-12 justify-center lg:justify-start">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-display font-bold text-2xl tracking-tight text-white">CareerForge <span className="text-primary">AI</span></span>
                        </div>

                        <motion.div
                            animate={{
                                scale: [1, 1.01, 1],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative"
                        >
                            {/* Animated Border Glow */}
                            <div className="absolute -inset-[2px] bg-gradient-to-br from-primary/50 via-transparent to-accent/50 opacity-20 rounded-3xl -z-10" />

                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2 font-display">
                                    {isLogin ? "Welcome Back" : "Create Account"}
                                </h1>
                                <p className="text-slate-400">
                                    {isLogin
                                        ? "Enter your credentials to access your workshop."
                                        : "Join the thousands forging their future today."}
                                </p>
                            </div>

                            {!isSupabaseConfigured && (
                                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-200/80 leading-relaxed">
                                        <strong className="text-amber-500 block mb-1">Configuration Needed</strong>
                                        Supabase keys are missing in your <code>.env</code> file. Authentication will not work until these are provided.
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleAuth} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            placeholder="name@example.com"
                                            className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:ring-primary/50 focus:border-primary/50 rounded-xl transition-all"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            autoComplete={isLogin ? "current-password" : "new-password"}
                                            className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:ring-primary/50 focus:border-primary/50 rounded-xl transition-all"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {isLogin && (
                                    <div className="text-right">
                                        <a href="#" className="text-xs text-primary hover:text-primary-foreground transition-colors">Forgot password?</a>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                            <span>{isLogin ? "Sign In" : "Register Now"}</span>
                                        </>
                                    )}
                                </Button>
                                {!isLogin && (
                                    <p className="text-[10px] text-center text-slate-500 mt-2 px-4 italic">
                                        Note: Confirmation email might take a few moments. If it fails, please wait or try again later.
                                    </p>
                                )}
                            </form>

                            <div className="mt-8 pt-8 border-t border-white/10 text-center">
                                <p className="text-slate-400 text-sm">
                                    {isLogin ? "Don't have an account?" : "Already a member?"}{" "}
                                    <button
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="text-primary font-bold hover:underline"
                                    >
                                        {isLogin ? "Sign Up Free" : "Log In Here"}
                                    </button>
                                </p>
                            </div>
                        </motion.div>

                        <Button
                            variant="ghost"
                            className="mt-8 text-slate-500 hover:text-white w-full flex items-center justify-center gap-2 transition-colors"
                            onClick={() => setLocation("/")}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Exploration
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
