import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Target, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useResumes } from "@/hooks/use-resumes";
import { useCoverLetters } from "@/hooks/use-cover-letters";

export default function DashboardHome() {
  const { data: resumes } = useResumes();
  const { data: coverLetters } = useCoverLetters();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-foreground">Welcome to CareerForge</h1>
        <p className="text-muted-foreground mt-2">What would you like to build today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <CardTitle>AI Resume Builder</CardTitle>
            <CardDescription>Generate a tailored resume based on your experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/dashboard/resumes/new">
                Create Resume <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:border-accent/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <CardTitle>Cover Letter</CardTitle>
            <CardDescription>Craft a compelling narrative for your target role.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full hover:bg-accent hover:text-white border-accent/20 transition-colors">
              <Link href="/dashboard/cover-letters/new">
                Create Cover Letter <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <CardTitle>Job Optimizer</CardTitle>
            <CardDescription>Match your resume against a specific job description.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full hover:bg-blue-500 hover:text-white border-blue-500/20 transition-colors">
              <Link href="/dashboard/optimize">
                Analyze Match <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" /> Recent Resumes
            </h2>
            <Link href="/dashboard/resumes" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          {resumes?.length === 0 ? (
            <div className="border border-dashed rounded-xl p-8 text-center bg-card/50">
              <p className="text-muted-foreground mb-4">No resumes yet</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/resumes/new">Create your first resume</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes?.slice(0, 3).map(resume => (
                <div key={resume.id} className="p-4 rounded-xl bg-card border hover:shadow-md transition-shadow flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-foreground">{resume.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Edited {new Date(resume.updatedAt!).toLocaleDateString()}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/resumes/${resume.id}`}>Edit</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <Mail className="w-5 h-5 text-muted-foreground" /> Recent Cover Letters
            </h2>
            <Link href="/dashboard/cover-letters" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          {coverLetters?.length === 0 ? (
            <div className="border border-dashed rounded-xl p-8 text-center bg-card/50">
              <p className="text-muted-foreground mb-4">No cover letters yet</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/cover-letters/new">Create your first letter</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {coverLetters?.slice(0, 3).map(letter => (
                <div key={letter.id} className="p-4 rounded-xl bg-card border hover:shadow-md transition-shadow flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-foreground">{letter.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Edited {new Date(letter.updatedAt!).toLocaleDateString()}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/cover-letters/${letter.id}`}>Edit</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
