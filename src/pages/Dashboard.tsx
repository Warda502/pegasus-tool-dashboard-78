import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, PieChart, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, CreditCard, CalendarDays, BarChart as BarChartIcon } from "lucide-react";
import { useSharedData, useLanguage } from "@/hooks/useSharedData";

export default function Dashboard() {
  const { users, operations, isLoading } = useSharedData();
  const { t, isRTL } = useLanguage();
  const [stats, setStats] = useState({
    totalUsers: 0,
    monthlyUsers: 0,
    creditUsers: 0,
    totalOperations: 0
  });

  useEffect(() => {
    if (!users || !operations) return;
    const monthlyLicenseUsers = users.filter(user => user.User_Type === 'Monthly License').length;
    const creditsLicenseUsers = users.filter(user => user.User_Type === 'Credits License').length;

    setStats({
      totalUsers: users.length,
      monthlyUsers: monthlyLicenseUsers,
      creditUsers: creditsLicenseUsers,
      totalOperations: operations.length
    });
  }, [users, operations]);

  const getMonthlyOperationsData = () => {
    const monthCounts = new Array(12).fill(0);
    operations.forEach(op => {
      if (op.Time) {
        const dateParts = op.Time.split(' ')[0].split('-');
        if (dateParts.length >= 2) {
          const month = parseInt(dateParts[1]) - 1;
          if (month >= 0 && month < 12) {
            monthCounts[month]++;
          }
        }
      }
    });
    const monthNames = [
      t("jan"), t("feb"), t("mar"), t("apr"), t("may"), t("jun"),
      t("jul"), t("aug"), t("sep"), t("oct"), t("nov"), t("dec")
    ];
    return monthNames.map((name, index) => ({
      name,
      operations: monthCounts[index]
    }));
  };

  const getOperationTypesData = () => {
    const typeCounts: Record<string, number> = {};
    operations.forEach(op => {
      const type = op.OprationTypes || t('unknown');
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
  const monthlyData = getMonthlyOperationsData();
  const operationTypesData = getOperationTypesData();
  const licenseComparisonData = [
    { name: t('monthlyLicense'), value: stats.monthlyUsers },
    { name: t('creditsLicense'), value: stats.creditUsers }
  ];

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="min-h-screen py-12 px-4 sm:px-8 bg-gradient-to-tr from-gray-100 to-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2 animate-fade-in">
              {t("dashboardTitle")}
            </h1>
            <p className="text-gray-600 md:text-lg animate-fade-in">{t("dashboardDescription")}</p>
          </div>
        </header>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-80">
            <div className="loader mb-4"></div>
            <span className="text-lg text-gray-600">{t("loadingData")}</span>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="shadow-lg border-2 border-blue-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">{t("totalUsers")}</CardTitle>
                </div>
                <Users className="h-7 w-7 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-800">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-2 border-green-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">{t("monthlyLicense")}</CardTitle>
                </div>
                <CalendarDays className="h-7 w-7 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-800">{stats.monthlyUsers}</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-2 border-yellow-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">{t("creditsLicense")}</CardTitle>
                </div>
                <CreditCard className="h-7 w-7 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-800">{stats.creditUsers}</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-2 border-pink-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">{t("totalOperations")}</CardTitle>
                </div>
                <BarChartIcon className="h-7 w-7 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-gray-800">{stats.totalOperations}</div>
              </CardContent>
            </Card>
          </div>
        </>
        )}
      </div>
    </section>
  );
}
