
import { Card } from "@/components/ui/card";
import { StatCard } from "./StatCard";
import { Users, Wallet, BarChart } from "lucide-react";
import { useSharedData } from "@/hooks/data/DataContext";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useMemo } from "react";

export function DistributorDashboard() {
  const { operations, users } = useSharedData();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  
  // Calculate statistics for distributor
  const stats = useMemo(() => {
    if (!user?.id) return { totalUsers: 0, totalOperations: 0, totalCredits: 0 };
    
    // Filter users managed by this distributor
    const distributorUsers = users.filter(u => u.distributor_id === user.id);
    
    // Count total operations for this distributor's users
    const distributorOperations = operations.filter(op => 
      distributorUsers.some(u => u.uid === op.UID || u.id === op.uid)
    );
    
    // Calculate total credits for distributor
    const credits = user.credits ? parseFloat(user.credits.toString()) : 0;
    
    return {
      totalUsers: distributorUsers.length,
      totalOperations: distributorOperations.length,
      totalCredits: credits
    };
  }, [operations, users, user]);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-3xl font-bold tracking-tight">
        {t("welcomeDistributor", { name: user?.name || t("distributor") })}
      </h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title={t("totalUsers")}
          value={stats.totalUsers.toString()}
          description={t("managedUsers")}
          icon={<Users className="h-4 w-4" />}
        />
        
        <StatCard 
          title={t("totalOperations")}
          value={stats.totalOperations.toString()}
          description={t("operationsDesc")}
          icon={<BarChart className="h-4 w-4" />}
        />
        
        <StatCard 
          title={t("availableCredits")}
          value={stats.totalCredits.toString()}
          description={t("creditsDesc")}
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">{t("distributorInfo")}</h3>
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("name")}:</span>
            <span className="font-medium">{user?.name || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("email")}:</span>
            <span className="font-medium">{user?.email || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("accountType")}:</span>
            <span className="font-medium">{t("distributor")}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
