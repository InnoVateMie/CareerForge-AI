import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useGenerateResume, useCreateResume } from "@/hooks/use-resumes";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, Download, Save, FileText, Plus, Trash2, ArrowLeft } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { marked } from "marked";
import { JobFetcher } from "@/components/JobFetcher";
// @ts-ignore
import html2pdf_lib from "html2pdf.js";
const html2pdf = html2pdf_lib as any;

const COUNTRY_CODES = [
  { code: "+1", country: "US/CA" }, { code: "+7", country: "RU" },
  { code: "+20", country: "EG" }, { code: "+27", country: "ZA" },
  { code: "+30", country: "GR" }, { code: "+31", country: "NL" },
  { code: "+32", country: "BE" }, { code: "+33", country: "FR" },
  { code: "+34", country: "ES" }, { code: "+39", country: "IT" },
  { code: "+40", country: "RO" }, { code: "+41", country: "CH" },
  { code: "+44", country: "GB" }, { code: "+45", country: "DK" },
  { code: "+46", country: "SE" }, { code: "+47", country: "NO" },
  { code: "+48", country: "PL" }, { code: "+49", country: "DE" },
  { code: "+51", country: "PE" }, { code: "+52", country: "MX" },
  { code: "+54", country: "AR" }, { code: "+55", country: "BR" },
  { code: "+56", country: "CL" }, { code: "+57", country: "CO" },
  { code: "+58", country: "VE" }, { code: "+60", country: "MY" },
  { code: "+61", country: "AU" }, { code: "+62", country: "ID" },
  { code: "+63", country: "PH" }, { code: "+64", country: "NZ" },
  { code: "+65", country: "SG" }, { code: "+66", country: "TH" },
  { code: "+81", country: "JP" }, { code: "+82", country: "KR" },
  { code: "+84", country: "VN" }, { code: "+86", country: "CN" },
  { code: "+90", country: "TR" }, { code: "+91", country: "IN" },
  { code: "+92", country: "PK" }, { code: "+94", country: "LK" },
  { code: "+98", country: "IR" }, { code: "+212", country: "MA" },
  { code: "+213", country: "DZ" }, { code: "+216", country: "TN" },
  { code: "+218", country: "LY" }, { code: "+220", country: "GM" },
  { code: "+221", country: "SN" }, { code: "+233", country: "GH" },
  { code: "+234", country: "NG" }, { code: "+237", country: "CM" },
  { code: "+254", country: "KE" }, { code: "+255", country: "TZ" },
  { code: "+256", country: "UG" }, { code: "+260", country: "ZM" },
  { code: "+263", country: "ZW" }, { code: "+966", country: "SA" },
  { code: "+971", country: "AE" }, { code: "+972", country: "IL" },
  { code: "+974", country: "QA" }, { code: "+234", country: "NG" },
];

const formSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Contact number is required"),
  address: z.string().min(5, "Address is required"),
  jobTitle: z.string().min(2, "Target job title is required"),
  skills: z.string().min(5, "List some skills"),
  hobbies: z.string().optional(),
  workExperience: z.array(z.object({
    company: z.string().min(2, "Company is required"),
    role: z.string().min(2, "Role is required"),
    start: z.string().min(2, "Start date required"),
    end: z.string().min(2, "End date required"),
    description: z.string().min(10, "Summary required"),
  })),
  education: z.array(z.object({
    school: z.string().min(2, "School is required"),
    degree: z.string().min(2, "Degree is required"),
    start: z.string().min(2, "Start date required"),
    end: z.string().min(2, "End date required"),
  })),
  certifications: z.array(z.object({
    name: z.string().min(2, "Cert name required"),
    issuer: z.string().min(2, "Issuer required"),
    date: z.string().min(2, "Date required"),
  })).optional(),
  targetJobDescription: z.string().optional(),
});

const RESUME_THEMES = [
  { name: "Indigo", primary: "#4f46e5", muted: "#e0e7ff", bg: "#f8faff", mutedBg: "#f5f7ff" },
  { name: "Emerald", primary: "#059669", muted: "#d1fae5", bg: "#f0fdf4", mutedBg: "#ecfdf5" },
  { name: "Rose", primary: "#e11d48", muted: "#ffe4e6", bg: "#fff1f2", mutedBg: "#fff5f5" },
  { name: "Amber", primary: "#d97706", muted: "#fef3c7", bg: "#fffbeb", mutedBg: "#fffdf0" },
  { name: "Slate", primary: "#334155", muted: "#f1f5f9", bg: "#f8fafc", mutedBg: "#ffffff" },
  { name: "Sky", primary: "#0284c7", muted: "#e0f2fe", bg: "#f0f9ff", mutedBg: "#f5fbff" },
];

