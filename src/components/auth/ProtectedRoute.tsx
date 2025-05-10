
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
  const { isAuthenticated, loading, role, sessionChecked, needsTwoFactor } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  
  useEffect(() => {
    console.log("ProtectedRoute state:", {
      isAuthenticated,
      role,
      loading,
      sessionChecked,
      needsTwoFactor
    });
  }, [isAuthenticated, role, loading, sessionChecked, needsTwoFactor]);

  if (loading || !sessionChecked) {
    return <Loading text={t("loading") || "جاري التحميل..."} />;
  }
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If 2FA is required but not completed, redirect to login page
  if (needsTwoFactor) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If roles are specified, check if user has permission
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    console.log("Access denied: User role", role, "not in allowed roles:", allowedRoles);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
