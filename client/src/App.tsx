import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";

import Landing from "./pages/Landing";
import AuthPage from "./pages/Auth";
import DashboardHome from "./pages/DashboardHome";
import Resumes from "./pages/Resumes";
import CreateResume from "./pages/CreateResume";
import CoverLetters from "./pages/CoverLetters";
import CreateCoverLetter from "./pages/CreateCoverLetter";
import JobOptimizer from "./pages/JobOptimizer";
import InterviewCoach from "./pages/InterviewCoach";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard" component={DashboardHome} />

      {/* Resumes */}
      <Route path="/dashboard/resumes" component={Resumes} />
      <Route path="/dashboard/resumes/new" component={CreateResume} />

      {/* Cover Letters */}
      <Route path="/dashboard/cover-letters" component={CoverLetters} />
      <Route path="/dashboard/cover-letters/new" component={CreateCoverLetter} />

      {/* Optimizer */}
      <Route path="/dashboard/optimize" component={JobOptimizer} />

      {/* Interview Coach */}
      <Route path="/dashboard/interview" component={InterviewCoach} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="career-forge-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
