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

export default function EditResume() {
    const [, params] = useRoute("/dashboard/resumes/:id");
    const id = params?.id ? parseInt(params.id) : null;
    const { data: resume, isLoading } = useResume(id!);
    const updateMutation = useUpdateResume();
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const resumeEditorRef = useRef<any>(null);

    useEffect(() => {
        if (resume) {
            setContent(resume.content);
            setTitle(resume.title);
        }
    }, [resume]);

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
            margin: 15,
            filename: `${title || 'resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

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
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/resumes")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold font-display text-foreground">Edit Resume</h1>
                            <p className="text-sm text-muted-foreground mt-1">Refine and export your professional resume.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={handleExportPDF} className="gap-2">
                            <Download className="w-4 h-4" /> Export PDF
                        </Button>
                        <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2 bg-primary hover:bg-primary/90">
                            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Resume Title</label>
                    <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="max-w-md font-medium text-lg"
                    />
                </div>

                <div className="premium-resume-container bg-white rounded-xl shadow-lg border border-border p-8 overflow-hidden">
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        editorRef={resumeEditorRef}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
