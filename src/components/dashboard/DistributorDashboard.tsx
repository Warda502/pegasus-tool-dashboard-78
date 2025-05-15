
import React, { useEffect, useState } from "react";
import { UserPlus, CreditCard, LineChart, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";

export function DistributorDashboard() {
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalOperations, setTotalOperations] = useState<number>(0);
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    const fetchDistributorStats = async () => {
      try {
        // Fetch users assigned to this distributor
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id')
          .eq('distributor_id', user.id);

        if (usersError) throw usersError;
        
        const assignedUserIds = usersData.map(user => user.id);
        setTotalUsers(assignedUserIds.length);

        // Fetch the total operations performed by users managed by this distributor
        if (assignedUserIds.length > 0) {
          const { data: operationsData, error: operationsError } = await supabase
            .from('operations')
            .select('id')
            .in('uid', assignedUserIds);

          if (operationsError) throw operationsError;
          setTotalOperations(operationsData?.length || 0);
        }

        // Calculate total credits allocated
        const { data: creditsData, error: creditsError } = await supabase
          .from('server_history')
          .select('amount')
          .eq('distributor_id', user.id)
          .eq('operation_type', 'credit_allocation');

        if (creditsError) throw creditsError;
        
        const total = creditsData?.reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0) || 0;
        setTotalCredits(total);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching distributor stats:', error);
        setLoading(false);
      }
    };

    fetchDistributorStats();
  }, [user]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard 
        title="Total Users" 
        value={loading ? "Loading..." : totalUsers.toString()} 
        icon={<Users className="h-4 w-4" />} 
      />
      
      <StatCard 
        title="Total Operations" 
        value={loading ? "Loading..." : totalOperations.toString()} 
        icon={<LineChart className="h-4 w-4" />} 
      />
      
      <StatCard 
        title="Credits Allocated" 
        value={loading ? "Loading..." : `${totalCredits.toFixed(2)}`} 
        icon={<CreditCard className="h-4 w-4" />} 
      />

      <Card className="col-span-full">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium">Welcome to Your Distributor Dashboard</h3>
          <p className="text-sm text-muted-foreground mt-2">
            As a distributor, you can manage your users, view their operations,
            and track credit allocation. Use the sidebar to navigate to different sections.
          </p>
          {user && (
            <div className="mt-4 p-4 bg-primary/5 rounded-md">
              <p className="text-sm"><strong>Distributor ID:</strong> {user.id}</p>
              <p className="text-sm"><strong>Email:</strong> {user.email}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
