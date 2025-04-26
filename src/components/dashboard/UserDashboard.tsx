
import { useMemo } from "react";
import { useSharedData } from "@/hooks/data/DataContext";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { CreditCard, Clock, RefreshCcw, FileBarChart } from "lucide-react";
import { StatCard } from "./StatCard";
import { ErrorAlert } from "@/components/common/ErrorAlert";

export function UserDashboard() {
  const { operations, users } = useSharedData();
  const { user } = useAuth();
  const { t } = useLanguage();

  const stats = useMemo(() => {
    if (!user) return null;
    
    // Find current user in users array to get most up-to-date credit
    const currentUser = users.find(u => u.id === user.id);
    const userCredit = currentUser?.Credits || "0.0";
    const expiryTime = currentUser?.Expiry_Time || "-";
    
    // Filter operations for the current user
    const userOperations = operations.filter(op => op.UID === user.id);
    const totalOperations = userOperations.length;
    
    // Count refunded operations
    const refundedOperations = userOperations.filter(
      op => op.Status?.toLowerCase() === 'refunded'
    ).length;
    
    return {
      credits: userCredit,
      expiryTime,
      refundedOperations,
      totalOperations
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
        title={t("myCredits")}
        value={stats.credits}
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        variant="primary"
      />
      <StatCard
        title={t("expiryTime")}
        value={stats.expiryTime}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        variant="warning"
      />
      <StatCard
        title={t("refundedOperations")}
        value={stats.refundedOperations}
        icon={<RefreshCcw className="h-4 w-4 text-muted-foreground" />}
        variant="success"
      />
      <StatCard
        title={t("totalOperations")}
        value={stats.totalOperations}
        icon={<FileBarChart className="h-4 w-4 text-muted-foreground" />}
        variant="default"
      />
    </div>
  );
}
