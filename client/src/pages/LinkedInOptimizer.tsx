import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useResumes } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Linkedin, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { z } from "zod";

type LinkedInResponse = z.infer<typeof api.linkedin.optimizeProfile.responses[200]>;

export default function LinkedInOptimizer() {
    const { data: resumes } = useResumes();
    const { toast } = useToast();

    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [customProfile, setCustomProfile] = useState("");
    const [result, setResult] = useState<LinkedInResponse | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleOptimize = async () => {
        let contentToOptimize = customProfile;

        if (selectedResumeId) {
            const resume = resumes?.find(r => r.id === Number(selectedResumeId));
            if (resume) contentToOptimize = resume.content + "\n" + contentToOptimize;
        }

        if (!contentToOptimize.trim()) {
            toast({ title: "Please select a resume or paste your profile content.", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            const res = await apiRequest("POST", api.linkedin.optimizeProfile.path, {
                profileOrResumeContent: contentToOptimize
            });
            const data = await res.json() as LinkedInResponse;
            setResult(data);
            toast({ title: "Successfully optimized profile!" });
        } catch (e) {
            toast({ title: "Failed to optimize LinkedIn profile", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto pb-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
                        <Linkedin className="h-8 w-8 text-blue-500" />
                        LinkedIn Profile Optimizer
                    </h1>
                    <p className="text-muted-foreground mt-2">Transform your resume or current profile into a magnet for recruiters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-border shadow-xl h-fit">
                        <CardHeader>
                            <CardTitle>Source Material</CardTitle>
                            <CardDescription>Select a saved resume, paste your LinkedIn URL, or paste your text content.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Use a Saved Resume</label>
                                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pick a resume..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Use custom text only)</SelectItem>
                                        {resumes?.map(r => (
                                            <SelectItem key={r.id} value={r.id.toString()}>{r.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">And / Or Paste Current Profile Info</label>
                                <Textarea
                                    placeholder="Paste your current headline, summary, or experience here..."
                                    className="min-h-[220px]"
                                    value={customProfile}
                                    onChange={e => setCustomProfile(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleOptimize} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20" disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                Optimize Profile
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="space-y-6">
                        {result ? (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <Card className="border-blue-500/20 shadow-2xl bg-gradient-to-br from-blue-500/5 via-background to-background">
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center gap-2 text-blue-500">
                                            <CheckCircle2 className="h-5 w-5" /> Optimized Headline
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-lg font-medium text-foreground">{result.headline}</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-blue-500/20 shadow-2xl bg-gradient-to-br from-blue-500/5 via-background to-background">
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center gap-2 text-blue-500">
                                            <CheckCircle2 className="h-5 w-5" /> Professional Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-md leading-relaxed text-foreground whitespace-pre-wrap">{result.summary}</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-blue-500/20 shadow-2xl bg-gradient-to-br from-blue-500/5 via-background to-background">
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center gap-2 text-blue-500">
                                            <CheckCircle2 className="h-5 w-5" /> Experience Suggestions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {result.experienceSuggestions.map((suggestion, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-foreground/80 bg-background/50 p-3 rounded-lg border border-border/50">
                                                    <span className="text-blue-500 font-bold">•</span>
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center p-12 text-center text-muted-foreground flex-col gap-3 min-h-[400px]">
                                <Linkedin className="h-12 w-12 text-muted-foreground/30" />
                                <p>Provide your resume or current profile details, and our AI will generate an optimized, recruiter-ready LinkedIn profile for you.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
