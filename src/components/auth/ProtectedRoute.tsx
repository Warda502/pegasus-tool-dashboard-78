
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { role, loading, isAuthenticated, sessionChecked, checkSession } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isChecking, setIsChecking] = useState(true);

  // Check session when the component mounts and sessionChecked is true
  useEffect(() => {
    const verifySession = async () => {
      if (!sessionChecked) return;
      
      console.log("ProtectedRoute: Verifying session...");
      setIsChecking(true);
      
      const isSessionValid = await checkSession();
      console.log("ProtectedRoute: Session valid?", isSessionValid);
      
      setIsChecking(false);
    };
    
    verifySession();
  }, [sessionChecked, checkSession]);

  // Handle access control based on authentication and roles
  useEffect(() => {
    let redirectTimeout: number | null = null;
    
    if (!loading && sessionChecked && !isChecking) {
      if (!isAuthenticated) {
        console.log("ProtectedRoute: User not authenticated, redirecting to login");
        
        // Avoid redirecting when already on login page
        if (window.location.pathname !== '/login') {
          redirectTimeout = window.setTimeout(() => {
            navigate("/login");
          }, 100);
        }
      } else if (allowedRoles && !allowedRoles.includes(role as UserRole)) {
        console.log(`ProtectedRoute: User role ${role} not allowed, redirecting to dashboard`);
        
        toast(t("accessDenied"), {
          description: t("noPermission")
        });
        
        redirectTimeout = window.setTimeout(() => {
          navigate("/dashboard");
        }, 100);
      }
    }
    
    return () => {
      if (redirectTimeout) {
        window.clearTimeout(redirectTimeout);
      }
    };
  }, [role, loading, navigate, allowedRoles, t, isAuthenticated, sessionChecked, isChecking]);

  // Show loading state while checking
  if (loading || isChecking) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-700">{t("loading")}</p>
      </div>
    </div>;
  }

  return <>{children}</>;
};
