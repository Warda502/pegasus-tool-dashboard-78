
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlusIcon, UserX, RefreshCcw, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { AddCreditsDialog } from '@/components/users/AddCreditsDialog';

// Create a custom UserSearch component for this page
function UserSearch({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <div className="relative">
      <Input
        placeholder="Search users..."
        onChange={(e) => onSearch(e.target.value)}
        className="pl-8"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-2">
        <svg
          className="h-4 w-4 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
    </div>
  );
}

export default function DistributorUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add user state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Credits dialog state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isCreditsDialogOpen, setIsCreditsDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    fetchUsers();
  }, [user]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('distributor_id', user?.id);
        
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddUser = async () => {
    try {
      setAddingUser(true);
      
      // First check if the user exists
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, email, distributor_id')
        .eq('email', newUserEmail)
        .single();
        
      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }
      
      if (existingUser) {
        // User exists, check if they already have a distributor
        if (existingUser.distributor_id) {
          toast.error('User already assigned to another distributor');
          return;
        }
        
        // Update the user to assign them to this distributor
        const { error: updateError } = await supabase
          .from('users')
          .update({ distributor_id: user?.id })
          .eq('id', existingUser.id);
          
        if (updateError) {
          throw updateError;
        }
        
        toast.success(`User ${newUserEmail} added to your distribution list`);
      } else {
        toast.error('User not found. They must register first.');
      }
      
      setIsAddDialogOpen(false);
      setNewUserEmail('');
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };
  
  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ distributor_id: null })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      toast.success('User removed from your distribution list');
      fetchUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    }
  };
  
  const handleAddCredits = (user: any) => {
    setSelectedUser(user);
    setIsCreditsDialogOpen(true);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const filteredUsers = searchQuery 
    ? users.filter(user => 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Users</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Existing User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">User Email</Label>
                  <Input 
                    id="email" 
                    placeholder="user@example.com" 
                    value={newUserEmail} 
                    onChange={(e) => setNewUserEmail(e.target.value)} 
                  />
                </div>
                <Button onClick={handleAddUser} disabled={addingUser || !newUserEmail}>
                  {addingUser ? 'Adding...' : 'Add User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <UserSearch onSearch={handleSearch} />
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name || 'N/A'}</TableCell>
                      <TableCell>
                        {user.credits || '0'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.block === 'Blocked' ? 'destructive' : 'outline'}>
                          {user.block === 'Blocked' ? 'Blocked' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAddCredits(user)}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      
      {/* Credits dialog */}
      {selectedUser && (
        <AddCreditsDialog 
          open={isCreditsDialogOpen}
          onOpenChange={setIsCreditsDialogOpen}
          user={selectedUser}
          onCreditsAdded={fetchUsers}
        />
      )}
    </Card>
  );
}
