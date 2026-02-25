import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Target, ArrowRight, Sparkles, MessageSquare, TrendingUp, Clock, FileCheck } from "lucide-react";
import { Link } from "wouter";
import { useResumes } from "@/hooks/use-resumes";
import { useCoverLetters } from "@/hooks/use-cover-letters";
import { useAuth } from "@/hooks/use-auth";
import { Resume3DPreview } from "@/components/Resume3DPreview";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateTime } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function DashboardHome() {
  const { data: resumes } = useResumes();
  const { data: coverLetters } = useCoverLetters();
  const { user } = useAuth();
  // Robust name detection: Prioritize full name from metadata, then split email
  const userInitials = user?.email?.charAt(0).toUpperCase() || "P";
  const rawDisplayName = user?.user_metadata?.full_name || user?.user_metadata?.first_name || user?.email?.split('@')[0];
  const displayName = rawDisplayName || "Professional";

  // Dynamic Success Rate: 70% baseline + activity boost
  const resumeCount = resumes?.length || 0;
  const letterCount = coverLetters?.length || 0;
  const successRate = Math.min(98, 70 + (resumeCount * 2) + (letterCount * 1));

  const stats = [
    { label: "Resumes Built", value: resumeCount, icon: FileCheck, color: "text-blue-500" },
    { label: "Cover Letters", value: letterCount, icon: Mail, color: "text-rose-500" },
    { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp, color: "text-emerald-500" },
  ];

  return (
    <DashboardLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {/* Welcome Header */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={displayName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground">
                  Welcome, <span className="text-gradient capitalize">{displayName}</span>
                </h1>
              </motion.div>
            </AnimatePresence>
            <p className="text-muted-foreground mt-3 text-lg font-light max-w-xl">
              Your AI-enhanced career workspace is ready. Design your future today.
            </p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card p-6 rounded-3xl flex items-center gap-5 group hover:border-primary/30 transition-all duration-500">
              <div className={`p-4 rounded-2xl bg-muted/50 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h4 className="text-2xl font-bold text-foreground mt-0.5">{stat.value}</h4>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Featured Visual Section */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative group overflow-hidden rounded-[2rem] border border-border/10 shadow-2xl">
            <Resume3DPreview />
            <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none">
              <h3 className="text-xl font-bold text-foreground">Interactive Synthesis</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">Live 3D preview of your professional profile architecture.</p>
            </div>
          </div>

          <Card className="glass-card overflow-hidden border-none shadow-2xl group flex flex-col justify-between p-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
            <CardHeader className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner ring-1 ring-primary/20">
                <MessageSquare className="w-7 h-7" />
              </div>
              <CardTitle className="text-3xl font-display leading-tight">Master the <br />Interview</CardTitle>
              <CardDescription className="text-muted-foreground text-lg mt-4 leading-relaxed">
                Our AI coach generates custom scenarios based on your resume.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <Button asChild className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                <Link href="/dashboard/interview">
                  Enter Coach <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Primary Tools Grid */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Resume Forge",
              desc: "Engineered for high-impact professional narrative synthesis.",
              icon: FileText,
              color: "primary",
              href: "/dashboard/resumes/new"
            },
            {
              title: "Cover Architect",
              desc: "Craft precision narratives for executive-level opportunities.",
              icon: Mail,
              color: "accent",
              href: "/dashboard/cover-letters/new"
            },
            {
              title: "Strategic Match",
              desc: "Deep-learning analysis against specific job architectures.",
              icon: Target,
              color: "blue-500",
              href: "/dashboard/optimize"
            },
          ].map((tool, idx) => (
            <Card key={idx} className="glass-card group hover:-translate-y-2 transition-all duration-500 border-border/10">
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl bg-${tool.color === 'primary' ? 'primary' : tool.color === 'accent' ? 'accent' : 'blue-500'}/10 flex items-center justify-center text-${tool.color === 'primary' ? 'primary' : tool.color === 'accent' ? 'accent' : '[#3b82f6]'} mb-6 transition-transform group-hover:rotate-6`}>
                  <tool.icon className="w-7 h-7" />
                </div>
                <CardTitle className="text-2xl">{tool.title}</CardTitle>
                <CardDescription className="text-base mt-3 leading-relaxed">
                  {tool.desc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="w-full h-12 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Link href={tool.href}>
                    Build Now <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" /> Active Projects
              </h2>
              <Link href="/dashboard/resumes" className="text-sm font-semibold text-primary/80 hover:text-primary transition-colors">History</Link>
            </div>
            {resumes?.length === 0 ? (
              <div className="glass-card rounded-[2.5rem] p-12 text-center border-dashed">
                <p className="text-muted-foreground font-light text-lg">Your workspace is empty.</p>
                <Button asChild variant="outline" className="mt-6 rounded-xl border-primary/20">
                  <Link href="/dashboard/resumes/new">Initiate Project</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes?.slice(0, 3).map(resume => (
                  <motion.div
                    key={resume.id}
                    whileHover={{ x: 5 }}
                    className="p-5 rounded-[1.5rem] glass-card flex justify-between items-center group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{resume.title}</h3>
                        <p className="text-xs text-muted-foreground">Modified {resume.updatedAt ? formatDateTime(resume.updatedAt) : "Recently"}</p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="icon" className="group-hover:text-primary transition-colors">
                      <Link href={`/dashboard/resumes/${resume.id}`}><ArrowRight className="w-5 h-5" /></Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                <Mail className="w-6 h-6 text-accent" /> Communications
              </h2>
              <Link href="/dashboard/cover-letters" className="text-sm font-semibold text-accent/80 hover:text-accent transition-colors text-left uppercase">Review All</Link>
            </div>
            {coverLetters?.length === 0 ? (
              <div className="glass-card rounded-[2.5rem] p-12 text-center border-dashed">
                <p className="text-muted-foreground font-light text-lg">No narratives generated.</p>
                <Button asChild variant="outline" className="mt-6 rounded-xl border-accent/20">
                  <Link href="/dashboard/cover-letters/new">Draft First Letter</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                {coverLetters?.slice(0, 3).map(letter => (
                  <motion.div
                    key={letter.id}
                    whileHover={{ x: -5 }}
                    className="p-5 rounded-[1.5rem] glass-card flex justify-between items-center group cursor-pointer border-r-2 border-r-transparent hover:border-r-accent transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-foreground text-lg">{letter.title}</h3>
                        <p className="text-xs text-muted-foreground">Modified {letter.updatedAt ? formatDateTime(letter.updatedAt) : "Recently"}</p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="icon" className="group-hover:text-accent transition-colors">
                      <Link href={`/dashboard/cover-letters/${letter.id}`}><ArrowRight className="w-5 h-5 rotate-180" /></Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
