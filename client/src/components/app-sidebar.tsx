import {
  FileText,
  Mail,
  Target,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Sparkles,
  MessageSquare,
  X,
  Linkedin
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

export function AppSidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();

  const mainNav = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Saved Resumes", url: "/dashboard/resumes", icon: FileText },
    { title: "Cover Letters", url: "/dashboard/cover-letters", icon: Mail },
  ];

  const toolsNav = [
    { title: "Create Resume", url: "/dashboard/resumes/new", icon: Sparkles },
    { title: "Create Cover Letter", url: "/dashboard/cover-letters/new", icon: Briefcase },
    { title: "Job Optimizer", url: "/dashboard/optimize", icon: Target },
    { title: "Interview Coach", url: "/dashboard/interview", icon: MessageSquare },
    { title: "LinkedIn Optimizer", url: "/dashboard/linkedin", icon: Linkedin },
  ];

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar shadow-2xl">
      <SidebarHeader className="p-6 border-b border-border/10 flex flex-row items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 px-1 hover:opacity-80 transition-all active:scale-95">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/10">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-foreground leading-none">CareerForge</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Premium AI</span>
          </div>
        </Link>
        {isMobile && (
          <button
            onClick={() => setOpenMobile(false)}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground active:scale-90 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-6 space-y-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-black px-4 mb-4">Architecture</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-11 mb-1 transition-all duration-300 rounded-xl ${isActive ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5 ring-1 ring-primary/20' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-4">
                        <item.icon className={`h-4.5 w-4.5 transition-transform duration-300 ${isActive ? 'scale-110 text-primary' : 'group-hover:scale-110'}`} />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-4">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-black px-4 mb-4">Forge Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNav.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-11 mb-1 transition-all duration-300 rounded-xl ${isActive ? 'bg-indigo-500/10 text-indigo-500 shadow-sm shadow-indigo-500/5 ring-1 ring-indigo-500/20' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-4">
                        <item.icon className={`h-4.5 w-4.5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/10 p-4 bg-sidebar">
        <div className="flex items-center gap-3 px-2 py-3 group cursor-pointer rounded-2xl bg-background/40 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all duration-500">
          <div className="h-10 w-10 relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative h-full w-full rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20">
              {userInitial}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-medium opacity-60">Pro Account</p>
          </div>
        </div>
        <div className="mt-3 px-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => logout()}
                className="h-10 text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-3 rounded-xl px-4 transition-all duration-300 hover:shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Terminate Session</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
