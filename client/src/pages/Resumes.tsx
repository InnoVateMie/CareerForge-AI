import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2, Edit, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useResumes, useDeleteResume } from "@/hooks/use-resumes";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";

export default function Resumes() {
  const { data: resumes, isLoading } = useResumes();
  const deleteMutation = useDeleteResume();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Resume deleted successfully" });
    } catch (e) {
      toast({ title: "Failed to delete resume", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      {/* Mobile: back to dashboard */}
      <div className="flex items-center gap-2 mb-4 md:hidden">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="gap-1 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Saved Resumes</h1>
          <p className="text-muted-foreground mt-1">Manage and edit your generated resumes</p>
        </div>
        <Button asChild className="gap-2 shadow-lg shadow-primary/20">
          <Link href="/dashboard/resumes/new">
            <Plus className="w-4 h-4" /> Create New
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : resumes?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed text-center px-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No resumes yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">Create your first AI-powered resume tailored specifically to your target job description.</p>
          <Button asChild>
            <Link href="/dashboard/resumes/new">Create Resume</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes?.map(resume => (
            <div key={resume.id} className="group flex flex-col bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 p-6">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">{resume.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Created {formatDateTime(resume.createdAt!)}
              </p>

              <div className="mt-auto flex items-center gap-2 pt-4 border-t border-border/50">
                <Button asChild variant="secondary" className="flex-1">
                  <Link href={`/dashboard/resumes/${resume.id}`}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your resume "{resume.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(resume.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
