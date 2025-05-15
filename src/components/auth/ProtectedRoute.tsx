
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireDistributor?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireDistributor = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isDistributor, sessionChecked } = useAuth();
  
  // Wait until we've checked the session before rendering
  if (!sessionChecked) {
    return null;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If admin access required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If distributor access required but user is not distributor
  if (requireDistributor && !isDistributor) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
};