export default function CreateResume() {
  const [step, setStep] = useState<"form" | "edit">("form");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [resumeTitle, setResumeTitle] = useState("");
  const [currentTheme, setCurrentTheme] = useState(RESUME_THEMES[0]);
  const resumeEditorRef = useRef<any>(null);

  const generateMutation = useGenerateResume();
  const createMutation = useCreateResume();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      jobTitle: "",
      skills: "",
      hobbies: "",
      workExperience: [{ company: "", role: "", start: "", end: "", description: "" }],
      education: [{ school: "", degree: "", start: "", end: "" }],
      certifications: [],
      targetJobDescription: "",
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control: form.control,
    name: "workExperience"
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: "education"
  });

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control: form.control,
    name: "certifications"
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setResumeTitle(`${values.fullName} - ${values.jobTitle}`);
      const randomTheme = RESUME_THEMES[Math.floor(Math.random() * RESUME_THEMES.length)];
      setCurrentTheme(randomTheme);

      const result = await generateMutation.mutateAsync(values);
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
      margin: 10,
      filename: `${resumeTitle || 'resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleExportMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedHtml], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${resumeTitle || 'resume'}.md`;
    document.body.appendChild(element);
    element.click();
  };

  const themeStyle = {
    "--resume-primary": currentTheme.primary,
    "--resume-muted": currentTheme.muted,
    "--resume-bg": currentTheme.bg,
    "--resume-muted-bg": currentTheme.mutedBg,
  } as React.CSSProperties;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {step === "form" ? (
          <>
            <div className="mb-8 px-4">
              <div className="flex items-center gap-3 mb-6 md:hidden">
                <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="gap-1 text-muted-foreground hover:text-foreground -ml-2">
                  <ArrowLeft className="h-4 w-4" /> Dashboard
                </Button>
              </div>
              <div className="text-center">
                <div className="inline-flex h-12 w-12 rounded-xl bg-primary/10 items-center justify-center text-primary mb-4">
                  <Wand2 className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold font-display text-foreground">AI Resume Generator</h1>
                <p className="text-muted-foreground mt-2">Craft a world-class professional narrative with our evolved AI.</p>
              </div>
            </div>

            <div className="bg-card border border-border shadow-2xl shadow-black/5 rounded-3xl p-6 md:p-10 mb-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                  {/* CONTACT INFO SECTION */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
                      <span className="h-8 w-1 bg-primary rounded-full"></span>
                      1. Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input placeholder="jane.doe@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Select
                                defaultValue="+234"
                                onValueChange={(code) => {
                                  const num = field.value.replace(/^\+\d+\s*/, '');
                                  field.onChange(`${code} ${num}`);
                                }}
                              >
                                <SelectTrigger className="w-[110px] shrink-0">
                                  <SelectValue placeholder="+Code" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {COUNTRY_CODES.map((c) => (
                                    <SelectItem key={`${c.code}-${c.country}`} value={c.code}>
                                      {c.code} {c.country}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="801 234 5678"
                                className="flex-1"
                                value={field.value.replace(/^\+\d+\s*/, '')}
                                onChange={(e) => {
                                  const parts = field.value.split(' ');
                                  const code = parts[0]?.startsWith('+') ? parts[0] : '+234';
                                  field.onChange(`${code} ${e.target.value}`);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl><Input placeholder="Lagos, Nigeria" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  {/* TARGET JOB SECTION */}
                  <div className="space-y-6 pt-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
                      <span className="h-8 w-1 bg-primary rounded-full"></span>
                      2. Target Role & Expertise
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="jobTitle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Job Title</FormLabel>
                          <FormControl><Input placeholder="Senior AI Engineer" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="skills" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills (Comma Separated)</FormLabel>
                          <FormControl><Input placeholder="React, Python, Cloud Architect..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="hobbies" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interests & Hobbies (Comma Separated)</FormLabel>
                        <FormControl><Input placeholder="Traveling, AI Ethics, Photography..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* WORK EXPERIENCE DYNAMIC SECTION */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
                        <span className="h-8 w-1 bg-primary rounded-full"></span>
                        3. Professional Experience
                      </h3>
                      <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ company: "", role: "", start: "", end: "", description: "" })} className="rounded-xl border-dashed border-2 hover:bg-primary/5">
                        <Plus className="h-4 w-4 mr-1" /> Add Entry
                      </Button>
                    </div>

                    <div className="space-y-8">
                      {expFields.map((field, index) => (
                        <div key={field.id} className="p-6 rounded-2xl bg-muted/30 border border-border relative group">
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeExp(index)} className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <FormField control={form.control} name={`workExperience.${index}.company`} render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">Company</FormLabel><FormControl><Input placeholder="TechCorp" {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name={`workExperience.${index}.role`} render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">Role</FormLabel><FormControl><Input placeholder="Product Designer" {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name={`workExperience.${index}.start`} render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">Start Date (MM/YY)</FormLabel><FormControl><Input placeholder="01/2021" {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name={`workExperience.${index}.end`} render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">End Date (MM/YY or Present)</FormLabel><FormControl><Input placeholder="Present" {...field} /></FormControl></FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name={`workExperience.${index}.description`} render={({ field }) => (
                            <FormItem><FormLabel className="text-xs">Responsibilities & Achievements</FormLabel><FormControl><Textarea className="min-h-[80px]" placeholder="Led the team into..." {...field} /></FormControl></FormItem>
                          )} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* EDUCATION DYNAMIC SECTION */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
                        <span className="h-8 w-1 bg-primary rounded-full"></span>
                        4. Academic Background
                      </h3>
                      <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ school: "", degree: "", start: "", end: "" })} className="rounded-xl border-dashed border-2 hover:bg-primary/5">
                        <Plus className="h-4 w-4 mr-1" /> Add Entry
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {eduFields.map((field, index) => (
                        <div key={field.id} className="p-6 rounded-2xl bg-muted/30 border border-border relative group">
                          {eduFields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeEdu(index)} className="absolute top-2 right-2 h-8 w-8 text-destructive/60 hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="space-y-4">
                            <FormField control={form.control} name={`education.${index}.school`} render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">University/School</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">Degree/Major</FormLabel><FormControl><Input placeholder="B.Sc Computer Science" {...field} /></FormControl></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField control={form.control} name={`education.${index}.start`} render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">Start (YY)</FormLabel><FormControl><Input placeholder="2016" {...field} /></FormControl></FormItem>
                              )} />
                              <FormField control={form.control} name={`education.${index}.end`} render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">End (YY)</FormLabel><FormControl><Input placeholder="2020" {...field} /></FormControl></FormItem>
                              )} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CERTIFICATIONS DYNAMIC SECTION */}
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-primary uppercase tracking-wider">
                        <span className="h-8 w-1 bg-primary rounded-full"></span>
                        5. Professional Certifications
                      </h3>
                      <Button type="button" variant="outline" size="sm" onClick={() => appendCert({ name: "", issuer: "", date: "" })} className="rounded-xl border-dashed border-2 hover:bg-primary/5">
                        <Plus className="h-4 w-4 mr-1" /> Add Certificate
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {certFields.map((field, index) => (
                        <div key={field.id} className="p-5 rounded-2xl bg-muted/30 border border-border relative group">
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeCert(index)} className="absolute top-2 right-2 h-8 w-8 text-destructive/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="space-y-3">
                            <FormField control={form.control} name={`certifications.${index}.name`} render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">Certificate Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name={`certifications.${index}.issuer`} render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">Issuer</FormLabel><FormControl><Input placeholder="Google, AWS..." {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name={`certifications.${index}.date`} render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">Date</FormLabel><FormControl><Input placeholder="2023" {...field} /></FormControl></FormItem>
                            )} />
                          </div>
                        </div>
                      ))}
                      {certFields.length === 0 && (
                        <div className="col-span-full py-10 text-center border-2 border-dashed border-border/40 rounded-3xl text-muted-foreground/60">
                          Optional: Add your achievements to stand out.
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-border/10" />

                  {/* JOB FETCHER INTEGRATION */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                      Tailor to Job Posting (Highly Recommended)
                    </h3>
                    <JobFetcher
                      onFetched={(data) => {
                        form.setValue("targetJobDescription", data.description + "\n\nRequirements:\n" + data.requirements);
                        form.setValue("jobTitle", data.jobTitle);
                      }}
                    />

                    <FormField control={form.control} name="targetJobDescription" render={({ field }) => (
                      <FormItem>
                        <FormControl><Textarea className="min-h-[120px] rounded-2xl" placeholder="Paste the job requirements here..." {...field} /></FormControl>
                        <FormDescription className="text-center">The AI will use this to optimize your keywords.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="pt-6">
                    <Button
                      type="submit"
                      className="w-full h-16 text-xl font-bold shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-accent hover:opacity-95 rounded-2xl transition-all active:scale-[0.98]"
                      disabled={generateMutation.isPending}
                    >
                      {generateMutation.isPending ? (
                        <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> CRAFTING YOUR MASTERPIECE...</>
                      ) : (
                        <><Wand2 className="w-6 h-6 mr-3" /> GENERATE AI RESUME</>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-foreground">Review & Edit</h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  Style: <span className="font-bold text-primary">{currentTheme.name}</span>
                </p>
              </div>
              <div className="resume-actions-container">
                <Button variant="outline" onClick={() => setStep("form")} className="whitespace-nowrap h-12 rounded-xl">Back</Button>
                <Button variant="secondary" onClick={handleExportPDF} className="gap-2 whitespace-nowrap h-12 rounded-xl">
                  <Download className="w-4 h-4" /> Export PDF
                </Button>
                <Button variant="outline" onClick={handleExportMarkdown} className="gap-2 whitespace-nowrap h-12 rounded-xl">
                  <FileText className="w-4 h-4" /> Export MD
                </Button>
                <Button onClick={handleSave} disabled={createMutation.isPending} className="gap-2 bg-primary hover:bg-primary/90 whitespace-nowrap h-12 rounded-xl">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </Button>
              </div>
            </div>

            <div className="mb-8 px-4">
              <label className="text-sm font-semibold mb-2 block text-muted-foreground uppercase tracking-wider">Resume Title</label>
              <Input
                value={resumeTitle}
                onChange={e => setResumeTitle(e.target.value)}
                className="max-w-md font-bold text-xl h-14 rounded-2xl border-2 focus:border-primary/50"
              />
            </div>

            <div
              className="premium-resume-container bg-muted/20 rounded-3xl shadow-inner border-[3px] border-border overflow-hidden"
              style={themeStyle}
            >
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
