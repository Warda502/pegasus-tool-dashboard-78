
import { useMemo } from "react";
import { useSharedData } from "@/hooks/data/DataContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Users, Calendar, CreditCard, FileBarChart, RefreshCcw } from "lucide-react";
import { StatCard } from "./StatCard";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { ChartCard } from "./ChartCard";
import { MonthlyOperationsChart } from "./MonthlyOperationsChart";
import { OperationTypeChart } from "./OperationTypeChart";

export function AdminDashboard() {
  const { operations, users } = useSharedData();
  const { t } = useLanguage();

  const stats = useMemo(() => {
    if (!users || users.length === 0) return null;
    
    const totalUsers = users.length;
    
    // Count users by license type
    const monthlyLicenseUsers = users.filter(
      user => user.User_Type?.toLowerCase().includes("monthly")
    ).length;
    
    const creditsLicenseUsers = users.filter(
      user => user.User_Type?.toLowerCase().includes("credit")
    ).length;
    
    const totalOperations = operations.length;
    
    // Count refunded operations
    const refundedOperations = operations.filter(
      op => op.Status?.toLowerCase() === 'refunded'
    ).length;
    
    return {
      totalUsers,
      monthlyLicenseUsers,
      creditsLicenseUsers,
      totalOperations,
      refundedOperations
    };
  }, [operations, users]);

  if (!stats) {
    return <ErrorAlert 
      title={t("adminDataError") || "Admin Data Error"}
      description={t("adminDataNotFound") || "Admin data could not be loaded"} 
    />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title={t("totalUsers") || "Total Users"}
          value={stats.totalUsers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          variant="primary"
        />
        <StatCard
          title={t("monthlyLicense") || "Monthly License"}
          value={stats.monthlyLicenseUsers}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          variant="success"
        />
        <StatCard
          title={t("creditsLicense") || "Credits License"}
          value={stats.creditsLicenseUsers}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          variant="warning"
        />
        <StatCard
          title={t("totalOperations") || "Total Operations"}
          value={stats.totalOperations}
          icon={<FileBarChart className="h-4 w-4 text-muted-foreground" />}
          variant="default"
        />
        <StatCard
          title={t("refundedOperations") || "Refunded Operations"}
          value={stats.refundedOperations}
          icon={<RefreshCcw className="h-4 w-4 text-muted-foreground" />}
          variant="success"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title={t("platformMonthlyActivity") || "Platform Monthly Activity"}
          icon={<FileBarChart className="h-4 w-4 text-muted-foreground" />}
          description={t("lastSixMonths") || "Operations over the last 6 months"}
        >
          <MonthlyOperationsChart operations={operations} />
        </ChartCard>
        
        <ChartCard 
          title={t("platformOperationTypes") || "Platform Operation Types"}
          icon={<RefreshCcw className="h-4 w-4 text-muted-foreground" />}
          description={t("operationTypeBreakdown") || "Breakdown of all operations by type"}
        >
          <OperationTypeChart operations={operations} />
        </ChartCard>
      </div>
    </div>
  );
}
