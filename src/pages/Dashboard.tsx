
import { useEffect } from "react";
import { useSharedData } from "@/hooks/data/DataContext";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/hooks/useLanguage";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { toast } from "@/components/ui/sonner";

export default function Dashboard() {
  const { isLoading, refreshData, isError, users, operations } = useSharedData();
  const { isAdmin, user } = useAuth();
  const { t } = useLanguage();

  // Refresh data when dashboard mounts
  useEffect(() => {
    console.log("Dashboard mounted, refreshing data");
    refreshData();
    
    if (user) {
      console.log("Current user ID:", user.id);
      console.log("Is admin:", isAdmin);
      console.log("Users loaded:", users.length);
      console.log("Operations loaded:", operations.length);
      
      // Try to find current user data by checking both uid and id fields
      const currentUserData = users.find(u => 
        u.uid === user.id || u.id === user.id
      );
      
      if (currentUserData) {
        console.log("User data found:", currentUserData);
        toast.info("Debug Info", {
          description: `Found user data: Credits=${currentUserData.Credits}, ExpiryTime=${currentUserData.Expiry_Time}`,
          duration: 5000
        });
      } else {
        console.log("User data not found in users array. User IDs available:", users.map(u => `uid:${u.uid}, id:${u.id}`).join('; '));
        toast.warning("Debug Warning", {
          description: "User data not found in users array. Trying to refresh data...",
          duration: 5000
        });
        
        // Try refreshing again after a short delay
        setTimeout(() => refreshData(), 1000);
      }
    }
  }, [refreshData, user, isAdmin, users, operations]);

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
}
