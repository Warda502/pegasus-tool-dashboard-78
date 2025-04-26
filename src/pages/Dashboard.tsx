
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, CalendarDays, BarChart as BarChartIcon, RefreshCw } from "lucide-react";
import { useSharedData } from "@/hooks/useSharedData";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/ui/loading";

export default function Dashboard() {
  const { users, operations, isLoading } = useSharedData();
  const { t, isRTL } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    monthlyUsers: 0,
    creditUsers: 0,
    totalOperations: 0,
    userOperations: 0,
    userRefundOperations: 0
  });

  useEffect(() => {
    if (!users || !operations) return;
    
    const monthlyLicenseUsers = users.filter(u => u.user_type === 'Monthly License').length;
    const creditsLicenseUsers = users.filter(u => u.user_type === 'Credits License').length;
    
    // Calculate user-specific stats if not admin
    const userOperations = operations.filter(op => op.uid === user?.id);
    const userRefundOperations = userOperations.filter(op => op.status === 'Refounded' || op.status === 'Refunded').length;

    setStats({
      totalUsers: users.length,
      monthlyUsers: monthlyLicenseUsers,
      creditUsers: creditsLicenseUsers,
      totalOperations: operations.length,
      userOperations: userOperations.length,
      userRefundOperations
    });
  }, [users, operations, user?.id]);

  // Find current user's data for credits and expiry time
  const currentUserData = users?.find(u => u.id === user?.id);
  
  // Process the user's credits - remove quotes and parse as number
  const userCredits = currentUserData?.credits ? 
    parseFloat(currentUserData.credits.toString().replace(/"/g, '')) : 0;
  
  // Format expiry time for display
  const expiryTime = currentUserData?.expiry_time || "-";

  const AdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="shadow-lg border-2 border-blue-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{t("totalUsers")}</CardTitle>
          <Users className="h-7 w-7 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-gray-800">{stats.totalUsers}</div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-2 border-green-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{t("monthlyLicense")}</CardTitle>
          <CalendarDays className="h-7 w-7 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-gray-800">{stats.monthlyUsers}</div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-2 border-yellow-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{t("creditsLicense")}</CardTitle>
          <CreditCard className="h-7 w-7 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-gray-800">{stats.creditUsers}</div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-2 border-pink-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{t("totalOperations")}</CardTitle>
          <BarChartIcon className="h-7 w-7 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-gray-800">{stats.totalOperations}</div>
        </CardContent>
      </Card>
    </div>
  );

  const UserDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="shadow-lg border-2 border-blue-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{t("myCredits")}</CardTitle>
          <CreditCard className="h-7 w-7 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-gray-800">{userCredits}</div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-2 border-green-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{t("expiryTime")}</CardTitle>
          <CalendarDays className="h-7 w-7 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-gray-800">{expiryTime}</div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-2 border-yellow-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{t("refundOperations")}</CardTitle>
          <RefreshCw className="h-7 w-7 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-gray-800">{stats.userRefundOperations}</div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg border-2 border-pink-100 bg-white transition hover:scale-[1.03] hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{t("totalOperations")}</CardTitle>
          <BarChartIcon className="h-7 w-7 text-pink-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-gray-800">{stats.userOperations}</div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="min-h-screen py-12 px-4 sm:px-8 bg-gradient-to-tr from-gray-100 to-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2 animate-fade-in">
            {t("dashboardTitle")}
          </h1>
          <p className="text-gray-600 md:text-lg animate-fade-in">{t("dashboardDescription")}</p>
        </header>
        
        {isLoading ? (
          <Loading text={t("loadingData")} size="lg" className="h-80" />
        ) : (
          isAdmin ? <AdminDashboard /> : <UserDashboard />
        )}
      </div>
    </section>
  );
}
