import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSubButton, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Users, LineChart, Settings, User, Database, FileCheck, FileQuestion, Tags, Group, Download, Sliders, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useSharedData } from "@/hooks/data/DataContext";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    t,
    isRTL
  } = useLanguage();
  const {
    role,
    logout,
    user,
    isAdmin
  } = useAuth();
  const {
    users
  } = useSharedData();
  const userName = user?.name || users?.find(u => u.id === user?.id)?.name || user?.email?.split('@')[0] || t("guest");
  const handleLogout = async () => {
    await logout();
  };

  // Check if any sub-route of web-settings is active
  const isWebSettingsActive = location.pathname.includes('/web-settings');
  const menuItems = [{
    title: t("dashboard"),
    path: "/dashboard",
    icon: Home,
    show: true
  }, {
    title: t("editProfile"),
    path: "/edit-profile",
    icon: User,
    show: !isAdmin
  }, {
    title: t("myCertFiles"),
    path: "/my-cert-files",
    icon: FileCheck,
    show: !isAdmin
  }, {
    title: t("users"),
    path: "/users-manager",
    icon: Users,
    show: role === "admin"
  }, {
    title: t("operations"),
    path: "/operations",
    icon: LineChart,
    show: true
  }, {
    title: t("discounts"),
    path: "/discounts",
    icon: Tags,
    show: role === "admin"
  }, {
    title: t("groupsManagement"),
    path: "/groups-management",
    icon: Group,
    show: role === "admin"
  }, {
    title: t("toolUpdate"),
    path: "/tool-update",
    icon: Download,
    show: role === "admin"
  }, {
    title: t("toolSettings"),
    path: "/tool-settings",
    icon: Sliders,
    show: role === "admin"
  }, {
    title: t("serverApiData"),
    path: "/server-api-data",
    icon: Database,
    show: role === "admin"
  }, {
    title: t("serverStorage"),
    path: "/server-storage",
    icon: FileQuestion,
    show: role === "admin"
  }, {
    title: t("TwoFactorAuth"),
    path: "/two-factor-auth",
    icon: FileQuestion,
    show: true
  }, {
    title: t("settings"),
    path: "/settings",
    icon: Settings,
    show: true
  }].filter(item => item.show);

  // Web Settings submenu items
  const webSettingsItems = [{
    title: t("supportedModels") || "Supported Models",
    path: "/web-settings/supported-models"
  }, {
    title: t("pricing") || "Pricing",
    path: "/web-settings/pricing"
  }];
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath.includes('/web-settings')) {
      return t("webSettings") || "Web Settings";
    }
    const menuItem = menuItems.find(item => item.path === currentPath);
    return menuItem ? menuItem.title : t("dashboard");
  };
  return <SidebarProvider defaultOpen={!isMobile}>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm flex items-center justify-between px-4 z-50">
        <div className="flex items-center">
          <h1 className="text-lg font-bold dark:text-white">{t("pegasusTool")}</h1>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground dark:text-gray-300 mr-3 hidden sm:inline">
            {t("welcome")}, {userName}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/edit-profile")} className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                {t("editProfile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900 pt-14" dir={isRTL ? "rtl" : "ltr"}>
        <Sidebar side={isRTL ? "right" : "left"} variant={isMobile ? "floating" : "sidebar"}>
          <SidebarHeader className="flex flex-col items-center justify-center p-3 sm:p-4 border-b dark:border-gray-800">
            <h1 className="text-lg sm:text-xl font-bold dark:text-white">{t("pegasusTool")}</h1>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path} tooltip={item.title}>
                    <button onClick={() => navigate(item.path)} className="w-full text-xs sm:text-sm relative">
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
              
              {/* Web Settings Accordion Menu - Admin Only */}
              {isAdmin && <SidebarMenuItem>
                  <Accordion type="single" collapsible className="w-full" defaultValue={isWebSettingsActive ? "web-settings" : undefined}>
                    <AccordionItem value="web-settings" className="border-none">
                      <AccordionTrigger className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>{t("webSettings") || "Web Settings"}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0">
                        <div className="flex flex-col space-y-1 pl-7">
                          {webSettingsItems.map(subItem => <SidebarMenuButton key={subItem.path} asChild className="py-2" isActive={location.pathname.includes(subItem.path)}>
                              <button onClick={() => navigate(subItem.path)} className={cn("text-xs sm:text-sm w-full text-left px-3 py-2 rounded-md", location.pathname.includes(subItem.path) ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800")}>
                                {subItem.title}
                              </button>
                            </SidebarMenuButton>)}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </SidebarMenuItem>}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-2 sm:p-4 text-xs text-center text-muted-foreground dark:text-gray-500">
            {t("allRightsReserved")}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-3 sm:p-6 overflow-auto dark:bg-gray-900 dark:text-white">
          <div className="flex items-center mb-4 sm:mb-6">
            <SidebarTrigger className="text-sm sm:text-base mr-2 rtl:mr-0 rtl:ml-2" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {getCurrentPageTitle()}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>;
}