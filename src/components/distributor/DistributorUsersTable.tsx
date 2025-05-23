import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, RefreshCw } from 'lucide-react';
import { DistributorUser } from '@/hooks/types/distributor';
import { AddUserDialog } from './AddUserDialog';
import { ViewUserDialog } from './ViewUserDialog';

export function DistributorUsersTable() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<DistributorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DistributorUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [user?.distributorId]);

  async function fetchUsers() {
    if (!user?.distributorId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('distributor_id', user.distributorId);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">{t('myUsers')}</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchUsers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Button onClick={() => setShowAddUserDialog(true)} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('addUser')}
          </Button>
          
          <Button variant="outline" onClick={fetchUsers} className="w-full sm:w-auto">
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
              <TableHead>{t('credits')}</TableHead>
              <TableHead>{t('expiryDate')}</TableHead>
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
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {t('noUsersFound')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.credits}</TableCell>
                  <TableCell>{user.expiryTime}</TableCell>
                  <TableCell>
                    {/* حالة المستخدم */}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedUser(user)}
                    >
                      {t('view')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showAddUserDialog && (
        <AddUserDialog 
          open={showAddUserDialog} 
          onClose={() => setShowAddUserDialog(false)}
          onUserAdded={fetchUsers}
        />
      )}

      {selectedUser && (
        <ViewUserDialog 
          user={selectedUser}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
