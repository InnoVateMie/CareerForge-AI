import {
  FileText,
  Mail,
  Target,
  Briefcase,
  LayoutDashboard,
  LogOut,
  Sparkles,
  MessageSquare
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
  SidebarHeader
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

export function AppSidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

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
  ];

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="p-4 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">CareerForge <span className="text-primary">AI</span></span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-4 mb-2">Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`mb-1 transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-4 mb-2">AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNav.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`mb-1 transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-md">
                        <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/10 p-6 bg-muted/5">
        <div className="flex items-center gap-4 px-2 mb-6 group cursor-pointer p-2 rounded-2xl hover:bg-primary/5 transition-all duration-300">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-base shadow-lg shadow-primary/20">
            {user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-bold text-foreground truncate">{user?.user_metadata?.first_name || user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{user?.email}</p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-3 rounded-md px-3 py-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
