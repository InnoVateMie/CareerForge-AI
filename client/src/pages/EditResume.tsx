import { useRef, useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useResume, useUpdateResume } from "@/hooks/use-resumes";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Download, FileText, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore
import html2pdf_lib from "html2pdf.js";
const html2pdf = html2pdf_lib as any;

const RESUME_THEMES = [
    { name: "Indigo", primary: "#4f46e5", muted: "#e0e7ff", bg: "#f8faff", mutedBg: "#f5f7ff" },
    { name: "Emerald", primary: "#059669", muted: "#d1fae5", bg: "#f0fdf4", mutedBg: "#ecfdf5" },
    { name: "Rose", primary: "#e11d48", muted: "#ffe4e6", bg: "#fff1f2", mutedBg: "#fff5f5" },
    { name: "Amber", primary: "#d97706", muted: "#fef3c7", bg: "#fffbeb", mutedBg: "#fffdf0" },
    { name: "Slate", primary: "#334155", muted: "#f1f5f9", bg: "#f8fafc", mutedBg: "#ffffff" },
    { name: "Sky", primary: "#0284c7", muted: "#e0f2fe", bg: "#f0f9ff", mutedBg: "#f5fbff" },
];

export default function EditResume() {
    const [, params] = useRoute("/dashboard/resumes/:id");
    const id = params?.id ? parseInt(params.id) : null;
    const { data: resume, isLoading } = useResume(id!);
    const updateMutation = useUpdateResume();
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [currentTheme, setCurrentTheme] = useState(RESUME_THEMES[0]);
    const resumeEditorRef = useRef<any>(null);

    useEffect(() => {
        if (resume) {
            setContent(resume.content);
            setTitle(resume.title);
            // Assign a semi-deterministic theme based on the resume ID
            const themeIndex = (id || 0) % RESUME_THEMES.length;
            setCurrentTheme(RESUME_THEMES[themeIndex]);
        }
    }, [resume, id]);

    const handleSave = async () => {
        if (!id) return;
        try {
            await updateMutation.mutateAsync({
                id,
                title,
                content
            });
            toast({ title: "Resume updated successfully!" });
        } catch (e) {
            toast({ title: "Failed to update resume", variant: "destructive" });
        }
    };

    const handleExportPDF = () => {
        if (!resumeEditorRef.current) return;
        const element = resumeEditorRef.current;
        const opt = {
            margin: 10,
            filename: `${title || 'resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const themeStyle = {
        "--resume-primary": currentTheme.primary,
        "--resume-muted": currentTheme.muted,
        "--resume-bg": currentTheme.bg,
        "--resume-muted-bg": currentTheme.mutedBg,
    } as React.CSSProperties;

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!resume) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <h1 className="text-2xl font-bold">Resume not found</h1>
                    <Button onClick={() => setLocation("/dashboard/resumes")} className="mt-4">
                        Back to Resumes
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/resumes")} className="rounded-xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold font-display text-foreground">Edit Resume</h1>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                Theme: <span className="font-bold text-primary">{currentTheme.name}</span>
                            </p>
                        </div>
                    </div>
                    <div className="resume-actions-container">
                        <Button variant="secondary" onClick={handleExportPDF} className="gap-2 whitespace-nowrap">
                            <Download className="w-4 h-4" /> Export PDF
                        </Button>
                        <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2 bg-primary hover:bg-primary/90 whitespace-nowrap">
                            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="text-sm font-semibold mb-2 block text-muted-foreground uppercase tracking-wider">Resume Title</label>
                    <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="max-w-md font-bold text-xl h-12 rounded-xl"
                    />
                </div>

                <div
                    className="premium-resume-container bg-white rounded-2xl shadow-lg border border-border overflow-hidden"
                    style={themeStyle}
                >
                    {content ? (
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            editorRef={resumeEditorRef}
                        />
                    ) : (
                        <div className="h-[500px] flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                            Loading content...
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
