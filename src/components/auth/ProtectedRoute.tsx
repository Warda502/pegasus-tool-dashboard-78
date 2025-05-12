
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/hooks/useLanguage";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, loading, role, sessionChecked, needsTwoFactor, twoFactorVerified } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  
  useEffect(() => {
    console.log("ProtectedRoute state:", {
      isAuthenticated,
      role,
      loading,
      sessionChecked,
      needsTwoFactor,
      twoFactorVerified,
      canAccess: isAuthenticated && (!needsTwoFactor || twoFactorVerified)
    });
  }, [isAuthenticated, role, loading, sessionChecked, needsTwoFactor, twoFactorVerified]);

  if (loading || !sessionChecked) {
    return <Loading text={t("loading") || "جاري التحميل..."} />;
  }
  // ProtectedRoute.tsx

if (!isAuthenticated) {
  return <Navigate to="/login" state={{ from: location }} replace />;
}

// ✅ التحقق من localStorage أيضًا
const is2FAVerifiedLocally = localStorage.getItem('twoFactorVerified') === 'true';

if (needsTwoFactor && !twoFactorVerified && !is2FAVerifiedLocally) {
  return <Navigate to="/login" state={{ from: location }} replace />;
}
  // If 2FA is required but not verified, redirect to login page
  // If roles are specified, check if user has permission
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    console.log("Access denied: User role", role, "not in allowed roles:", allowedRoles);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
