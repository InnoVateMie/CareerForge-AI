import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useOptimizeResume } from "@/hooks/use-resumes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { marked } from "marked";

const formSchema = z.object({
  existingResume: z.string().min(50, "Please paste your full resume content"),
  targetJobDescription: z.string().min(50, "Please paste the job description"),
});

export default function JobOptimizer() {
  const optimizeMutation = useOptimizeResume();
  const [result, setResult] = useState<{ analysisHtml: string, suggestionsHtml: string } | null>(null);

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
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-card border border-primary/20 shadow-xl shadow-primary/5 rounded-2xl p-7 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-primary">
                      <CheckCircle2 className="w-5 h-5" /> Match Analysis
                    </h3>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: result.analysisHtml }}
                    />
                  </div>

                  <div className="bg-card border border-accent/20 shadow-xl shadow-accent/5 rounded-2xl p-7 relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full -ml-16 -mb-16 transition-transform group-hover:scale-110" />
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-accent">
                      <AlertCircle className="w-5 h-5" /> Strategic Suggestions
                    </h3>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: result.suggestionsHtml }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-muted rounded-2xl bg-muted/20 text-muted-foreground"
                >
                  <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-6 shadow-inner">
                    <Target className="w-10 h-10 opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 font-display">Optimization Engine Idle</h3>
                  <p className="max-w-xs mx-auto">Upload your credentials and the target role to activate the expert gap-analysis engine.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
