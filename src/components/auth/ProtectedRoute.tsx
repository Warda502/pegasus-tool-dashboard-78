
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && (!role || (allowedRoles && !allowedRoles.includes(role)))) {
      toast(t("accessDenied"), {
        description: t("noPermission")
      });
      navigate("/");
    }
  }, [role, loading, navigate, allowedRoles, t]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      {t("loading")}
    </div>;
  }

  return <>{children}</>;
};
