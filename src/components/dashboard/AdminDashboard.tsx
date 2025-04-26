
import { useMemo } from "react";
import { useSharedData } from "@/hooks/data/DataContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Users, Calendar, CreditCard, FileBarChart } from "lucide-react";
import { StatCard } from "./StatCard";

export function AdminDashboard() {
  const { operations, users } = useSharedData();
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const totalUsers = users.length;
    
    // Count users by license type
    const monthlyLicenseUsers = users.filter(
      user => user.User_Type?.toLowerCase().includes("monthly")
    ).length;
    
    const creditsLicenseUsers = users.filter(
      user => user.User_Type?.toLowerCase().includes("credit")
    ).length;
    
    const totalOperations = operations.length;
    
    return {
      totalUsers,
      monthlyLicenseUsers,
      creditsLicenseUsers,
      totalOperations
    };
  }, [operations, users]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title={t("totalUsers")}
        value={stats.totalUsers}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        variant="primary"
      />
      <StatCard
        title={t("monthlyLicense")}
        value={stats.monthlyLicenseUsers}
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        variant="success"
      />
      <StatCard
        title={t("creditsLicense")}
        value={stats.creditsLicenseUsers}
        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        variant="warning"
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
