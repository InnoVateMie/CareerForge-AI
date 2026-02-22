import { motion } from "framer-motion";
import { Sparkles, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/dashboard" />;

  const features = [
    { title: "AI-Powered Resumes", description: "Instantly generate professional resumes tailored to your target job using advanced AI." },
    { title: "Targeted Cover Letters", description: "Craft compelling narratives that highlight your unique strengths and cultural fit." },
    { title: "Job Match Optimizer", description: "Compare your resume against job descriptions to identify missing keywords and gaps." },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-200 relative overflow-hidden flex flex-col">
      <ThreeBackground />
      
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">CareerForge <span className="text-primary">AI</span></span>
        </div>
        <div>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="rounded-full px-6 font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
          >
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1 relative z-20 flex flex-col items-center justify-center px-4 pt-12 pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 text-sm font-medium text-cyan-200 border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Career Building Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight tracking-tight mb-6 text-white">
              Forge your dream career with <br />
              <span className="text-gradient">Intelligent Precision</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop guessing what recruiters want. Our AI analyzes job descriptions, highlights your best traits, and generates perfect resumes in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={() => window.location.href = "/api/login"}
                size="lg" 
                className="rounded-full px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1 w-full sm:w-auto text-white"
              >
                Get Started Free
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl text-left hover:-translate-y-2 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 text-primary">
                  {i === 0 ? <FileText className="w-6 h-6" /> : i === 1 ? <Sparkles className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-display">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
