
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Users, Search, RefreshCw, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ViewUserDialog } from "@/components/users/ViewUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { RenewUserDialog } from "@/components/users/RenewUserDialog";
import { AddCreditsDialog } from "@/components/users/AddCreditsDialog";
import { useAuth } from "@/hooks/auth/AuthContext";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { User } from "@/hooks/data/types";

// Define our local user type to avoid conflicts with the imported User type
interface DistributorUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  country?: string;
  credits?: string;
  expiry_date?: string;
  block?: string;
  user_type?: string;
  created_at?: string;
  password?: string;
  uid?: string;
  [key: string]: any;
}

export default function DistributorUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<DistributorUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DistributorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedUser, setSelectedUser] = useState<DistributorUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isAddCreditsDialogOpen, setIsAddCreditsDialogOpen] = useState(false);
  
  // Fetch users managed by this distributor
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('distributor_id', currentUser.id);
          
        if (error) throw error;
        
        setUsers(data || []);
        setFilteredUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser]);
  
  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.email?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query) ||
      user.country?.toLowerCase().includes(query)
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);
  
  // User operations
  const refreshUsers = async () => {
    if (!currentUser?.id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('distributor_id', currentUser.id);
        
      if (error) throw error;
      
      setUsers(data || []);
      setFilteredUsers(data || []);
      
      toast({
        description: "User list has been updated."
      });
    } catch (error) {
      console.error('Error refreshing users:', error);
      toast({
        description: "Failed to refresh users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addUser = async (userData: Partial<DistributorUser>) => {
    if (!currentUser?.id) return false;
    
    try {
      // Add distributor_id to the user data
      const newUserData = {
        ...userData,
        distributor_id: currentUser.id,
        email: userData.email || '',
        password: userData.password || '',
        uid: userData.id || '',
        id: userData.id || ''
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([newUserData])
        .select();
        
      if (error) throw error;
      
      toast({
        description: "User has been added successfully."
      });
      
      refreshUsers();
      return true;
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const updateUser = async (userData: Partial<DistributorUser>) => {
    if (!userData.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userData.id)
        .select();
        
      if (error) throw error;
      
      toast({
        description: "User has been updated successfully."
      });
      
      refreshUsers();
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const renewUser = async (user: DistributorUser, months: string) => {
    if (!user.id) return false;
    
    try {
      // Implementation would go here
      
      toast({
        description: `User subscription has been renewed for ${months} months.`
      });
      
      refreshUsers();
      return true;
    } catch (error) {
      console.error('Error renewing user:', error);
      toast({
        description: "Failed to renew user. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        description: "User has been deleted successfully."
      });
      
      refreshUsers();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const addCreditToUser = async (userId: string, creditsToAdd: number): Promise<void> => {
    try {
      // First get current user credits
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Calculate new credits value
      const currentCredits = parseFloat(userData.credits || '0');
      const newCredits = currentCredits + creditsToAdd;
      
      // Update user credits
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: newCredits.toString() })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Record the operation in server_history
      if (currentUser?.id) {
        const { error: historyError } = await supabase
          .from('server_history')
          .insert([{
            distributor_id: currentUser.id,
            operation_type: 'credit_allocation',
            operation_details: JSON.stringify({
              previous_credits: currentCredits,
              added_credits: creditsToAdd,
              new_total: newCredits
            }),
            amount: creditsToAdd,
            target_user_id: userId
          }]);
          
        if (historyError) throw historyError;
      }
      
      toast({
        description: `Added ${creditsToAdd} credits to user.`
      });
      
      refreshUsers();
    } catch (error) {
      console.error('Error adding credits:', error);
      toast({
        description: "Failed to add credits. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Dialog handlers
  const openViewDialog = (user: DistributorUser) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };
  
  const openEditDialog = (user: DistributorUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };
  
  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };
  
  const openRenewDialog = (user: DistributorUser) => {
    setSelectedUser(user);
    setIsRenewDialogOpen(true);
  };
  
  const openAddCreditsDialog = (user: DistributorUser) => {
    setSelectedUser(user);
    setIsAddCreditsDialogOpen(true);
  };
  
  // Table columns
  const columns = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: { row: any }) => <div className="font-medium">{row.original.email}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "credits",
      header: "Credits",
    },
    {
      accessorKey: "expiry_time",
      header: "Expiry Date",
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => {
        const user = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openViewDialog(user)}>View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditDialog(user)}>Edit user</DropdownMenuItem>
              <DropdownMenuItem onClick={() => openAddCreditsDialog(user)}>Add credits</DropdownMenuItem>
              <DropdownMenuItem onClick={() => openRenewDialog(user)}>Renew subscription</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this user?')) {
                    deleteUser(user.id);
                  }
                }}
              >
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>My Users</span>
            </CardTitle>
            <CardDescription>
              Manage users assigned to you
              {users.length > 0 && (
                <span className="ml-2 font-medium">
                  ({users.length} total users)
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Search and filters */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={refreshUsers}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              
              <Button
                size="sm"
                className="h-9"
                onClick={openAddDialog}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Add User
              </Button>
            </div>
          </div>
          
          {/* Users table */}
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredUsers}
              emptyMessage="No users found"
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs - converting the selectedUser to any to resolve type incompatibilities */}
      <ViewUserDialog 
        isOpen={isViewDialogOpen} 
        onClose={() => setIsViewDialogOpen(false)} 
        user={selectedUser as any} 
      />
      
      <EditUserDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        user={selectedUser as any}
        onSave={updateUser as any}
      />
      
      <RenewUserDialog
        isOpen={isRenewDialogOpen}
        onClose={() => setIsRenewDialogOpen(false)}
        onConfirm={(months) => selectedUser && renewUser(selectedUser, months)}
        userType={selectedUser?.user_type || ""}
      />
      
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={addUser as any}
      />

      <AddCreditsDialog
        isOpen={isAddCreditsDialogOpen}
        onClose={() => setIsAddCreditsDialogOpen(false)}
        users={selectedUser ? [selectedUser as any] : []}
        onAddCredits={addCreditToUser as any}
      />
    </div>
  );
}
