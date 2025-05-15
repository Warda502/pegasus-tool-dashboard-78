
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Users, LineChart, Settings, User, Database, FileCheck, FileQuestion, Tags, Group, Download, Sliders, ChevronDown, Globe, CreditCard, ShieldCheck, Percent } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useSharedData } from "@/hooks/data/DataContext";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/ui/sidebar";

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
  const userName = user?.email?.split('@')[0] || t("guest");
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
  
  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900" dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <div className={cn(
        "flex h-full min-w-[200px] flex-col border-r bg-background",
        isMobile ? "fixed inset-y-0 left-0 z-50 hidden" : ""
      )}>
        <div className="flex flex-col gap-2 px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Pegasus Tools
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("welcomeToPegasusTools") || "Welcome to Pegasus Tools"}
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              {t("menu") || "Menu"}
            </h2>
            <div className="space-y-1">
              {orderedMenuItems.map((item, index) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => item.path !== "#" && navigate(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("logout") || "Logout"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Navigation Bar */}
        <header className="flex h-14 items-center border-b px-4">
          <Button variant="ghost" size="icon" className="mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-medium">{getCurrentPageTitle()}</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{userName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
