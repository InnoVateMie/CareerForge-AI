import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useGenerateCoverLetter, useCreateCoverLetter } from "@/hooks/use-cover-letters";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Download, Save } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { marked } from "marked";
// @ts-ignore
import html2pdf from "html2pdf.js";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  jobRole: z.string().min(2, "Job role is required"),
  skills: z.string().min(5, "List some relevant skills"),
  experienceSummary: z.string().min(10, "Describe why you're a fit"),
});

export default function CreateCoverLetter() {
  const [step, setStep] = useState<"form" | "edit">("form");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [title, setTitle] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  
  const generateMutation = useGenerateCoverLetter();
  const createMutation = useCreateCoverLetter();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      jobRole: "",
      skills: "",
      experienceSummary: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setTitle(`Cover Letter - ${values.companyName}`);
      const result = await generateMutation.mutateAsync(values);
      const htmlContent = await marked.parse(result.content);
      setGeneratedHtml(htmlContent);
      setStep("edit");
      toast({ title: "Cover letter generated successfully!" });
    } catch (e) {
      toast({ title: "Generation failed", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!title) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        title,
        content: generatedHtml,
      });
      toast({ title: "Saved successfully!" });
      setLocation("/dashboard/cover-letters");
    } catch (e) {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const handleExportPDF = () => {
    if (!editorRef.current) return;
    const element = editorRef.current;
    const opt = {
      margin: 20,
      filename: `${title || 'cover-letter'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {step === "form" ? (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex h-12 w-12 rounded-xl bg-accent/10 items-center justify-center text-accent mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold font-display text-foreground">AI Cover Letter Writer</h1>
              <p className="text-muted-foreground mt-2">Generate a personalized cover letter that stands out.</p>
            </div>

            <div className="bg-card border border-border shadow-xl shadow-black/5 rounded-2xl p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl><Input placeholder="Acme Corp" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="jobRole" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Role</FormLabel>
                        <FormControl><Input placeholder="Product Manager" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="skills" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relevant Skills</FormLabel>
                      <FormControl><Input placeholder="Agile, Jira, Data Analysis..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="experienceSummary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why are you a great fit?</FormLabel>
                      <FormControl><Textarea className="min-h-[150px]" placeholder="I have 5 years of experience leading cross-functional teams..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg shadow-lg shadow-accent/20 bg-accent hover:bg-accent/90 text-white"
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Writing letter...</>
                    ) : (
                      <><Mail className="w-5 h-5 mr-2" /> Generate Letter</>
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
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("form")}>Back</Button>
                <Button variant="secondary" onClick={handleExportPDF} className="gap-2">
                  <Download className="w-4 h-4" /> Export PDF
                </Button>
                <Button onClick={handleSave} disabled={createMutation.isPending} className="gap-2 bg-accent hover:bg-accent/90 text-white">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Document Title</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="max-w-md font-medium text-lg"
              />
            </div>

            <RichTextEditor 
              content={generatedHtml} 
              onChange={setGeneratedHtml}
              editorRef={editorRef}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
