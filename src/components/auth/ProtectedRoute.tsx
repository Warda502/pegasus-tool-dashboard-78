
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { 
    isAuthenticated, 
    loading, 
    role, 
    sessionChecked, 
    needsTwoFactor, 
    twoFactorVerified,
    initialized,
    checkSession
  } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  const [verifyingAuth, setVerifyingAuth] = useState(true);
  
  useEffect(() => {
    console.log("ProtectedRoute mounted for path:", location.pathname);
    
    let isMounted = true;
    
    // Double-check session validity on protected route mount
    const verifySession = async () => {
      if (!sessionChecked || !initialized) return;
      
      try {
        // Re-verify session with the server
        const isSessionValid = await checkSession();
        
        if (isMounted) {
          console.log("Session validity check result:", isSessionValid);
          setVerifyingAuth(false);
        }
        
        if (!isSessionValid && isMounted) {
          toast(t("sessionInvalid") || "جلسة غير صالحة", {
            description: t("pleaseLoginAgain") || "يرجى تسجيل الدخول مجددًا"
          });
        }
      } catch (err) {
        console.error("Error verifying session:", err);
        if (isMounted) setVerifyingAuth(false);
      }
    };
    
    verifySession();
    
    return () => {
      isMounted = false;
    };
  }, [location.pathname, sessionChecked, initialized, checkSession, t]);
  
  useEffect(() => {
    console.log("ProtectedRoute state:", {
      isAuthenticated,
      role,
      loading,
      sessionChecked,
      needsTwoFactor,
      twoFactorVerified,
      verifyingAuth,
      initialized,
      canAccess: isAuthenticated && (!needsTwoFactor || twoFactorVerified)
    });
  }, [isAuthenticated, role, loading, sessionChecked, needsTwoFactor, twoFactorVerified, verifyingAuth, initialized]);

  // Show loading while checking authentication
  if (loading || verifyingAuth || !sessionChecked || !initialized) {
    return <Loading text={t("verifyingAuthentication") || "جاري التحقق من الصلاحيات..."} />;
  }
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    console.log("Access denied: Not authenticated - redirecting to /login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If 2FA is required but not verified, redirect to 2FA page
  if (needsTwoFactor && !twoFactorVerified) {
    console.log("Access denied: 2FA required but not verified - redirecting to /two-factor");
    return <Navigate to="/two-factor" replace />;
  }
  
  // If roles are specified, check if user has permission
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    console.log("Access denied: User role", role, "not in allowed roles:", allowedRoles);
    toast(t("accessDenied") || "وصول مرفوض", {
      description: t("insufficientPermissions") || "ليس لديك صلاحيات كافية للوصول إلى هذه الصفحة"
    });
    return <Navigate to="/dashboard" replace />;
  }

  // After all checks pass, render the protected content
  return <>{children}</>;
};
