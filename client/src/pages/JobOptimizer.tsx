import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useOptimizeResume } from "@/hooks/use-resumes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Target, CheckCircle2, AlertCircle } from "lucide-react";
import { marked } from "marked";

const formSchema = z.object({
  existingResume: z.string().min(50, "Please paste your full resume content"),
  targetJobDescription: z.string().min(50, "Please paste the job description"),
});

export default function JobOptimizer() {
  const optimizeMutation = useOptimizeResume();
  const [result, setResult] = useState<{analysisHtml: string, suggestionsHtml: string} | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      existingResume: "",
      targetJobDescription: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await optimizeMutation.mutateAsync(values);
      setResult({
        analysisHtml: await marked.parse(res.analysis),
        suggestionsHtml: await marked.parse(res.suggestions),
      });
    } catch (e) {
      // Error handled by query hook automatically logging
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-500/10 items-center justify-center text-blue-500 mb-4">
            <Target className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">Job Match Optimizer</h1>
          <p className="text-muted-foreground mt-2">See how well your resume matches a specific job and get tailored improvement suggestions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border shadow-xl shadow-black/5 rounded-2xl p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="existingResume" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Resume Content</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[250px] font-mono text-sm" placeholder="Paste your current resume here..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="targetJobDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[250px] font-mono text-sm" placeholder="Paste the job posting..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg shadow-lg shadow-blue-500/20 bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={optimizeMutation.isPending}
                >
                  {optimizeMutation.isPending ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Match...</>
                  ) : (
                    <><Target className="w-5 h-5 mr-2" /> Optimize Resume</>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <div className="space-y-6">
            {result ? (
              <>
                <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-primary">
                    <CheckCircle2 className="w-5 h-5" /> Match Analysis
                  </h3>
                  <div 
                    className="prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: result.analysisHtml }}
                  />
                </div>
                
                <div className="bg-card border border-border shadow-sm rounded-2xl p-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-accent">
                    <AlertCircle className="w-5 h-5" /> Suggestions for Improvement
                  </h3>
                  <div 
                    className="prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: result.suggestionsHtml }}
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-card/50 text-muted-foreground">
                <Target className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">Awaiting Input</h3>
                <p>Paste your resume and job description to get a detailed gap analysis and tailored keywords.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
