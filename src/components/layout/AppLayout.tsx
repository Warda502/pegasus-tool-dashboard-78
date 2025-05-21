import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Sun, Moon, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useSharedData } from "@/hooks/data/DataContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { User, Settings } from "lucide-react";

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t, isRTL } = useLanguage();
  const { role, logout, user, isAdmin } = useAuth();
  const { users } = useSharedData();
  
  useEffect(() => {
    console.log("AppLayout mounted, checking auth status:", { 
      userId: user?.id, 
      role, 
      isAdmin,
      pathName: location.pathname
    });
  }, [user, role, isAdmin, location.pathname]);
  
  const userName = user?.name || users?.find(u => u.id === user?.id)?.name || user?.email?.split('@')[0] || t("guest");
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  
  // Handle dark mode toggle
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };
  
  const handleLogout = async () => {
    await logout();
  };

  // Check if any sub-route of web-settings is active
  const isWebSettingsActive = location.pathname.includes('/web-settings');
  
  // Generate user initial for avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";
  
  // Get random pastel color based on username (for avatar background)
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-200 text-red-700',
      'bg-blue-200 text-blue-700', 
      'bg-green-200 text-green-700',
      'bg-yellow-200 text-yellow-700',
      'bg-purple-200 text-purple-700',
      'bg-pink-200 text-pink-700',
      'bg-indigo-200 text-indigo-700',
      'bg-teal-200 text-teal-700'
    ];
    
    // Simple hash function for consistent color selection
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };
  
  const avatarColor = getAvatarColor(userName);

  // Function to get current page title
  function getCurrentPageTitle() {
    const paths = {
      '/dashboard': t("dashboard"),
      '/operations': t("operations"),
      '/distributor-users': t("users") || "المستخدمين",
      '/distributor-operations': t("usersOperations") || "عمليات المستخدمين",
      '/users': t("users"),
      '/distributors': t("distributors") || "الموزعون",
      '/server-api': t("serverApiData"),
      '/server-storage': t("serverStorage"),
      '/discounts': t("discounts"),
      '/groups': t("groupsManagement"),
      '/tool-settings': t("toolSettings"),
      '/tool-update': t("toolUpdate"),
      '/profile': t("editProfile"),
      '/my-files': t("myCertFiles"),
      '/settings': t("settings")
    };
    
    if (location.pathname.includes('/web-settings')) {
      return t("webSettings") || "Web Settings";
    }
    
    return paths[location.pathname as keyof typeof paths] || t("dashboard");
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      {/* Enhanced Top Navigation Bar with glass effect and elevation */}
      <div className="fixed top-0 left-0 right-0 h-16 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b dark:border-gray-800 shadow-sm flex items-center justify-between px-4 z-50 transition-all duration-300">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors" />
          
          <div className="flex items-center">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hover-scale">
              {t("pegasusTool")}
            </h1>
          </div>
          
          {/* Current page title - show on desktop */}
          <div className="hidden md:flex items-center">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              / {getCurrentPageTitle()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isDarkMode ? t("lightMode") : t("darkMode")}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-blue-700" />
            )}
          </Button>
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          {/* Welcome message and user dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2 hidden sm:block">
              {t("welcome")}, {userName}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 p-1 pr-2"
                >
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className={`${avatarColor} text-sm font-medium`}>
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 mt-1 animate-slide-in-from-bottom-5 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                
                <DropdownMenuItem 
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 py-2"
                >
                  <User className="h-4 w-4" />
                  {t("editProfile")}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => navigate("/settings")} 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 py-2"
                >
                  <Settings className="h-4 w-4" />
                  {t("settings")}
                </DropdownMenuItem>
                
                <div className="px-1 py-1 border-t border-gray-100 dark:border-gray-800 mt-1">
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 py-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900 pt-16" dir={isRTL ? "rtl" : "ltr"}>
        <AppSidebar />

        <main className="flex-1 p-3 sm:p-6 overflow-auto dark:bg-gray-900 dark:text-white">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
