import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, RefreshCw, Edit, Eye, DollarSign } from 'lucide-react';
import { Distributor } from '@/hooks/types/distributor';
import { AddDistributorDialog } from './AddDistributorDialog';
import { EditDistributorDialog } from './EditDistributorDialog';
import { ViewDistributorDialog } from './ViewDistributorDialog';
import { AddDistributorCreditDialog } from './AddDistributorCreditDialog';

export function DistributorsTable() {
  const { t } = useLanguage();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAddCreditDialog, setShowAddCreditDialog] = useState(false);

  useEffect(() => {
    fetchDistributors();
  }, []);

  async function fetchDistributors() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // استعلام عن معلومات المستخدمين المرتبطين بالموزعين
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, uid, distributor_id');
        
      if (usersError) throw usersError;
      
      // دمج بيانات المستخدمين مع بيانات الموزعين
      const distributorsWithUserInfo = data.map(distributor => {
        const user = usersData.find(u => u.uid === distributor.uid);
        return {
          ...distributor,
          userName: user?.name || '',
          userEmail: user?.email || '',
        };
      });
      
      setDistributors(distributorsWithUserInfo);
    } catch (error) {
      console.error('Error fetching distributors:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDistributors = distributors.filter(distributor => 
    distributor.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    distributor.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">{t('distributors')}</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchDistributors')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('addDistributor')}
          </Button>
          
          <Button variant="outline" onClick={fetchDistributors} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('refresh')}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('commissionRate')}</TableHead>
              <TableHead>{t('currentBalance')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {t('loading')}...
                </TableCell>
              </TableRow>
            ) : filteredDistributors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {t('noDistributorsFound')}
                </TableCell>
              </TableRow>
            ) : (
              filteredDistributors.map((distributor) => (
                <TableRow key={distributor.id}>
                  <TableCell>{distributor.userName}</TableCell>
                  <TableCell>{distributor.userEmail}</TableCell>
                  <TableCell>{distributor.commissionRate}%</TableCell>
                  <TableCell>{distributor.currentBalance}</TableCell>
                  <TableCell>{getStatusBadge(distributor.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedDistributor(distributor);
                          setShowViewDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedDistributor(distributor);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedDistributor(distributor);
                          setShowAddCreditDialog(true);
                        }}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showAddDialog && (
        <AddDistributorDialog 
          open={showAddDialog} 
          onClose={() => setShowAddDialog(false)}
          onDistributorAdded={fetchDistributors}
        />
      )}

      {selectedDistributor && showEditDialog && (
        <EditDistributorDialog 
          distributor={selectedDistributor}
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onDistributorUpdated={fetchDistributors}
        />
      )}

      {selectedDistributor && showViewDialog && (
        <ViewDistributorDialog 
          distributor={selectedDistributor}
          open={showViewDialog}
          onClose={() => setShowViewDialog(false)}
        />
      )}

      {selectedDistributor && showAddCreditDialog && (
        <AddDistributorCreditDialog 
          distributor={selectedDistributor}
          open={showAddCreditDialog}
          onClose={() => setShowAddCreditDialog(false)}
          onCreditAdded={fetchDistributors}
        />
      )}
    </div>
  );
}
