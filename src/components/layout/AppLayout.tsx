
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSubButton, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Users, LineChart, Settings, User, Database, FileCheck, FileQuestion, Tags, Group, Download, Sliders, ChevronDown, Globe, CreditCard, ShieldCheck, Percent } from "lucide-react";
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
    icon: ShieldCheck,
    show: true
  }, {
    title: t("settings"),
    path: "/settings",
    icon: Settings,
    show: true
  }].filter(item => item.show);

  // Web Settings submenu items with appropriate icons
  const webSettingsItems = [
    {
      title: t("supportedModels") || "Supported Models",
      path: "/web-settings/supported-models",
      icon: Globe // Globe icon for Supported Models
    }, 
    {
      title: t("pricing") || "Pricing",
      path: "/web-settings/pricing",
      icon: CreditCard // CreditCard icon for Pricing
    },
    {
      title: t("paymentMethods") || "Payment Methods",
      path: "/web-settings/payment-methods",
      icon: CreditCard // CreditCard icon for Payment Methods
    },
    {
      title: t("discountOffers") || "Discount Offers",
      path: "/web-settings/discount-offers", 
      icon: Percent // Percent icon for Discount Offers
    }
  ];
  
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath.includes('/web-settings')) {
      return t("webSettings") || "Web Settings";
    }
    const menuItem = menuItems.find(item => item.path === currentPath);
    return menuItem ? menuItem.title : t("dashboard");
  };
  
  // Reorder menuItems to insert WebSettings before Settings
  const getOrderedMenuItems = () => {
    const orderMenuItems = [...menuItems];
    // Find the index of the Settings item
    const settingsIndex = orderMenuItems.findIndex(item => item.path === "/settings");
    
    if (settingsIndex !== -1 && isAdmin) {
      // Create a WebSettings placeholder (just for display in the sidebar, not a real route)
      const webSettingsItem = {
        title: t("webSettings") || "Web Settings",
        path: "#", // Not used for navigation, since we use Accordion
        icon: Globe,
        show: true
      };
      
      // Insert WebSettings before Settings
      orderMenuItems.splice(settingsIndex, 0, webSettingsItem);
    }
    
    return orderMenuItems;
  };
  
  const orderedMenuItems = getOrderedMenuItems();
  
  return <SidebarProvider defaultOpen={!isMobile}>
      {/* Top Navigation Bar - Enhanced with glass effect */}
      <div className="fixed top-0 left-0 right-0 h-14 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-b dark:border-gray-700 shadow-sm flex items-center justify-between px-4 z-50 transition-all duration-300">
        <div className="flex items-center">
          <h1 className="text-lg font-bold dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{t("pegasusTool")}</h1>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground dark:text-gray-300 mr-3 hidden sm:inline animate-fade-in">
            {t("welcome")}, {userName}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-primary/10 transition-all duration-300">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{userName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 animate-slide-in-from-bottom-5">
              <DropdownMenuItem onClick={() => navigate("/edit-profile")} className="cursor-pointer hover:bg-primary/10 transition-colors">
                <User className="h-4 w-4 mr-2" />
                {t("editProfile")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900 pt-14" dir={isRTL ? "rtl" : "ltr"}>
        <Sidebar side={isRTL ? "right" : "left"} variant={isMobile ? "floating" : "sidebar"}>
          <SidebarHeader className="flex flex-col items-center justify-center p-3 sm:p-4 border-b dark:border-gray-800">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{t("pegasusTool")}</h1>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {orderedMenuItems.map((item, index) => {
                // Check if the current item is WebSettings (use the path to identify it)
                if (item.path === "#" && isAdmin) {
                  return (
                    <SidebarMenuItem key="web-settings-section">
                      <Accordion type="single" collapsible className="w-full" defaultValue={isWebSettingsActive ? "web-settings" : undefined}>
                        <AccordionItem value="web-settings" className="border-none">
                          <AccordionTrigger className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-xs sm:text-sm group transition-all duration-300">
                            <div className="flex items-center gap-2 group-hover:translate-x-1 transition-all">
                              <Globe className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-primary transition-colors" />
                              <span className="group-hover:text-primary transition-colors">{t("webSettings") || "Web Settings"}</span>
                              
                              {/* Active indicator for the parent menu */}
                              {isWebSettingsActive && (
                                <span className="absolute inset-y-0 left-0 w-1 bg-primary rounded-full -ml-2"></span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-1 pb-0 animate-accordion-down">
                            <div className="flex flex-col space-y-1 pl-7">
                              {webSettingsItems.map(subItem => (
                                <SidebarMenuButton 
                                  key={subItem.path} 
                                  asChild 
                                  className="py-2" 
                                  isActive={location.pathname.includes(subItem.path)}
                                >
                                  <button 
                                    onClick={() => navigate(subItem.path)} 
                                    className={cn(
                                      "text-xs sm:text-sm w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-all duration-300 hover:translate-x-1", 
                                      location.pathname.includes(subItem.path) 
                                        ? "bg-primary/10 text-primary font-medium" 
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                    )}
                                  >
                                    <subItem.icon className="h-4 w-4 flex-shrink-0" />
                                    {subItem.title}
                                  </button>
                                </SidebarMenuButton>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </SidebarMenuItem>
                  );
                }
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.path} tooltip={item.title}>
                      <button 
                        onClick={() => navigate(item.path)} 
                        className="w-full text-xs sm:text-sm relative group transition-all duration-300 hover:translate-x-1"
                      >
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:text-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors">{item.title}</span>
                        
                        {/* Active indicator */}
                        {location.pathname === item.path && (
                          <span className="absolute inset-y-0 left-0 w-1 bg-primary rounded-full -ml-2"></span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-2 sm:p-4 text-xs text-center text-muted-foreground dark:text-gray-500">
            {t("allRightsReserved")}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-3 sm:p-6 overflow-auto dark:bg-gray-900 dark:text-white">
          <div className="flex items-center mb-4 sm:mb-6">
            <SidebarTrigger className="text-sm sm:text-base mr-2 rtl:mr-0 rtl:ml-2" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {getCurrentPageTitle()}
            </h1>
          </div>
          
          {/* Add animation to the main content */}
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>;
}
