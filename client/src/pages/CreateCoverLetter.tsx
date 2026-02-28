import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useGenerateCoverLetter, useCreateCoverLetter } from "@/hooks/use-cover-letters";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Download, Save, ArrowLeft } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ExportPaymentModal } from "@/components/ExportPaymentModal";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
// @ts-ignore
import html2pdf_lib from "html2pdf.js";
const html2pdf = html2pdf_lib as any;

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
  const letterEditorRef = useRef<HTMLDivElement>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { hasPremiumExport } = useAuth();

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
      setGeneratedHtml(result.content);
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
      await createMutation.mutateAsync({ title, content: generatedHtml });
      toast({ title: "Saved successfully!" });
      setLocation("/dashboard/cover-letters");
    } catch (e: any) {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const handleExportPDF = () => {
    if (!hasPremiumExport) {
      setIsPaymentModalOpen(true);
      return;
    }

    if (!letterEditorRef.current) return;
    const opt = {
      margin: 20,
      filename: `${title || "cover-letter"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(letterEditorRef.current).save();
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        {step === "form" ? (
          <>
            {/* Mobile: back to dashboard */}
            <div className="flex items-center gap-2 mb-4 md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="gap-1 text-muted-foreground -ml-2">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </div>

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
                      <FormControl>
                        <Textarea className="min-h-[150px]" placeholder="I have 5 years of experience leading cross-functional teams..." {...field} />
                      </FormControl>
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
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground">Review &amp; Edit</h1>
              </div>
              {/* Mobile-friendly action row with horizontal scroll */}
              <div className="resume-actions-container">
                <Button variant="outline" onClick={() => setStep("form")} className="whitespace-nowrap h-11 rounded-xl">Back</Button>
                <Button variant="secondary" onClick={handleExportPDF} className="gap-2 whitespace-nowrap h-11 rounded-xl">
                  <Download className="w-4 h-4" /> Export PDF
                </Button>
                <Button onClick={handleSave} disabled={createMutation.isPending} className="gap-2 bg-accent hover:bg-accent/90 text-white whitespace-nowrap h-11 rounded-xl">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold mb-2 block text-muted-foreground uppercase tracking-wider">Document Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="max-w-md font-medium text-lg h-12 rounded-2xl"
              />
            </div>

            <div className="rounded-2xl border border-border overflow-hidden shadow-xl">
              <RichTextEditor
                content={generatedHtml}
                onChange={setGeneratedHtml}
                editorRef={letterEditorRef}
              />
            </div>
          </>
        )}
      </div>

      <ExportPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          // On success, reload to fetch the new JWT that contains the hasPremiumExport flag
          window.location.reload();
        }}
      />
    </DashboardLayout>
  );
}
