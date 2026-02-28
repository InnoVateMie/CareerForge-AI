import { motion } from "framer-motion";
import { Star, Quote, Sparkles, ArrowLeft } from "lucide-react";
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

const testimonials = [
    {
        name: "Amara Osei", role: "Senior Product Manager", company: "Google",
        avatar: "AO", avatarColor: "from-pink-500 to-rose-500", stars: 5,
        quote: "I landed 3 interviews in my first week using CareerForge. The Job Match Optimizer was a game-changer — it told me exactly which keywords I was missing before I even applied.",
    },
    {
        name: "Liam Martinez", role: "Software Engineer", company: "Stripe",
        avatar: "LM", avatarColor: "from-blue-500 to-cyan-500", stars: 5,
        quote: "The resume it generated was miles ahead of what I had. Structured, keyword-rich, and visually polished. It felt like it was written by a professional recruiter who knew my field inside out.",
    },
    {
        name: "Fatima Al-Hassan", role: "Data Scientist", company: "Microsoft",
        avatar: "FA", avatarColor: "from-emerald-500 to-teal-500", stars: 5,
        quote: "As someone pivoting from academia, I had no idea how to present my PhD work for industry roles. CareerForge translated my research into business value instantly. I got my dream job in 6 weeks.",
    },
    {
        name: "James Okonkwo", role: "UX Lead", company: "Shopify",
        avatar: "JO", avatarColor: "from-amber-500 to-orange-500", stars: 5,
        quote: "The cover letter generator is exceptional. Every letter felt personal and on-brand. My recruiter literally said my cover letter was one of the best she'd ever read.",
    },
    {
        name: "Priya Nair", role: "Finance Analyst", company: "JPMorgan",
        avatar: "PN", avatarColor: "from-violet-500 to-purple-500", stars: 5,
        quote: "I was skeptical about AI-generated content being too generic. CareerForge completely changed my mind. The tailoring is genuinely impressive — totally specific to my experience and target role.",
    },
    {
        name: "David Chen", role: "Marketing Director", company: "HubSpot",
        avatar: "DC", avatarColor: "from-indigo-500 to-blue-500", stars: 5,
        quote: "The Interview Coach feature helped me prepare for every question confidently. The STAR-method feedback was detailed and actionable. Worth every single penny.",
    },
    {
        name: "Ngozi Eze", role: "Backend Engineer", company: "Flutterwave",
        avatar: "NE", avatarColor: "from-rose-500 to-pink-500", stars: 5,
        quote: "Being based in Nigeria, I always struggled to frame my experience for global companies. CareerForge understood my context and helped me land a fully remote role with a U.S. startup.",
    },
    {
        name: "Sofia Fernandez", role: "Product Designer", company: "Figma",
        avatar: "SF", avatarColor: "from-sky-500 to-blue-500", stars: 5,
        quote: "I used CareerForge while interviewing at 5 companies simultaneously. Managing 5 tailored resumes and cover letters would have been impossible without it. I accepted an offer 3 weeks later.",
    },
    {
        name: "Marcus Thompson", role: "DevOps Engineer", company: "AWS",
        avatar: "MT", avatarColor: "from-orange-500 to-amber-500", stars: 5,
        quote: "The ATS optimization alone was worth the subscription. After CareerForge, my application-to-interview rate went from 5% to 38%. Absolutely transformational.",
    },
];

export default function Testimonials() {
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
                    <Link href="/testimonials"><span className="text-sm font-medium text-white transition-colors cursor-pointer">Testimonials</span></Link>

                </nav>
                <Link href="/auth">
                    <button className="rounded-full px-6 py-2 font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-colors text-sm">
                        Sign In
                    </button>
                </Link>
            </header>

            {/* Hero */}
            <section className="relative z-20 text-center px-4 pt-20 pb-12">
                <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Loved by professionals</span>
                    <h1 className="text-5xl md:text-6xl font-bold font-display text-white mb-5 leading-tight">
                        Real results, <span className="text-gradient">real people</span>
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
                        From fresh graduates to senior directors — CareerForge AI has helped thousands land the roles they deserve.
                    </p>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    custom={1} variants={fadeUp} initial="hidden" animate="visible"
                    className="flex flex-wrap justify-center gap-10 mt-12"
                >
                    {[
                        { label: "Professionals Helped", value: "10,000+" },
                        { label: "Companies Hired From Us", value: "500+" },
                        { label: "Average Rating", value: "4.9★" },
                        { label: "Interview Rate Increase", value: "3.2×" },
                    ].map((s, i) => (
                        <div key={i} className="text-center">
                            <p className="text-4xl font-black text-white font-display">{s.value}</p>
                            <p className="text-slate-500 text-sm mt-1">{s.label}</p>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Grid */}
            <section className="relative z-20 max-w-6xl mx-auto px-4 pb-24">
                <motion.div
                    variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i} variants={fadeUp}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className="relative bg-slate-900/50 backdrop-blur-xl border border-white/5 hover:border-white/15 p-7 rounded-2xl text-left transition-all overflow-hidden flex flex-col"
                        >
                            <Quote className="absolute top-5 right-6 w-8 h-8 text-white/5" />
                            <div className="flex gap-1 mb-5">
                                {Array.from({ length: t.stars }).map((_, si) => (
                                    <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                            <p className="text-slate-300 leading-relaxed text-sm mb-6 italic flex-1">"{t.quote}"</p>
                            <div className="flex items-center gap-3 mt-auto">
                                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{t.name}</p>
                                    <p className="text-slate-500 text-xs">{t.role} @ {t.company}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                    className="text-center mt-20"
                >
                    <p className="text-slate-400 mb-6 text-lg">Join thousands of professionals already forging their dream careers.</p>
                    <button
                        onClick={() => window.location.href = "/auth"}
                        className="px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-xl shadow-primary/30 transition-all hover:scale-105"
                    >
                        Get Started Free →
                    </button>
                </motion.div>
            </section>
        </div>
    );
}
