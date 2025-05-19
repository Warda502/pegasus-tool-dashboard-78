
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity, Calendar } from "lucide-react";
import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { useLanguage } from "@/hooks/useLanguage";
import { useSharedData } from "@/hooks/data/DataContext";
import { useAuth } from "@/hooks/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function DistributorDashboard() {
  const { t, isRTL } = useLanguage();
  const { operations } = useSharedData();
  const { user } = useAuth();
  const [distributorStats, setDistributorStats] = useState({
    userCount: 0,
    creditBalance: "0.0",
    operationCount: 0,
    expiryDate: ""
  });

  useEffect(() => {
    const fetchDistributorData = async () => {
      if (!user?.id) return;

      try {
        // Get distributor ID
        const { data: distributorId } = await supabase.rpc('get_user_distributor_id');
        
        if (!distributorId) {
          console.error("Could not get distributor ID");
          return;
        }
        
        // Get distributor details
        const { data: distributorData, error: distributorError } = await supabase
          .from('distributors')
          .select('*')
          .eq('id', distributorId)
          .single();
          
        if (distributorError) {
          console.error("Error fetching distributor data:", distributorError);
          return;
        }
        
        // Count users under this distributor
        const { count: userCount, error: userCountError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('distributor_id', distributorId);
          
        if (userCountError) {
          console.error("Error counting users:", userCountError);
          return;
        }
        
        // Count operations for users under this distributor
        const { data: usersData } = await supabase
          .from('users')
          .select('uid')
          .eq('distributor_id', distributorId);
          
        const userIds = usersData?.map(user => user.uid) || [];
          
        let operationCount = 0;
        if (userIds.length > 0) {
          const { count, error: opCountError } = await supabase
            .from('operations')
            .select('*', { count: 'exact', head: true })
            .in('uid', userIds);
            
          if (opCountError) {
            console.error("Error counting operations:", opCountError);
          } else {
            operationCount = count || 0;
          }
        }
        
        setDistributorStats({
          userCount: userCount || 0,
          creditBalance: distributorData?.current_balance?.toString() || "0.0",
          operationCount: operationCount,
          expiryDate: ""  // Distributors typically don't have expiry dates
        });
        
      } catch (error) {
        console.error("Error fetching distributor dashboard data:", error);
      }
    };

    fetchDistributorData();
  }, [user?.id, operations]);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">
        {t("distributorDashboard") || "لوحة تحكم الموزع"}
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("users") || "المستخدمون"}
          value={distributorStats.userCount.toString()}
          description={t("totalUsers") || "إجمالي المستخدمين"}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title={t("credits") || "الرصيد"}
          value={distributorStats.creditBalance}
          description={t("availableCredits") || "الرصيد المتاح"}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title={t("operations") || "العمليات"}
          value={distributorStats.operationCount.toString()}
          description={t("totalOperations") || "إجمالي العمليات"}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title={t("commission") || "العمولة"}
          value="--"
          description={t("estimatedCommission") || "العمولة التقديرية"}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t("userOperations") || "عمليات المستخدمين"}</CardTitle>
            <CardDescription>
              {t("last30Days") || "آخر 30 يوم"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <ChartCard 
              title={t("userOperations") || "عمليات المستخدمين"}
            >
              <div className="flex items-center justify-center h-full text-gray-500">
                {t("noChartData") || "لا توجد بيانات للعرض حاليًا"}
              </div>
            </ChartCard>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity") || "النشاط الأخير"}</CardTitle>
            <CardDescription>
              {t("recentActivityDescription") || "آخر العمليات التي تمت"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {operations.slice(0, 5).map((operation, index) => (
                <div key={index} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {operation.Username || operation.UserName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {operation.OprationTypes} - {operation.Model}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {operation.Credit} {t("credits") || "رصيد"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
