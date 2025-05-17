
import { useEffect } from "react";
import { useSharedData } from "@/hooks/data/DataContext";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/hooks/useLanguage";
import { ErrorAlert } from "@/components/common/ErrorAlert";

export default function Dashboard() {
  const { isLoading, refreshData, isError, users, operations } = useSharedData();
  const { isAdmin, user } = useAuth();
  const { t } = useLanguage();

  // Refresh data when dashboard mounts
  useEffect(() => {
    console.log("Dashboard mounted, refreshing data");
    refreshData();
  }, [refreshData]);

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
