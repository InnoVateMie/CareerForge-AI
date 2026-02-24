import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useGenerateResume, useCreateResume } from "@/hooks/use-resumes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, Download, Save, FileText } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { marked } from "marked";
import { JobFetcher } from "@/components/JobFetcher";
// @ts-ignore
import html2pdf_lib from "html2pdf.js";
const html2pdf = html2pdf_lib as any;

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  jobTitle: z.string().min(2, "Target job title is required"),
  skills: z.string().min(5, "List some skills"),
  workExperience: z.string().min(10, "Describe your experience briefly"),
  education: z.string().min(5, "Add your education details"),
  certifications: z.string().optional(),
  targetJobDescription: z.string().optional(),
});

export default function CreateResume() {
  const [step, setStep] = useState<"form" | "edit">("form");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [resumeTitle, setResumeTitle] = useState("");
  const resumeEditorRef = useRef<any>(null);

  const generateMutation = useGenerateResume();
  const createMutation = useCreateResume();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      jobTitle: "",
      skills: "",
      workExperience: "",
      education: "",
      certifications: "",
      targetJobDescription: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setResumeTitle(`${values.fullName} - ${values.jobTitle}`);
      const result = await generateMutation.mutateAsync(values);
      // If AI returned raw HTML (starts with <), use it directly. Otherwise parse as markdown.
      const rawContent = result.content.trim();
      const htmlContent = rawContent.startsWith("<") && rawContent.endsWith(">")
        ? rawContent
        : await marked.parse(rawContent);

      setGeneratedHtml(htmlContent);
      setStep("edit");
      toast({ title: "Resume generated successfully!" });
    } catch (e) {
      toast({ title: "Generation failed", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!resumeTitle) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: resumeTitle,
        content: generatedHtml,
      });
      toast({ title: "Saved successfully!" });
      setLocation("/dashboard/resumes");
    } catch (e) {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const handleExportPDF = () => {
    if (!resumeEditorRef.current) return;
    const element = resumeEditorRef.current;
    const opt = {
      margin: 15,
      filename: `${resumeTitle || 'resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleExportMarkdown = () => {
    // result.content is original markdown from mutation, but we don't store it in state across steps.
    // We can either store it or just use the title and content.
    // For now, let's just use the current editor content (HTML) and a simple banner.
    const element = document.createElement("a");
    const file = new Blob([generatedHtml], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${resumeTitle || 'resume'}.md`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {step === "form" ? (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex h-12 w-12 rounded-xl bg-primary/10 items-center justify-center text-primary mb-4">
                <Wand2 className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold font-display text-foreground">AI Resume Generator</h1>
              <p className="text-muted-foreground mt-2">Fill in your basic details and let the AI craft a compelling narrative.</p>
            </div>

            <div className="bg-card border border-border shadow-xl shadow-black/5 rounded-2xl p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="jobTitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Job Title</FormLabel>
                        <FormControl><Input placeholder="Senior Frontend Engineer" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="skills" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma separated)</FormLabel>
                      <FormControl><Textarea placeholder="React, TypeScript, Node.js..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="workExperience" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Experience Summary</FormLabel>
                      <FormDescription>Briefly describe your past roles. The AI will expand and format them.</FormDescription>
                      <FormControl><Textarea className="min-h-[100px]" placeholder="Built scalable UIs at TechCorp for 3 years..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="education" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education</FormLabel>
                        <FormControl><Input placeholder="B.S. Computer Science, MIT" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="certifications" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certifications (Optional)</FormLabel>
                        <FormControl><Input placeholder="AWS Certified Developer" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <JobFetcher
                    onFetched={(data) => {
                      form.setValue("targetJobDescription", data.description + "\n\nRequirements:\n" + data.requirements);
                      form.setValue("jobTitle", data.jobTitle);
                    }}
                  />

                  <FormField control={form.control} name="targetJobDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Job Description (Optional)</FormLabel>
                      <FormDescription>Paste the job posting to deeply tailor your resume.</FormDescription>
                      <FormControl><Textarea className="min-h-[150px]" placeholder="We are looking for..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Crafting your resume...</>
                    ) : (
                      <><Wand2 className="w-5 h-5 mr-2" /> Generate Magic</>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground">Review & Edit</h1>
                <p className="text-sm text-muted-foreground mt-1">Make any tweaks before saving or exporting.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("form")}>Back</Button>
                <Button variant="secondary" onClick={handleExportPDF} className="gap-2">
                  <Download className="w-4 h-4" /> Export PDF
                </Button>
                <Button variant="outline" onClick={handleExportMarkdown} className="gap-2">
                  <FileText className="w-4 h-4" /> Export MD
                </Button>
                <Button onClick={handleSave} disabled={createMutation.isPending} className="gap-2 bg-primary hover:bg-primary/90">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Resume Title</label>
              <Input
                value={resumeTitle}
                onChange={e => setResumeTitle(e.target.value)}
                className="max-w-md font-medium text-lg"
              />
            </div>

            <div className="premium-resume-container bg-muted/30 rounded-xl shadow-inner border border-border overflow-hidden">
              <RichTextEditor
                content={generatedHtml}
                onChange={setGeneratedHtml}
                editorRef={resumeEditorRef}
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
