import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useInterview } from "@/hooks/use-interview";
import { useResumes } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, MessageSquare, Play, RefreshCw, Send, CheckCircle2 } from "lucide-react";
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
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Question {currentIndex + 1} of {questions.length}</span>
                            <Progress value={((currentIndex + 1) / questions.length) * 100} className="w-1/3 h-2" />
                        </div>

                        <Card className="border-primary/20 shadow-2xl bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-xl leading-relaxed">"{questions[currentIndex].question}"</CardTitle>
                                <CardDescription className="italic mt-2">Interviewer Context: {questions[currentIndex].context}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Type your answer here..."
                                    className="min-h-[150px] text-lg bg-background"
                                    value={answer}
                                    onChange={e => setAnswer(e.target.value)}
                                    disabled={!!feedback}
                                />

                                {feedback && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className={`p-4 rounded-xl border ${feedback.score >= 7 ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold flex items-center gap-2">
                                                    <CheckCircle2 className={`h-5 w-5 ${feedback.score >= 7 ? 'text-green-500' : 'text-yellow-500'}`} />
                                                    AI Feedback (Score: {feedback.score}/10)
                                                </span>
                                            </div>
                                            <p className="text-sm mb-4">{feedback.feedback}</p>

                                            <div className="space-y-2">
                                                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Better way to say it:</span>
                                                <div className="p-3 bg-background/50 rounded-lg text-sm italic">
                                                    {feedback.improvedAnswer}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between gap-4">
                                <Button variant="outline" onClick={() => setQuestions([])} className="gap-2">
                                    <RefreshCw className="h-4 w-4" /> Reset
                                </Button>

                                {!feedback ? (
                                    <Button onClick={handleSubmitAnswer} disabled={!answer || evaluateMutation.isPending} className="gap-2 px-8">
                                        {evaluateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Submit Answer
                                    </Button>
                                ) : (
                                    <Button onClick={handleNext} className="gap-2 px-8">
                                        {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Session'}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
