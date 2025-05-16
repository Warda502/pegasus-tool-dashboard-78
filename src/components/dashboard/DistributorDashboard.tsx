
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useSharedData } from "@/hooks/data/DataContext";
import { ChartCard } from "./ChartCard";
import { MonthlyOperationsChart } from "./MonthlyOperationsChart";
import { OperationTypeChart } from "./OperationTypeChart";
import { StatCard } from "./StatCard";
import { Users, Wallet, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ServerHistoryCount {
  totalOperations: number;
  totalUsers: number;
  totalAmount: number;
}

export function DistributorDashboard() {
  const { user } = useAuth();
  const { operations } = useSharedData();
  const [serverHistoryStats, setServerHistoryStats] = useState<ServerHistoryCount>({
    totalOperations: 0,
    totalUsers: 0,
    totalAmount: 0
  });

  // Fetch distributor statistics
  useEffect(() => {
    const fetchDistributorStats = async () => {
      try {
        if (!user?.id) return;
        
        const { data, error } = await supabase
          .from('server_history')
          .select('*')
          .eq('distributor_id', user.id);
          
        if (error) {
          console.error('Error fetching distributor stats:', error);
          return;
        }
        
        if (!data) return;
        
        // Calculate statistics
        const totalOperations = data.length;
        const totalUsers = new Set(data.map(item => item.target_user_id).filter(Boolean)).size;
        const totalAmount = data.reduce((sum, item) => sum + (item.amount || 0), 0);
        
        setServerHistoryStats({
          totalOperations,
          totalUsers,
          totalAmount
        });
        
      } catch (error) {
        console.error('Error in fetchDistributorStats:', error);
      }
    };
    
    fetchDistributorStats();
  }, [user]);
  
  // Filter operations specific to this distributor's users
  const userOperations = operations.filter(op => {
    // Add any filtering logic needed for distributor's operations
    return true; // Placeholder - implement actual filtering based on requirements
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Users" 
          value={serverHistoryStats.totalUsers.toString()}
          description="Users managed by you"
          icon={<Users className="h-6 w-6" />}
          className="bg-blue-50 dark:bg-blue-950"
        />
        <StatCard 
          title="Balance" 
          value={user?.credits || "0.0"}
          description="Your current credit balance"
          icon={<Wallet className="h-6 w-6" />}
          className="bg-green-50 dark:bg-green-950"
        />
        <StatCard 
          title="Operations" 
          value={serverHistoryStats.totalOperations.toString()}
          description="Total operations processed"
          icon={<FileText className="h-6 w-6" />}
          className="bg-purple-50 dark:bg-purple-950"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Monthly Operations">
          <MonthlyOperationsChart operations={userOperations} />
        </ChartCard>
        <ChartCard title="Operation Types">
          <OperationTypeChart operations={userOperations} />
        </ChartCard>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Name:</span>
                <span>{user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Email:</span>
                <span>{user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Role:</span>
                <span>Distributor</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Amount Processed:</span>
                <span>{serverHistoryStats.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
