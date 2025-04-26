
import { useEffect } from "react";
import { useSharedData } from "@/hooks/data/DataContext";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/hooks/useLanguage";

export default function Dashboard() {
  const { isLoading, refreshData } = useSharedData();
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  // Refresh data when dashboard mounts
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  if (isLoading) {
    return <Loading text={t("loadingDashboard")} />;
  }

  return (
    <div className="space-y-6">
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
}
