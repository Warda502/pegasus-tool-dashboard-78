
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Users, LineChart, Settings, User, Database, FileQuestion } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useSharedData } from "@/hooks/data/DataContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t, isRTL } = useLanguage();
  const { role, logout, user, isAdmin } = useAuth();
  const { users } = useSharedData();

  const userName = user?.name || users?.find(u => u.id === user?.id)?.name || user?.email?.split('@')[0] || t("guest");

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      title: t("dashboard"),
      path: "/dashboard",
      icon: Home,
      show: true
    },
    {
      title: t("editProfile"),
      path: "/edit-profile",
      icon: User,
      show: !isAdmin
    },
    {
      title: t("users"),
      path: "/users-manager",
      icon: Users,
      show: role === "admin"
    },
    {
      title: t("operations"),
      path: "/operations",
      icon: LineChart,
      show: true
    },
    {
      title: t("serverApiData"),
      path: "/server-api-data",
      icon: Database,
      show: role === "admin"
    },
    {
      title: t("serverStorage"),
      path: "/server-storage",
      icon: FileQuestion,
      show: role === "admin"
    },
    {
      title: t("settings"),
      path: "/settings",
      icon: Settings,
      show: true
    }
  ].filter(item => item.show);

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find(item => item.path === currentPath);
    return menuItem ? menuItem.title : t("dashboard");
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gray-100">
        <Sidebar dir={isRTL ? "rtl" : "ltr"} variant={isMobile ? "floating" : "sidebar"}>
          <SidebarHeader className="flex flex-col items-center justify-center p-4 border-b">
            <h1 className="text-xl font-bold">{t("pegasusTool")}</h1>
            <div className="flex items-center justify-between w-full mt-2">
              <span className="text-sm text-muted-foreground">
                {t("welcome")}, {userName}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-1" />
                <span className="text-xs">{t("logout")}</span>
              </Button>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <button 
                      onClick={() => navigate(item.path)}
                      className="w-full"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-4 text-xs text-center text-muted-foreground">
            {t("allRightsReserved")}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="flex items-center mb-6">
            <SidebarTrigger className={isRTL ? "ml-2" : "mr-2"} />
            <h1 className="text-2xl font-bold text-gray-900">
              {getCurrentPageTitle()}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
