import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Rocket, Leaf, Sparkles, Zap } from "lucide-react";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Link } from "wouter";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
    }),
};

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

type Billing = "weekly" | "monthly";

const PLANS = [
    {
        name: "Starter",
        icon: Leaf,
        weekly: 1,
        monthly: 3,
        color: "from-slate-600 to-slate-700",
        borderColor: "border-white/10",
        badge: null,
        highlight: false,
        cta: "Start Now",
        ctaStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
        features: [
            "5 AI Resume Generations / wk",
            "5 Cover Letter Generations / wk",
            "Basic Job Match Scoring",
            "PDF Export",
            "Community Support",
        ],
        missing: ["Interview Coach", "Unlimited Documents", "Priority AI Queue", "Team Seats"],
    },
    {
        name: "Pro",
        icon: Rocket,
        weekly: 5,
        monthly: 15,
        color: "from-primary to-violet-600",
        borderColor: "border-primary/60",
        badge: "Most Popular",
        highlight: true,
        cta: "Start Free Trial",
        ctaStyle: "bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/40",
        features: [
            "Unlimited AI Resume Generations",
            "Unlimited Cover Letters",
            "Advanced Job Match Optimizer",
            "AI Interview Coach (STAR Method)",
            "Priority AI Processing",
            "PDF & Word Export",
            "Email Support",
        ],
        missing: ["Team Seats", "White-label Export", "Dedicated Manager"],
    },
    {
        name: "Enterprise",
        icon: Crown,
        weekly: 10,
        monthly: 35,
        color: "from-amber-500 to-orange-500",
        borderColor: "border-amber-500/40",
        badge: "Best Value",
        highlight: false,
        cta: "Contact Sales",
        ctaStyle: "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white shadow-xl shadow-amber-500/30",
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

const FAQ = [
    { q: "Can I cancel anytime?", a: "Yes — cancel from your account settings at any time. No penalties, no questions." },
    { q: "Is there a free trial?", a: "Pro comes with a 7-day free trial. You won't be charged until the trial ends." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise." },
    { q: "How does yearly billing save money?", a: "Yearly billing gives you ~2 months free compared to paying weekly for a full year." },
    { q: "Can I switch plans later?", a: "Absolutely. Upgrade or downgrade at any time — changes take effect on your next billing cycle." },
    { q: "Is my data safe?", a: "Yes. All data is encrypted at rest and in transit. We never sell your data to third parties." },
];

export default function Pricing() {
    const [billing, setBilling] = useState<Billing>("weekly");

    const monthlySaving = (plan: typeof PLANS[number]) => {
        const weeklyPerMonth = plan.weekly * 4;
        const monthlyCost = plan.monthly;
        const saving = Math.round(((weeklyPerMonth - monthlyCost) / weeklyPerMonth) * 100);
        return saving;
    };

    return (
        <div className="dark min-h-screen bg-[#0A0B10] text-slate-200 relative overflow-hidden font-sans">
            <ThreeBackground />

            {/* Nav */}
            <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <Link href="/">
                        <span className="font-display font-bold text-2xl tracking-tight text-white cursor-pointer">
                            CareerForge <span className="text-primary">AI</span>
                        </span>
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/#features"><span className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">Features</span></Link>
                    <Link href="/testimonials"><span className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">Testimonials</span></Link>
                    <Link href="/pricing"><span className="text-sm font-medium text-white transition-colors cursor-pointer">Pricing</span></Link>
                </nav>
                <Link href="/auth">
                    <button className="rounded-full px-6 py-2 font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-colors text-sm">
                        Sign In
                    </button>
                </Link>
            </header>

            {/* Hero */}
            <section className="relative z-20 text-center px-4 pt-20 pb-14">
                <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Simple, transparent pricing</span>
                    <h1 className="text-5xl md:text-6xl font-bold font-display text-white mb-5 leading-tight">
                        Invest in your <span className="text-gradient">career</span>
                    </h1>
                    <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
                        Start with a plan that fits your pace. Upgrade or cancel anytime — no hidden fees, ever.
                    </p>
                </motion.div>

                {/* Billing Toggle */}
                <motion.div
                    custom={1} variants={fadeUp} initial="hidden" animate="visible"
                    className="flex items-center justify-center gap-4 mt-10"
                >
                    <span className={`text-sm font-semibold transition-colors ${billing === "weekly" ? "text-white" : "text-slate-500"}`}>Weekly</span>
                    <button
                        onClick={() => setBilling(b => b === "weekly" ? "monthly" : "weekly")}
                        className="relative h-7 w-14 rounded-full bg-slate-800 border border-white/10 transition-colors focus:outline-none"
                        aria-label="Toggle billing period"
                    >
                        <motion.div
                            className="absolute top-1 h-5 w-5 rounded-full bg-primary shadow-lg shadow-primary/50"
                            animate={{ left: billing === "weekly" ? "4px" : "calc(100% - 24px)" }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                    <span className={`text-sm font-semibold transition-colors ${billing === "monthly" ? "text-white" : "text-slate-500"}`}>
                        Monthly
                        <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5 font-bold">Save up to 25%</span>
                    </span>
                </motion.div>
            </section>

            {/* Plans */}
            <section className="relative z-20 max-w-6xl mx-auto px-4 pb-24">
                <motion.div
                    variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
                >
                    {PLANS.map((plan, i) => {
                        const price = billing === "weekly" ? plan.weekly : plan.monthly;
                        const period = billing === "weekly" ? "/ week" : "/ month";
                        const saving = billing === "monthly" ? monthlySaving(plan) : null;

                        return (
                            <motion.div
                                key={i} variants={fadeUp}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className={`relative bg-slate-900/60 backdrop-blur-xl border ${plan.borderColor} rounded-2xl p-8 text-left overflow-hidden transition-all ${plan.highlight ? "md:-mt-4 shadow-2xl shadow-primary/20" : ""}`}
                            >
                                {/* Glow for Pro */}
                                {plan.highlight && (
                                    <div className="absolute inset-0 rounded-2xl bg-primary/5 pointer-events-none" />
                                )}

                                {/* Badge */}
                                {plan.badge && (
                                    <div className={`absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${plan.color} shadow-lg`}>
                                        {plan.badge}
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5 shadow-lg`}>
                                    <plan.icon className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1 font-display">{plan.name}</h3>

                                {/* Price */}
                                <div className="flex items-baseline gap-1 mb-2">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={`${plan.name}-${billing}`}
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            transition={{ duration: 0.25 }}
                                            className="text-4xl font-black text-white"
                                        >
                                            ${price}
                                        </motion.span>
                                    </AnimatePresence>
                                    <span className="text-slate-500 text-sm">{period}</span>
                                </div>

                                {saving !== null && saving > 0 && (
                                    <p className="text-emerald-400 text-xs font-semibold mb-4">
                                        <Zap className="w-3 h-3 inline mr-1" />Save ~{saving}% vs weekly
                                    </p>
                                )}

                                {/* CTA */}
                                <button
                                    onClick={() => window.location.href = "/auth"}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all mt-4 mb-7 ${plan.ctaStyle}`}
                                >
                                    {plan.cta}
                                </button>

                                {/* Features */}
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
                        );
                    })}
                </motion.div>

                <motion.p
                    custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="text-center text-slate-600 text-sm mt-10"
                >
                    All paid plans include a <span className="text-slate-400 font-semibold">14-day money-back guarantee</span>. No questions asked.
                </motion.p>

                {/* FAQ */}
                <motion.div
                    custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="mt-24"
                >
                    <h2 className="text-3xl font-bold font-display text-white text-center mb-12">
                        Frequently asked questions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {FAQ.map((faq, i) => (
                            <motion.div
                                key={i} variants={fadeUp}
                                className="bg-slate-900/40 border border-white/5 rounded-xl p-6"
                            >
                                <p className="text-white font-semibold mb-2">{faq.q}</p>
                                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    custom={3} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="text-center mt-20"
                >
                    <p className="text-slate-400 mb-6 text-lg">Ready to forge your dream career?</p>
                    <button
                        onClick={() => window.location.href = "/auth"}
                        className="px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-xl shadow-primary/30 transition-all hover:scale-105"
                    >
                        Get Started Today →
                    </button>
                </motion.div>
            </section>
        </div>
    );
}
