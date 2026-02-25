import { motion } from "framer-motion";
import {
  Sparkles, FileText, Layout, TrendingUp, Zap, Shield,
  Star, Check, ArrowRight, Quote, Crown, Rocket, Leaf
} from "lucide-react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Button3D } from "@/components/Button3D";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import React from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/dashboard" />;

  /* ───── DATA ───── */

  const features = [
    {
      title: "AI-Powered Resumes",
      description: "Generate polished, ATS-optimized resumes in seconds. The AI tailors every bullet point to the specific role you're chasing.",
      icon: FileText, color: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/30",
    },
    {
      title: "Cover Letter Engine",
      description: "Craft compelling narratives that highlight your unique strengths, cultural fit, and genuine enthusiasm for every application.",
      icon: Sparkles, color: "from-purple-500 to-pink-500", glow: "shadow-purple-500/30",
    },
    {
      title: "Job Match Optimizer",
      description: "Score your resume against any job description and receive precise keyword and skill-gap recommendations.",
      icon: Layout, color: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/30",
    },
    {
      title: "Career Trajectory Insights",
      description: "Understand where you stand in the market. Get data-driven feedback on your career arc and what your next move should be.",
      icon: TrendingUp, color: "from-amber-500 to-orange-500", glow: "shadow-amber-500/30",
    },
    {
      title: "ATS-First Export",
      description: "One-click PDF export with structured metadata that guarantees your document passes any tracking system filter.",
      icon: Zap, color: "from-rose-500 to-red-500", glow: "shadow-rose-500/30",
    },
    {
      title: "Bank-Grade Privacy",
      description: "End-to-end encryption and zero data-selling policy. Your career data belongs only to you — always.",
      icon: Shield, color: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/30",
    },
  ];

  const testimonials = [
    {
      name: "Amara Osei",
      role: "Senior Product Manager @ Google",
      avatar: "AO",
      avatarColor: "from-pink-500 to-rose-500",
      stars: 5,
      quote: "I landed 3 interviews in my first week using CareerForge. The Job Match Optimizer was a game-changer — it told me exactly which keywords I was missing before I even applied.",
    },
    {
      name: "Liam Martinez",
      role: "Software Engineer @ Stripe",
      avatar: "LM",
      avatarColor: "from-blue-500 to-cyan-500",
      stars: 5,
      quote: "The resume it generated for me was miles ahead of what I had. Structured, keyword-rich, and visually polished. It felt like it was written by a professional recruiter who knew my field inside out.",
    },
    {
      name: "Fatima Al-Hassan",
      role: "Data Scientist @ Microsoft",
      avatar: "FA",
      avatarColor: "from-emerald-500 to-teal-500",
      stars: 5,
      quote: "As someone pivoting from academia, I had no idea how to present my PhD work for industry roles. CareerForge translated my research into business value instantly. I got my dream job in 6 weeks.",
    },
    {
      name: "James Okonkwo",
      role: "UX Lead @ Shopify",
      avatar: "JO",
      avatarColor: "from-amber-500 to-orange-500",
      stars: 5,
      quote: "The cover letter generator is exceptional. Every letter felt personal and on-brand. My recruiter literally said my cover letter was one of the best she'd ever read.",
    },
    {
      name: "Priya Nair",
      role: "Finance Analyst @ JPMorgan",
      avatar: "PN",
      avatarColor: "from-violet-500 to-purple-500",
      stars: 5,
      quote: "I was skeptical about AI-generated content being too generic. CareerForge completely changed my mind. The tailoring is genuinely impressive — totally specific to my experience and target role.",
    },
    {
      name: "David Chen",
      role: "Marketing Director @ HubSpot",
      avatar: "DC",
      avatarColor: "from-indigo-500 to-blue-500",
      stars: 5,
      quote: "The Interview Coach feature helped me go into every interview feeling prepared. The STAR-method feedback was detailed and actionable. Worth every single penny.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      icon: Leaf,
      price: "Free",
      priceNote: "Forever",
      color: "from-slate-700 to-slate-800",
      borderColor: "border-white/10",
      badge: null,
      cta: "Get Started",
      ctaStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
      features: [
        "3 AI Resume Generations / mo",
        "3 Cover Letter Generations / mo",
        "Basic Job Match Scoring",
        "PDF Export",
        "Community Support",
      ],
      missing: ["Interview Coach", "Unlimited Documents", "Priority AI Queue"],
    },
    {
      name: "Pro",
      icon: Rocket,
      price: "$12",
      priceNote: "per month",
      color: "from-primary to-violet-600",
      borderColor: "border-primary/50",
      badge: "Most Popular",
      cta: "Start Free Trial",
      ctaStyle: "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/40",
      features: [
        "Unlimited AI Resume Generations",
        "Unlimited Cover Letters",
        "Advanced Job Match Optimizer",
        "AI Interview Coach (STAR Method)",
        "Priority AI Processing",
        "PDF & Word Export",
        "Email Support",
      ],
      missing: ["Team Seats", "White-label Export"],
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: "$49",
      priceNote: "per month",
      color: "from-amber-500 to-orange-600",
      borderColor: "border-amber-500/30",
      badge: "Best Value",
      cta: "Contact Sales",
      ctaStyle: "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white shadow-lg shadow-amber-500/30",
      features: [
        "Everything in Pro",
        "Up to 10 Team Seats",
        "White-label Resume Export",
        "Dedicated Account Manager",
        "Custom AI Prompt Tuning",
        "Analytics Dashboard",
        "SLA Support (24h response)",
      ],
      missing: [],
    },
  ];

  return (
    <div className="dark min-h-screen bg-[#0A0B10] text-slate-200 relative overflow-hidden font-sans">
      <ThreeBackground />

      {/* ─── NAV ─── */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            CareerForge <span className="text-primary">AI</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#testimonials" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Testimonials</a>
          <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</a>
        </nav>
        <Button
          onClick={() => window.location.href = "/auth"}
          className="rounded-full px-6 font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
        >
          Sign In
        </Button>
      </header>

      {/* ─── HERO ─── */}
      <main className="relative z-20 flex flex-col items-center px-4 pt-16 pb-0">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8 text-sm font-medium text-primary backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Career Building Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight tracking-tight mb-6 text-white">
              Forge your dream career with <br />
              <span className="text-gradient">Intelligent Precision</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Stop guessing what recruiters want. Our AI analyzes job descriptions, highlights your strengths, and generates perfect resumes in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button3D text="Get Started Free" onClick={() => window.location.href = "/auth"} />
              <a href="#features" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group">
                See how it works <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 mb-4 text-xs text-slate-500">
              {["10,000+ Professionals", "500+ Companies Hired", "4.9★ Average Rating", "No Credit Card Required"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── FEATURES ─── */}
        <section id="features" className="w-full max-w-6xl mx-auto mt-32 px-4">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Everything you need</span>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-5">
              Built for the modern job seeker
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Six intelligent tools working together to give you an unfair advantage in any job market.
            </p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={i} variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/5 hover:border-white/15 p-8 rounded-2xl text-left overflow-hidden transition-colors cursor-default"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.04] transition-opacity rounded-2xl`} />
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-xl ${f.glow} group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-display">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors text-sm">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section id="testimonials" className="w-full max-w-6xl mx-auto mt-36 px-4">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Loved by professionals</span>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-5">
              Real results, real people
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              From fresh graduates to senior directors — CareerForge has helped thousands land the roles they deserve.
            </p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i} variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative bg-slate-900/50 backdrop-blur-xl border border-white/5 hover:border-white/15 p-7 rounded-2xl text-left transition-all overflow-hidden"
              >
                {/* decorative quote mark */}
                <Quote className="absolute top-5 right-6 w-8 h-8 text-white/5" />

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-slate-300 leading-relaxed text-sm mb-6 italic">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3 mt-auto">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── PRICING ─── */}
        <section id="pricing" className="w-full max-w-6xl mx-auto mt-36 px-4 pb-32">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Simple, transparent pricing</span>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-5">
              Invest in your career
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Start free, upgrade when you're ready. No hidden fees, no dark patterns.
            </p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
          >
            {plans.map((plan, i) => (
              <motion.div
                key={i} variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`relative bg-slate-900/50 backdrop-blur-xl border ${plan.borderColor} rounded-2xl p-8 text-left overflow-hidden transition-all ${plan.name === "Pro" ? "md:-mt-4 md:pb-12 shadow-2xl shadow-primary/20" : ""}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${plan.color} shadow-lg`}>
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1 font-display">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm">/ {plan.priceNote}</span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => window.location.href = "/auth"}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all mb-8 ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>

                {/* Feature list */}
                <ul className="space-y-3">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                  {plan.missing.map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-sm text-slate-600 line-through">
                      <Check className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Money-back note */}
          <motion.p
            custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center text-slate-600 text-sm mt-10"
          >
            All paid plans come with a <span className="text-slate-400 font-semibold">14-day money-back guarantee</span>. No questions asked.
          </motion.p>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-20 border-t border-white/5 bg-black/20 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                CareerForge <span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Empowering professionals to reach their full potential through intelligent document generation and career insights.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-slate-500 hover:text-primary transition-colors text-sm">Features</a></li>
              <li><a href="#pricing" className="text-slate-500 hover:text-primary transition-colors text-sm">Pricing</a></li>
              <li><a href="#testimonials" className="text-slate-500 hover:text-primary transition-colors text-sm">Testimonials</a></li>
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
          <p className="text-slate-600 text-xs">© 2026 CareerForge AI. All rights reserved.</p>
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
