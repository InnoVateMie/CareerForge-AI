import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Menu } from "lucide-react";
import { Redirect } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { Clock } from "./Clock";
import { DashboardBackground } from "./DashboardBackground";
import { motion, AnimatePresence } from "framer-motion";


export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <DashboardBackground />
      <div className="flex h-screen w-full bg-transparent overflow-hidden relative">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex h-16 md:h-20 items-center justify-between px-4 md:px-8 border-b border-border/10 bg-background/40 backdrop-blur-xl z-20 sticky top-0">
            <div className="flex items-center gap-3 md:gap-4 font-display">
              <SidebarTrigger className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-xl">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="h-6 w-[1px] bg-border/20 mx-1 hidden md:block" />
              <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                <h2 className="text-sm font-bold text-foreground md:text-muted-foreground md:font-medium tracking-tight">CareerForge</h2>
                <span className="text-[10px] md:text-xs font-black text-primary/80 uppercase tracking-widest md:hidden">AI Forge</span>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-6">
              <div className="hidden sm:block">
                <Clock />
              </div>
              <div className="h-8 w-[1px] bg-border/10 mx-2 hidden md:block" />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/5 relative">
            <div className="max-w-7xl mx-auto w-full p-4 md:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={window.location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
