import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Trash2, Edit, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useCoverLetters, useDeleteCoverLetter } from "@/hooks/use-cover-letters";
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

export default function CoverLetters() {
  const { data: letters, isLoading } = useCoverLetters();
  const deleteMutation = useDeleteCoverLetter();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Cover letter deleted successfully" });
    } catch (e) {
      toast({ title: "Failed to delete cover letter", variant: "destructive" });
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
          <h1 className="text-3xl font-bold font-display text-foreground">Cover Letters</h1>
          <p className="text-muted-foreground mt-1">Manage your tailored cover letters</p>
        </div>
        <Button asChild className="gap-2 shadow-lg shadow-primary/20">
          <Link href="/dashboard/cover-letters/new">
            <Plus className="w-4 h-4" /> Create New
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : letters?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed text-center px-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No cover letters yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">Create persuasive cover letters that perfectly align with your target roles.</p>
          <Button asChild>
            <Link href="/dashboard/cover-letters/new">Create Cover Letter</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters?.map(letter => (
            <div key={letter.id} className="group flex flex-col bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-accent/30 transition-all duration-300 p-6">
              <div className="h-10 w-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">{letter.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Created {formatDateTime(letter.createdAt!)}
              </p>

              <div className="mt-auto flex items-center gap-2 pt-4 border-t border-border/50">
                <Button asChild variant="secondary" className="flex-1">
                  <Link href={`/dashboard/cover-letters/${letter.id}`}>
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
                        This action cannot be undone. This will permanently delete your cover letter "{letter.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(letter.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
