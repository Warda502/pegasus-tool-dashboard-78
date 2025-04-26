
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

  useEffect(() => {
    if (user) {
      console.log("UserDashboard: Current user ID:", user.id);
      console.log("UserDashboard: Available users:", users);
      refreshData();
    }
  }, [user, refreshData]);
  
  const stats = useMemo(() => {
    if (!user) {
      console.log("UserDashboard: No user data available");
      return null;
    }
    
    if (!users || users.length === 0) {
      console.log("UserDashboard: No users data loaded yet");
      return null;
    }
    
    // Since we're now fetching only the current user's data for regular users,
    // users array should have only one item or be empty
    const currentUser = users[0];
    
    if (!currentUser) {
      console.log("UserDashboard: User data not found in users array");
      return null;
    }
    
    console.log("UserDashboard: Found user data:", currentUser);
    
    const userCredit = currentUser.Credits || "0.0";
    const expiryTime = currentUser.Expiry_Time || "-";
    
    // Filter operations for the current user
    const userOperations = operations.filter(op => 
      op.UID === currentUser.id || op.UID === currentUser.uid || op.UID === currentUser.UID
    );
    
    console.log("UserDashboard: User operations:", userOperations.length);
    
    // Count refunded operations
    const refundedOperations = userOperations.filter(
      op => op.Status?.toLowerCase() === 'refunded'
    ).length;
    
    return {
      credits: userCredit,
      expiryTime,
      refundedOperations,
      totalOperations: userOperations.length
    };
  }, [operations, users, user]);

  if (!stats) {
    return (
      <ErrorAlert 
        title={t("userDataError") || "User Data Error"}
        description={t("userDataNotFound") || "Please try refreshing the page"} 
      />
    );
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
