
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Users, CreditCard, Clock, LineChart as LineChartIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";

export const DistributorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [distributorData, setDistributorData] = useState<any>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const [operationsData, setOperationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDistributorData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch distributor data
        const { data: distributorData, error: distributorError } = await supabase
          .from('distributors')
          .select('*')
          .eq('uid', user.id)
          .single();
          
        if (distributorError) {
          console.error("Error fetching distributor data:", distributorError);
          return;
        }
        
        setDistributorData(distributorData);
        
        // Fetch user count
        const { count, error: userCountError } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('distributor_id', distributorData.id);
          
        if (userCountError) {
          console.error("Error fetching user count:", userCountError);
        } else {
          setUserCount(count || 0);
        }
        
        // Fetch operations data for charts
        const { data: operationsData, error: operationsError } = await supabase
          .from('operations')
          .select('time, credit, operation_type')
          .eq('uid', user.id)
          .order('time', { ascending: false })
          .limit(50);
          
        if (operationsError) {
          console.error("Error fetching operations data:", operationsError);
        } else {
          // Process operations data for charts
          const processedData = processOperationsData(operationsData || []);
          setOperationsData(processedData);
        }
      } catch (error) {
        console.error("Error in distributor dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDistributorData();
  }, [user]);
  
  // Helper function to process operations data for charts
  const processOperationsData = (operations: any[]) => {
    // Group operations by date
    const groupedByDate = operations.reduce((acc, op) => {
      // Extract date from time string
      const date = op.time ? op.time.split(' ')[0] : 'Unknown';
      
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          credit: 0
        };
      }
      
      acc[date].count += 1;
      acc[date].credit += parseFloat(op.credit || '0');
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(groupedByDate)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("distributorDashboard") || "Distributor Dashboard"}</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title={t("balance") || "Balance"}
              value={distributorData?.current_balance || "0"}
              description={t("currentBalance") || "Your current balance"}
              icon={<CreditCard className="h-8 w-8 text-primary" />}
            />
            
            <StatCard 
              title={t("creditLimit") || "Credit Limit"}
              value={distributorData?.credit_limit || "0"}
              description={t("maxCredit") || "Maximum available credit"}
              icon={<CreditCard className="h-8 w-8 text-primary" />}
            />
            
            <StatCard 
              title={t("users") || "Users"}
              value={userCount.toString()}
              description={t("managedUsers") || "Users under your management"}
              icon={<Users className="h-8 w-8 text-primary" />}
            />
            
            <StatCard 
              title={t("commission") || "Commission Rate"}
              value={`${distributorData?.commission_rate || "0"}%`}
              description={t("yourCommissionRate") || "Your commission rate"}
              icon={<LineChartIcon className="h-8 w-8 text-primary" />}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title={t("operationsOverTime") || "Operations Over Time"} 
              icon={<Clock className="h-4 w-4" />}
            >
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={operationsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      name={t("operationsCount") || "Operations Count"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            
            <ChartCard 
              title={t("creditsUsage") || "Credits Usage"} 
              icon={<CreditCard className="h-4 w-4" />}
            >
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={operationsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="credit" 
                      fill="#82ca9d" 
                      name={t("creditsUsed") || "Credits Used"}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

export default DistributorDashboard;
