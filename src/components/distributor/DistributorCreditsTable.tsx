import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DistributorCredit } from '@/hooks/types/distributor';
import { format } from 'date-fns';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function DistributorCreditsTable() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [credits, setCredits] = useState<DistributorCredit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, [user?.distributorId]);

  async function fetchCredits() {
    if (!user?.distributorId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('distributor_credits')
        .select('*')
        .eq('distributor_id', user.distributorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredits(data || []);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  }

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'subtract':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'commission':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('creditsAndCommissions')}</h2>
        
        <Button variant="outline" onClick={fetchCredits}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('refresh')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('currentBalance')}: {user?.currentBalance || '0'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead>{t('amount')}</TableHead>
                  <TableHead>{t('description')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      {t('loading')}...
                    </TableCell>
                  </TableRow>
                ) : credits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      {t('noTransactionsFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  credits.map((credit) => (
                    <TableRow key={credit.id}>
                      <TableCell>
                        {credit.createdAt ? format(new Date(credit.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getOperationIcon(credit.operationType)}
                          <span>
                            {credit.operationType === 'add' && t('creditAdded')}
                            {credit.operationType === 'subtract' && t('creditSubtracted')}
                            {credit.operationType === 'commission' && t('commission')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={
                        credit.operationType === 'add' || credit.operationType === 'commission' 
                          ? 'text-green-600 dark:text-green-400 font-medium' 
                          : 'text-red-600 dark:text-red-400 font-medium'
                      }>
                        {credit.operationType === 'add' || credit.operationType === 'commission' ? '+' : '-'}
                        {credit.amount}
                      </TableCell>
                      <TableCell>{credit.description || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
