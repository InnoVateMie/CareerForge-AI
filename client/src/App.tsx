import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "./pages/Landing";
import DashboardHome from "./pages/DashboardHome";
import Resumes from "./pages/Resumes";
import CreateResume from "./pages/CreateResume";
import CoverLetters from "./pages/CoverLetters";
import CreateCoverLetter from "./pages/CreateCoverLetter";
import JobOptimizer from "./pages/JobOptimizer";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={DashboardHome} />
      
      {/* Resumes */}
      <Route path="/dashboard/resumes" component={Resumes} />
      <Route path="/dashboard/resumes/new" component={CreateResume} />
      
      {/* Cover Letters */}
      <Route path="/dashboard/cover-letters" component={CoverLetters} />
      <Route path="/dashboard/cover-letters/new" component={CreateCoverLetter} />
      
      {/* Optimizer */}
      <Route path="/dashboard/optimize" component={JobOptimizer} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
