
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Users, 
  LineChart, 
  Settings, 
  User, 
  Database, 
  FileCheck, 
  FileQuestion, 
  Tags, 
  Group, 
  Download, 
  Sliders, 
  Globe 
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/auth/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, children, onClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === to;
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        isActive={isActive}
        className={cn(
          "w-full text-left px-3 py-2 rounded-md",
          isActive && "bg-primary/10 text-primary font-medium"
        )} 
        onClick={() => {
          navigate(to);
          if (onClick) onClick();
        }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{children}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <SidebarGroup>
      {title && (
        <SidebarGroupLabel className="px-3 py-2">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {children}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export function AppSidebar() {
  const { t, isRTL } = useLanguage();
  const { isAdmin, isDistributor } = useAuth();
  
  return (
    <Sidebar side={isRTL ? "right" : "left"}>
      <SidebarContent>
        <SidebarSection>
          <SidebarLink
            to="/dashboard"
            icon={<Home className="h-4 w-4" />}
          >
            {t("dashboard")}
          </SidebarLink>

          <SidebarLink
            to="/operations"
            icon={<LineChart className="h-4 w-4" />}
          >
            {t("operations")}
          </SidebarLink>
        </SidebarSection>

        {/* Distributor Links */}
        {isDistributor && (
          <SidebarSection title={t("distributorSection") || "قسم الموزع"}>
            <SidebarLink
              to="/distributor-users"
              icon={<Users className="h-4 w-4" />}
            >
              {t("users") || "المستخدمين"}
            </SidebarLink>
            <SidebarLink
              to="/distributor-operations"
              icon={<LineChart className="h-4 w-4" />}
            >
              {t("usersOperations") || "عمليات المستخدمين"}
            </SidebarLink>
          </SidebarSection>
        )}

        {/* Admin Links */}
        {isAdmin && (
          <SidebarSection title={t("admin") || "الإدارة"}>
            <SidebarLink
              to="/users"
              icon={<Users className="h-4 w-4" />}
            >
              {t("users")}
            </SidebarLink>
            
            <SidebarLink
              to="/distributors"
              icon={<Users className="h-4 w-4" />}
            >
              {t("distributors") || "الموزعون"}
            </SidebarLink>
            
            <SidebarLink
              to="/server-api"
              icon={<Database className="h-4 w-4" />}
            >
              {t("serverApiData")}
            </SidebarLink>

            <SidebarLink
              to="/server-storage"
              icon={<FileQuestion className="h-4 w-4" />}
            >
              {t("serverStorage")}
            </SidebarLink>

            <SidebarLink
              to="/discounts"
              icon={<Tags className="h-4 w-4" />}
            >
              {t("discounts")}
            </SidebarLink>

            <SidebarLink
              to="/groups"
              icon={<Group className="h-4 w-4" />}
            >
              {t("groups")}
            </SidebarLink>

            <SidebarLink
              to="/tool-settings"
              icon={<Settings className="h-4 w-4" />}
            >
              {t("toolSettings")}
            </SidebarLink>

            <SidebarLink
              to="/tool-update"
              icon={<Download className="h-4 w-4" />}
            >
              {t("toolUpdate")}
            </SidebarLink>
          </SidebarSection>
        )}

        {/* Settings section */}
        <SidebarSection title={t("settings") || "الإعدادات"}>
          <SidebarLink
            to="/profile"
            icon={<User className="h-4 w-4" />}
          >
            {t("editProfile")}
          </SidebarLink>

          <SidebarLink
            to="/my-files"
            icon={<FileCheck className="h-4 w-4" />}
          >
            {t("myCertFiles")}
          </SidebarLink>

          <SidebarLink
            to="/settings"
            icon={<Sliders className="h-4 w-4" />}
          >
            {t("appearance")}
          </SidebarLink>

          {isAdmin && (
            <SidebarLink
              to="/web-settings"
              icon={<Globe className="h-4 w-4" />}
            >
              {t("webSettings")}
            </SidebarLink>
          )}
        </SidebarSection>
      </SidebarContent>
    </Sidebar>
  );
}
