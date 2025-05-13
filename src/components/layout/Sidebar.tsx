
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuthState";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Building2,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  Home,
  KeyRound,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  ShieldAlert,
  Store,
  TreePine,
  Users2,
  Wallet,
  World,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export default function Sidebar() {
  const { t } = useLanguage();
  const location = useLocation();
  const { isAuthenticated, isAdmin, role } = useAuth();
  const [webSettingsOpen, setWebSettingsOpen] = useState(false);

  // Effect to open the Web Settings sub-menu when a child route is active
  useEffect(() => {
    if (
      location.pathname.includes("/web-settings") &&
      !webSettingsOpen
    ) {
      setWebSettingsOpen(true);
    }
  }, [location.pathname, webSettingsOpen]);

  if (!isAuthenticated) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          as={Link}
          to="/dashboard"
          isActive={location.pathname === "/dashboard"}
          tooltip={t("dashboard")}
        >
          <LayoutDashboard />
          {t("dashboard")}
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          as={Link}
          to="/operations"
          isActive={location.pathname === "/operations"}
          tooltip={t("operations")}
        >
          <FileText />
          {t("operations")}
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isAdmin && (
        <>
          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              to="/users-manager"
              isActive={location.pathname === "/users-manager"}
              tooltip={t("usersManager")}
            >
              <Users2 />
              {t("usersManager")}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              to="/distributors"
              isActive={location.pathname === "/distributors"}
              tooltip={t("distributorsManagement")}
            >
              <Building2 />
              {t("distributorsManagement")}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              to="/discounts"
              isActive={location.pathname === "/discounts"}
              tooltip={t("discounts")}
            >
              <Percent />
              {t("discounts")}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              to="/groups-management"
              isActive={location.pathname === "/groups-management"}
              tooltip={t("groupsManagement")}
            >
              <Package />
              {t("groupsManagement")}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </>
      )}

      <SidebarMenuItem>
        <SidebarMenuButton
          as={Link}
          to="/my-cert-files"
          isActive={location.pathname === "/my-cert-files"}
          tooltip={t("myCertFiles")}
        >
          <KeyRound />
          {t("myCertFiles")}
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isAdmin && (
        <>
          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              to="/server-api-data"
              isActive={location.pathname === "/server-api-data"}
              tooltip={t("serverApiData")}
            >
              <Globe />
              {t("serverApiData")}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              to="/server-storage"
              isActive={location.pathname === "/server-storage"}
              tooltip={t("serverStorage")}
            >
              <TreePine />
              {t("serverStorage")}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              to="/tool-update"
              isActive={location.pathname === "/tool-update"}
              tooltip={t("toolUpdate")}
            >
              <World />
              {t("toolUpdate")}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              to="/tool-settings"
              isActive={location.pathname === "/tool-settings"}
              tooltip={t("toolSettings")}
            >
              <Settings />
              {t("toolSettings")}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setWebSettingsOpen(!webSettingsOpen)}
              isActive={location.pathname.includes("/web-settings")}
              tooltip={t("webSettings")}
            >
              <CreditCard />
              <span>{t("webSettings")}</span>
              <ChevronRight
                className={`ml-auto h-4 w-4 transition-transform ${
                  webSettingsOpen ? "rotate-90" : ""
                }`}
              />
            </SidebarMenuButton>

            {webSettingsOpen && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    as={Link}
                    to="/web-settings/supported-models"
                    isActive={
                      location.pathname === "/web-settings/supported-models"
                    }
                  >
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    {t("supportedModels")}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    as={Link}
                    to="/web-settings/pricing"
                    isActive={location.pathname === "/web-settings/pricing"}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    {t("pricing")}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        </>
      )}

      <SidebarMenuItem>
        <SidebarMenuButton
          as={Link}
          to="/settings"
          isActive={location.pathname === "/settings"}
          tooltip={t("settings")}
        >
          <Settings />
          {t("settings")}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
