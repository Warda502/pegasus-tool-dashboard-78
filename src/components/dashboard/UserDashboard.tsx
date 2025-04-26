
import { useMemo, useEffect } from "react";
import { useSharedData } from "@/hooks/data/DataContext";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { CreditCard, Clock, RefreshCcw, FileBarChart } from "lucide-react";
import { StatCard } from "./StatCard";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { toast } from "@/components/ui/sonner";

export function UserDashboard() {
  const { operations, users, refreshData } = useSharedData();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Refresh data when component mounts to ensure we have latest data
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  const stats = useMemo(() => {
    if (!user) return null;
    
    console.log("Calculating user stats for:", user.id);
    console.log("Available users:", users.length);
    console.log("Available operations:", operations.length);
    
    // Find current user in users array by checking both uid and id fields
    const currentUser = users.find(u => u.uid === user.id || u.id === user.id);
    
    if (currentUser) {
      console.log("Found user data:", currentUser);
    } else {
      console.log("User data not found in users array");
      console.log("User IDs in database:", users.map(u => `uid:${u.uid}, id:${u.id}`).join(', '));
      toast.warning("User Data Warning", {
        description: "Failed to find your user data. Please try refreshing or logging in again.",
      });
    }
    
    const userCredit = currentUser?.Credits || "0.0";
    const expiryTime = currentUser?.Expiry_Time || "-";
    
    // Filter operations for the current user
    const userOperations = operations.filter(op => op.UID === user.id);
    console.log("User operations count:", userOperations.length);
    
    // Count refunded operations
    const refundedOperations = userOperations.filter(
      op => op.Status?.toLowerCase() === 'refunded'
    ).length;
    
    console.log("Refunded operations count:", refundedOperations);
    console.log("Refunded operations details:", userOperations.filter(op => op.Status?.toLowerCase() === 'refunded'));
    
    return {
      credits: userCredit,
      expiryTime,
      refundedOperations,
      totalOperations: userOperations.length
    };
  }, [operations, users, user]);

  if (!stats) {
    return <ErrorAlert 
      title={t("userDataError") || "User Data Error"}
      description={t("userDataNotFound") || "User information could not be loaded"} 
    />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={t("myCredits") || "My Credits"}
        value={stats.credits}
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        variant="primary"
      />
      <StatCard
        title={t("expiryTime") || "Expiry Time"}
        value={stats.expiryTime}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        variant="warning"
      />
      <StatCard
        title={t("refundedOperations") || "Refunded Operations"}
        value={stats.refundedOperations}
        icon={<RefreshCcw className="h-4 w-4 text-muted-foreground" />}
        variant="success"
      />
      <StatCard
        title={t("totalOperations") || "Total Operations"}
        value={stats.totalOperations}
        icon={<FileBarChart className="h-4 w-4 text-muted-foreground" />}
        variant="default"
      />
    </div>
  );
}
