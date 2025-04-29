
import { useMemo } from "react";
import { useSharedData } from "@/hooks/data/DataContext";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { CreditCard, Clock, RefreshCcw, FileBarChart } from "lucide-react";
import { StatCard } from "./StatCard";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { ChartCard } from "./ChartCard";
import { MonthlyOperationsChart } from "./MonthlyOperationsChart";
import { OperationTypeChart } from "./OperationTypeChart";

export function UserDashboard() {
  const { operations, users } = useSharedData();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const stats = useMemo(() => {
    if (!user) {
      return null;
    }
    
    if (!users || users.length === 0) {
      return null;
    }
    
    const currentUser = users.find(u => 
      u.uid === user.id || u.id === user.id
    );
    
    if (!currentUser) {
      return null;
    }
    
    const userCredit = currentUser.Credits || "0.0";
    const expiryTime = currentUser.Expiry_Time || "-";
    
    // Filter operations for the current user
    const userOperations = operations.filter(op => 
      op.UID === currentUser.id || op.UID === currentUser.uid || op.UID === currentUser.UID
    );
    
    // Count refunded operations
    const refundedOperations = userOperations.filter(
      op => op.Status?.toLowerCase() === 'refunded'
    ).length;
    
    return {
      credits: userCredit,
      expiryTime,
      refundedOperations,
      totalOperations: userOperations.length,
      userOperations
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
    <div className="space-y-6">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title={t("monthlyOperationsChart") || "Monthly Operations"}
          icon={<FileBarChart className="h-4 w-4 text-muted-foreground" />}
          description={t("lastSixMonths") || "Operations over the last 6 months"}
        >
          <MonthlyOperationsChart operations={stats.userOperations} />
        </ChartCard>
        
        <ChartCard 
          title={t("operationsByType") || "Operations by Type"}
          icon={<RefreshCcw className="h-4 w-4 text-muted-foreground" />}
          description={t("operationTypeDistribution") || "Distribution of operations by type"}
        >
          <OperationTypeChart operations={stats.userOperations} />
        </ChartCard>
      </div>
    </div>
  );
}
