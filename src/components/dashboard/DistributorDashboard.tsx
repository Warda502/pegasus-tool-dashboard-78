import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from './StatCard';
import { ChartCard } from './ChartCard';
import { Users, CreditCard, TrendingUp, DollarSign } from 'lucide-react';

export function DistributorDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCredits: 0,
    totalCommission: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDistributorStats() {
      if (!user?.distributorId) return;

      setLoading(true);
      try {
        // استعلام عن إجمالي المستخدمين
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, activate')
          .eq('distributor_id', user.distributorId);

        if (usersError) throw usersError;

        // استعلام عن إجمالي العمولات
        const { data: creditsData, error: creditsError } = await supabase
          .from('distributor_credits')
          .select('amount, operation_type')
          .eq('distributor_id', user.distributorId);

        if (creditsError) throw creditsError;

        // حساب الإحصائيات
        const totalUsers = usersData?.length || 0;
        const activeUsers = usersData?.filter(u => u.activate === 'yes').length || 0;
        
        const totalCommission = creditsData
          ?.filter(c => c.operation_type === 'commission')
          .reduce((sum, item) => sum + Number(item.amount), 0) || 0;
        
        const totalCredits = creditsData
          ?.reduce((sum, item) => {
            if (item.operation_type === 'add') return sum + Number(item.amount);
            if (item.operation_type === 'subtract') return sum - Number(item.amount);
            return sum;
          }, 0) || 0;

        setStats({
          totalUsers,
          activeUsers,
          totalCredits,
          totalCommission,
        });
      } catch (error) {
        console.error('Error fetching distributor stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDistributorStats();
  }, [user?.distributorId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('distributorDashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('totalUsers')}
          value={stats.totalUsers.toString()}
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title={t('activeUsers')}
          value={stats.activeUsers.toString()}
          icon={<Users className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title={t('currentBalance')}
          value={user?.currentBalance || '0'}
          icon={<CreditCard className="h-5 w-5" />}
          loading={loading}
        />
        <StatCard
          title={t('totalCommission')}
          value={stats.totalCommission.toString()}
          icon={<DollarSign className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('userGrowth')} loading={loading}>
          {/* رسم بياني لنمو المستخدمين */}
        </ChartCard>
        <ChartCard title={t('commissionHistory')} loading={loading}>
          {/* رسم بياني لتاريخ العمولات */}
        </ChartCard>
      </div>
    </div>
  );
}
