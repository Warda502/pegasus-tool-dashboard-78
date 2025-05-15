import {
  LayoutDashboard,
  Activity,
  Users,
  UserCircle,
  KeyRound,
  UserPlus,
  History,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/useMobile"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu"
import { useAuth } from "@/hooks/auth/AuthContext"
import { useLanguage } from "@/hooks/useLanguage"
import { Button } from "./button"

interface SidebarLinkProps {
  to: string
  currentPath: string
  children: React.ReactNode
}

function SidebarLink({ to, currentPath, children }: SidebarLinkProps) {
  const navigate = useNavigate()
  const isActive = currentPath === to

  return (
    <Button
      variant="ghost"
      className={cn(
        "justify-start px-4",
        isActive
          ? "bg-secondary text-foreground hover:bg-secondary/80"
          : "hover:bg-secondary/50"
      )}
      onClick={() => navigate(to)}
    >
      {children}
    </Button>
  )
}

export function Sidebar() {
  const { isAdmin, isDistributor } = useAuth();
  const { pathname } = useLocation();
  const { t, isRTL } = useLanguage();
  const { isMobile } = useMobile();
  
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "flex h-full min-w-[200px] flex-col border-r bg-background",
        isMobile ? "fixed inset-y-0 left-0 z-50" : ""
      )}
    >
      <div className="flex flex-col gap-2 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Pegasus Tools
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/2fa")}>
                Two-Factor Auth
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/logout")}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("welcomeToPegasusTools") || "Welcome to Pegasus Tools"}
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className={cn("px-1 py-2")}>
          <h2 className="px-4 text-lg font-semibold tracking-tight">
            {t("menu") || "Menu"}
          </h2>
          <div className="space-y-1 py-2">
            <SidebarLink to="/dashboard" currentPath={pathname}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>{t("dashboard") || "Dashboard"}</span>
            </SidebarLink>
            
            <SidebarLink to="/operations" currentPath={pathname}>
              <Activity className="mr-2 h-4 w-4" />
              <span>{t("operations") || "Operations"}</span>
            </SidebarLink>
            
            {/* Admin specific links */}
            {isAdmin && (
              <>
                <SidebarLink to="/users" currentPath={pathname}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>{t("users") || "Users"}</span>
                </SidebarLink>
                
                <SidebarLink to="/distributors" currentPath={pathname}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>{t("distributors") || "Distributors"}</span>
                </SidebarLink>

                <Separator className="my-2" />
                <h3 className="px-4 text-sm font-medium">
                  {t("settings") || "Settings"}
                </h3>
                <SidebarLink to="/settings" currentPath={pathname}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("general") || "General"}</span>
                </SidebarLink>
              </>
            )}
            
            {/* Distributor specific links */}
            {isDistributor && (
              <>
                <SidebarLink to="/distributor-users" currentPath={pathname}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>{t("myUsers") || "My Users"}</span>
                </SidebarLink>
                
                <SidebarLink to="/distributor-operations" currentPath={pathname}>
                  <History className="mr-2 h-4 w-4" />
                  <span>{t("serverHistory") || "Server History"}</span>
                </SidebarLink>
              </>
            )}
            
            {/* Common links for all users */}
            <SidebarLink to="/profile" currentPath={pathname}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>{t("myProfile") || "My Profile"}</span>
            </SidebarLink>
            
            <SidebarLink to="/2fa" currentPath={pathname}>
              <KeyRound className="mr-2 h-4 w-4" />
              <span>{t("twoFactorAuth") || "Two-Factor Auth"}</span>
            </SidebarLink>
            
            <Separator className="my-2" />
            <h3 className="px-4 text-sm font-medium">
              {t("help") || "Help"}
            </h3>
            <SidebarLink to="/help" currentPath={pathname}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>{t("documentation") || "Documentation"}</span>
            </SidebarLink>
          </div>
        </div>
      </ScrollArea>
      
      <Separator />
      <div className="flex flex-col gap-2 px-6 py-4">
        <Button variant="outline" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout") || "Logout"}
        </Button>
      </div>
    </div>
  );
}
