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
import { LogOut, Home, Users, LineChart, Settings, User, Database, FileCheck, FileQuestion, Tags, Group, Download, Sliders, MessageSquare, BellRing } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useSharedData } from "@/hooks/data/DataContext";
import { ChatSupportButton } from "@/components/chat/ChatSupportButton";
import { useEffect, useState } from "react";
import { useChatSupport } from "@/hooks/useChatSupport";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t, isRTL } = useLanguage();
  const { role, logout, user, isAdmin } = useAuth();
  const { users } = useSharedData();
  const { getUnreadCount } = useChatSupport();
  const [animate, setAnimate] = useState(false);

  const userName = user?.name || users?.find(u => u.id === user?.id)?.name || user?.email?.split('@')[0] || t("guest");

  const unreadCount = getUnreadCount();
  const isChatPage = location.pathname === "/chat-support";

  // Effect to trigger notification animation every 2 seconds when there are unread messages
  useEffect(() => {
    if (unreadCount > 0 && !isChatPage) {
      const interval = setInterval(() => {
        setAnimate(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      setAnimate(false);
    }
  }, [unreadCount, isChatPage]);

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
      title: t("myCertFiles"),
      path: "/my-cert-files",
      icon: FileCheck,
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
      title: t("discounts"),
      path: "/discounts",
      icon: Tags,
      show: role === "admin"
    },
    {
      title: t("groupsManagement"),
      path: "/groups-management",
      icon: Group,
      show: role === "admin"
    },
    {
      title: t("chatSupport"),
      path: "/chat-support",
      icon: MessageSquare,
      show: role === "admin",
      notificationIcon: unreadCount > 0 ? (
        <div className={cn(
          "absolute -left-1 -top-1",
          animate ? "animate-fade-in" : "opacity-0"
        )}>
          <BellRing className="h-3 w-3 text-amber-500" />
        </div>
      ) : null,
      badge: unreadCount > 0 ? unreadCount : null,
      animateBadge: animate
    },
    {
      title: t("toolUpdate"),
      path: "/tool-update",
      icon: Download,
      show: role === "admin"
    },
    {
      title: t("toolSettings"),
      path: "/tool-settings",
      icon: Sliders,
      show: role === "admin"
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
          <SidebarHeader className="flex flex-col items-center justify-center p-3 sm:p-4 border-b">
            <h1 className="text-lg sm:text-xl font-bold">{t("pegasusTool")}</h1>
            <div className="flex flex-col sm:flex-row items-center sm:justify-between w-full mt-2 gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground truncate">
                {t("welcome")}, {userName}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs h-7 px-2">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{t("logout")}</span>
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
                      className="w-full text-xs sm:text-sm relative"
                    >
                      {item.notificationIcon}
                      <item.icon className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5",
                        animate && item.badge ? "text-primary" : ""
                      )} />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className={cn(
                          "absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground",
                          item.animateBadge ? "animate-pulse" : ""
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-2 sm:p-4 text-xs text-center text-muted-foreground">
            {!isAdmin && (
              <div className="mb-2">
                <ChatSupportButton />
              </div>
            )}
            {t("allRightsReserved")}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          <div className="flex items-center mb-4 sm:mb-6">
            <SidebarTrigger className={`${isRTL ? "ml-2" : "mr-2"} text-sm sm:text-base`} />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {getCurrentPageTitle()}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
