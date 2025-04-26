
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/hooks/auth/types";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";
import { Loading } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { role, loading, isAuthenticated, sessionChecked } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Handle access control based on authentication and roles
  useEffect(() => {
    if (loading || !sessionChecked) {
      return; // Wait until authentication is checked
    }

    let redirectTimer: number | null = null;

    if (!isAuthenticated) {
      console.log("ProtectedRoute: User not authenticated, redirecting to login");
      
      // Avoid redirecting when already on login page
      if (window.location.pathname !== '/login') {
        redirectTimer = window.setTimeout(() => {
          navigate("/login");
        }, 100);
      }
    } else if (allowedRoles && !allowedRoles.includes(role as UserRole)) {
      console.log(`ProtectedRoute: User role ${role} not allowed, redirecting to dashboard`);
      
      toast(t("accessDenied"), {
        description: t("noPermission")
      });
      
      redirectTimer = window.setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    }
    
    return () => {
      if (redirectTimer) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [role, loading, navigate, allowedRoles, t, isAuthenticated, sessionChecked]);

  // Show loading state during initial authentication check
  if (loading || !sessionChecked) {
    return <Loading text={t("loading")} />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};
