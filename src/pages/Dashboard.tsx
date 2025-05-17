
import { useEffect, useState } from "react";
import { useSharedData } from "@/hooks/data/DataContext";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DistributorDashboard } from "@/components/dashboard/DistributorDashboard";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/hooks/useLanguage";
import { ErrorAlert } from "@/components/common/ErrorAlert";

export default function Dashboard() {
  const { isLoading, refreshData, isError, users, operations } = useSharedData();
  const { isAdmin, isDistributor, user } = useAuth();
  const { t } = useLanguage();
  
  // Add a separate loading state for admin data
  const [adminDataLoading, setAdminDataLoading] = useState(false);
  
  // Refresh data when dashboard mounts - with improved error handling
  useEffect(() => {
    console.log("Dashboard mounted, refreshing data");
    
    // For admins, indicate specific loading state to prevent UI jumps
    if (isAdmin) {
      setAdminDataLoading(true);
      
      // Use timeout to allow the auth state to fully stabilize before loading data
      const timer = setTimeout(() => {
        try {
          refreshData().finally(() => {
            // Set loading to false after data is refreshed regardless of success/failure
            setAdminDataLoading(false);
          });
        } catch (error) {
          console.error("Error refreshing admin data:", error);
          setAdminDataLoading(false);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // For regular users, just refresh data without special handling
      refreshData();
    }
  }, [refreshData, isAdmin]);

  // Combined loading state - either global loading or admin-specific loading
  const isContentLoading = isLoading || adminDataLoading;

  if (isContentLoading) {
    return <Loading text={t("loadingDashboard") || "Loading dashboard..."} />;
  }

  if (isError) {
    return (
      <ErrorAlert 
        title={t("dataLoadError") || "Error Loading Data"}
        description={t("dashboardDataError") || "Failed to load dashboard data. Please try refreshing the page."}
      />
    );
  }

  // Additional debug logging to help trace the issue
  console.log("Dashboard rendering with role:", { isAdmin, isDistributor });
  console.log("User data available:", !!user);
  console.log("User count:", users?.length || 0);
  console.log("Operations count:", operations?.length || 0);

  // Render the appropriate dashboard based on user role
  if (isAdmin) {
    return <AdminDashboard />;
  } else if (isDistributor) {
    return <DistributorDashboard />;
  } else {
    return <UserDashboard />;
  }
}
