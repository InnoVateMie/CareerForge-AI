import { motion } from "framer-motion";
import { Sparkles, FileText, CheckCircle2, ChevronRight, Layout, Target } from "lucide-react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import React from "react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/dashboard" />;

  const features = [
    { title: "AI-Powered Resumes", description: "Instantly generate professional resumes tailored to your target job using advanced AI models.", icon: FileText },
    { title: "Targeted Cover Letters", description: "Craft compelling narratives that highlight your unique strengths and cultural fit for every application.", icon: Sparkles },
    { title: "Job Match Optimizer", description: "Compare your resume against job descriptions to identify missing keywords and critical gaps.", icon: Layout },
    { title: "Smart Formatting", description: "Export beautifully formatted PDFs that are guaranteed to pass through Applicant Tracking Systems (ATS).", icon: CheckCircle2 },
    { title: "Career Insights", description: "Receive personalized feedback on your career trajectory based on current market trends and data.", icon: ChevronRight },
    { title: "Unlimited Revisions", description: "Refine your documents as many times as you need until they're perfect for your dream role.", icon: Target },
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
        <div className="hidden md:flex items-center gap-8 mr-8">
          <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#testimonials" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Testimonials</a>
          <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
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

          <section id="features" className="mt-32">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {features.map((feature, i) => (
                <div key={i} className="glass-panel p-8 rounded-2xl text-left hover:-translate-y-2 transition-all duration-300">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 text-primary">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-display">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </motion.div>
          </section>
        </div>
      </main>

      <footer className="relative z-20 border-t border-white/5 bg-black/20 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">CareerForge <span className="text-primary">AI</span></span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Empowering professionals to reach their full potential through intelligent document generation and career insights.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-slate-500 hover:text-primary transition-colors text-sm">Features</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">Templates</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">About</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">Privacy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">Terms</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Connect</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">Twitter</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">LinkedIn</a></li>
              <li><a href="#" className="text-slate-500 hover:text-primary transition-colors text-sm">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">
            © 2026 CareerForge AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-600 hover:text-white transition-colors text-xs">Privacy Policy</a>
            <a href="#" className="text-slate-600 hover:text-white transition-colors text-xs">Terms of Service</a>
            <a href="#" className="text-slate-600 hover:text-white transition-colors text-xs">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
