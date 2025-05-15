
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "./StatCard";
import { User, Users, Activity, Wallet } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useDistributorOperations } from "@/hooks/useDistributorOperations";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";

interface DistributorStats {
  credits: string;
  userCount: number;
  operationCount: number;
}

export const DistributorDashboard = () => {
  const { isRTL, t } = useLanguage();
  const { getDistributorStats, isLoading } = useDistributorOperations();
  const { user } = useAuth();
  const [stats, setStats] = useState<DistributorStats>({
    credits: "0",
    userCount: 0,
    operationCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getDistributorStats();
      setStats(stats);
    };

    fetchStats();
  }, [getDistributorStats]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={t("availableCredits") || "Available Credits"}
          value={stats.credits}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatCard
          title={t("totalUsers") || "Total Users"}
          value={stats.userCount.toString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatCard
          title={t("totalOperations") || "Total Operations"}
          value={stats.operationCount.toString()}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("distributorProfile") || "Distributor Profile"}</CardTitle>
          <CardDescription>
            {t("personalInformation") || "Your personal information and account details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">{t("email") || "Email"}:</h3>
                {isLoading ? (
                  <Skeleton className="h-5 w-full mt-1" />
                ) : (
                  <p className="text-sm text-muted-foreground">{user?.email || "-"}</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium">{t("name") || "Name"}:</h3>
                {isLoading ? (
                  <Skeleton className="h-5 w-full mt-1" />
                ) : (
                  <p className="text-sm text-muted-foreground">{user?.name || "-"}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
