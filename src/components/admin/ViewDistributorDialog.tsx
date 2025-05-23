import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Distributor, DistributorCredit, DistributorUser } from '@/hooks/types/distributor';
import { format } from 'date-fns';

interface ViewDistributorDialogProps {
  distributor: Distributor;
  open: boolean;
  onClose: () => void;
}

export function ViewDistributorDialog({ distributor, open, onClose }: ViewDistributorDialogProps) {
  const { t } = useLanguage();
  const [users, setUsers] = useState<DistributorUser[]>([]);
  const [credits, setCredits] = useState<DistributorCredit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (distributor?.id) {
      fetchDistributorData();
    }
  }, [distributor?.id]);

  async function fetchDistributorData() {
    setLoading(true);
    try {
      // استعلام عن مستخدمي الموزع
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('distributor_id', distributor.id);

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // استعلام عن معاملات الرصيد للموزع
      const { data: creditsData, error: creditsError } = await supabase
        .from('distributor_credits')
        .select('*')
        .eq('distributor_id', distributor.id)
        .order('created_at', { ascending: false });

      if (creditsError) throw creditsError;
      setCredits(creditsData || []);
    } catch (error) {
      console.error('Error fetching distributor data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">{t('active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{t('inactive')}</Badge>;
      case 'suspended':
        return <Badge variant="destructive">{t('suspended')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOperationTypeText = (type: string) => {
    switch (type) {
      case 'add':
        return t('creditAdded');
      case 'subtract':
        return t('creditSubtracted');
      case 'commission':
        return t('commission');
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{t('distributorDetails')}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('name')}</h4>
              <p className="text-base">{distributor.userName}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('email')}</h4>
              <p className="text-base">{distributor.userEmail}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('commissionRate')}</h4>
              <p className="text-base">{distributor.commissionRate}%</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('currentBalance')}</h4>
              <p className="text-base">{distributor.currentBalance}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('creditLimit')}</h4>
              <p className="text-base">{distributor.creditLimit}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</h4>
              <p className="text-base">{getStatusBadge(distributor.status)}</p>
            </div>
            
            {distributor.website && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('website')}</h4>
                <p className="text-base">{distributor.website}</p>
              </div>
            )}
            
            {distributor.facebook && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('facebook')}</h4>
                <p className="text-base">{distributor.facebook}</p>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users">{t('users')}</TabsTrigger>
              <TabsTrigger value="credits">{t('creditsHistory')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('name')}</TableHead>
                      <TableHead>{t('email')}</TableHead>
                      <TableHead>{t('credits')}</TableHead>
                      <TableHead>{t('expiryDate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          {t('loading')}...
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          {t('noUsersFound')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.credits}</TableCell>
                          <TableCell>
                            {user.expiryTime ? format(new Date(user.expiryTime), 'yyyy-MM-dd') : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="credits">
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
                          <TableCell>{getOperationTypeText(credit.operationType)}</TableCell>
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
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
