import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useInterview } from "@/hooks/use-interview";
import { useResumes } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, MessageSquare, Play, RefreshCw, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function InterviewCoach() {
    const { data: resumes } = useResumes();
    const { generateMutation, evaluateMutation } = useInterview();
    const { toast } = useToast();

    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [jobDescription, setJobDescription] = useState("");
    const [questions, setQuestions] = useState<{ question: string, context: string }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState<{ feedback: string, score: number, improvedAnswer: string } | null>(null);

    const handleStart = async () => {
        if (!selectedResumeId || !jobDescription) {
            toast({ title: "Please select a resume and paste a job description", variant: "destructive" });
            return;
        }

        const resume = resumes?.find(r => r.id === Number(selectedResumeId));
        if (!resume) return;

        try {
            const result = await generateMutation.mutateAsync({
                resumeContent: resume.content,
                jobDescription
            });
            setQuestions(result.questions);
            setCurrentIndex(0);
            setFeedback(null);
            setAnswer("");
        } catch (e) {
            toast({ title: "Failed to generate questions", variant: "destructive" });
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer) return;

        try {
            const result = await evaluateMutation.mutateAsync({
                question: questions[currentIndex].question,
                context: questions[currentIndex].context,
                answer
            });
            setFeedback(result);
        } catch (e) {
            toast({ title: "Evaluation failed", variant: "destructive" });
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setAnswer("");
            setFeedback(null);
        } else {
            toast({ title: "Interview complete! Great job." });
            setQuestions([]);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display text-foreground flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        AI Interview Coach
                    </h1>
                    <p className="text-muted-foreground mt-2">Roleplay with an AI interviewer to refine your answers.</p>
                </div>

                {questions.length === 0 ? (
                    <Card className="border-border shadow-xl">
                        <CardHeader>
                            <CardTitle>Preparation</CardTitle>
                            <CardDescription>Select a resume and the job you're applying for to start the simulation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Resume</label>
                                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pick a resume..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {resumes?.map(r => (
                                            <SelectItem key={r.id} value={r.id.toString()}>{r.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Job Description</label>
                                <Textarea
                                    placeholder="Paste the job description here..."
                                    className="min-h-[200px]"
                                    value={jobDescription}
                                    onChange={e => setJobDescription(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleStart} className="w-full gap-2" disabled={generateMutation.isPending}>
                                {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                Start Interview Session
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between"
                        >
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {currentIndex + 1}
                                </span>
                                Question {currentIndex + 1} of {questions.length}
                            </span>
                            <Progress value={((currentIndex + 1) / questions.length) * 100} className="w-1/3 h-2" />
                        </motion.div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Card className="border-primary/20 shadow-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
                                    <CardHeader className="relative z-10">
                                        <CardTitle className="text-2xl leading-relaxed text-foreground font-display">
                                            "{questions[currentIndex].question}"
                                        </CardTitle>
                                        <CardDescription className="italic mt-3 text-primary/70 font-medium">
                                            Interviewer Focus: {questions[currentIndex].context}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 relative z-10">
                                        <Textarea
                                            placeholder="Articulate your best answer here..."
                                            className="min-h-[180px] text-lg bg-background/50 backdrop-blur-sm border-2 border-muted focus:border-primary transition-all shadow-inner"
                                            value={answer}
                                            onChange={e => setAnswer(e.target.value)}
                                            disabled={!!feedback}
                                        />

                                        {feedback && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="animate-in fade-in slide-in-from-top-4 duration-500"
                                            >
                                                <div className={`p-6 rounded-2xl border-2 transition-all ${feedback.score >= 7 ? 'bg-green-500/5 border-green-500/20 shadow-xl shadow-green-500/5' : 'bg-yellow-500/5 border-yellow-500/20 shadow-xl shadow-yellow-500/5'}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="font-bold text-lg flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${feedback.score >= 7 ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                                <CheckCircle2 className="h-6 w-6" />
                                                            </div>
                                                            Expert Evaluation (Score: {feedback.score}/10)
                                                        </span>
                                                    </div>
                                                    <p className="text-md leading-relaxed text-foreground/80 mb-6">{feedback.feedback}</p>

                                                    <div className="space-y-3 bg-background/40 p-5 rounded-xl border border-border/50">
                                                        <span className="text-xs font-black uppercase text-primary tracking-[0.2em]">The Golden Response:</span>
                                                        <div className="p-4 bg-primary/5 rounded-lg text-md italic border-l-4 border-primary text-foreground/90">
                                                            {feedback.improvedAnswer}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-between gap-4 pt-6 border-t border-border/50 relative z-10">
                                        <Button variant="outline" onClick={() => setQuestions([])} className="gap-2 h-11 px-6 hover:bg-muted transition-colors">
                                            <RefreshCw className="h-4 w-4" /> Reset Session
                                        </Button>

                                        {!feedback ? (
                                            <Button onClick={handleSubmitAnswer} disabled={!answer || evaluateMutation.isPending} className="gap-2 h-11 px-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-bold">
                                                {evaluateMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Send className="h-4 w-4" /> Submit for Review</>}
                                            </Button>
                                        ) : (
                                            <Button onClick={handleNext} className="gap-2 h-11 px-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-bold">
                                                {currentIndex < questions.length - 1 ? 'Next Question' : 'Seal the Deal'}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
