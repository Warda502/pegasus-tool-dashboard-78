
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { t } = useLanguage();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Handle access control based on authentication and roles
  useEffect(() => {
    if (loading || !sessionChecked) {
      return; // Wait until authentication is checked
    }

    if (!hasCheckedAuth) {
      setHasCheckedAuth(true);
      
      if (!isAuthenticated) {
        console.log("ProtectedRoute: User not authenticated, redirecting to login");
        
        // Save the current location so we can redirect back after login
        const currentPath = location.pathname + location.search;
        sessionStorage.setItem("redirectAfterLogin", currentPath);
        
        // Redirect to login page
        navigate("/login", { replace: true });
      } else if (allowedRoles && !allowedRoles.includes(role as UserRole)) {
        console.log(`ProtectedRoute: User role ${role} not allowed for ${location.pathname}`);
        
        toast(t("accessDenied"), {
          description: t("noPermission")
        });
        
        // Redirect to dashboard if the user doesn't have the required role
        navigate("/dashboard", { replace: true });
      }
    }
  }, [role, loading, navigate, allowedRoles, t, isAuthenticated, sessionChecked, location, hasCheckedAuth]);

  // Show loading state during initial authentication check
  if (loading || !sessionChecked || !hasCheckedAuth) {
    return <Loading text={t("loading")} />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};
