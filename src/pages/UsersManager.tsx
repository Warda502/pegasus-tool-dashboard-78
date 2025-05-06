
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { UsersTable } from "@/components/users/UsersTable";
import { UserHeaderActions } from "@/components/users/UserHeaderActions";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { ViewUserDialog } from "@/components/users/ViewUserDialog";
import { RenewUserDialog } from "@/components/users/RenewUserDialog";
import { useSharedData } from "@/hooks/data/DataContext";
import { useAuth } from "@/hooks/auth/AuthContext";
import { User } from "@/hooks/useSharedData"; // Keep this import for type compatibility
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserOperations } from "@/hooks/useUserOperations";
import { UserSearch } from "@/components/users/UserSearch";

export default function UsersManager() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const { users, isLoading, refreshData } = useSharedData();
  const { isAdmin } = useAuth();
  const { deleteUser } = useUserOperations();
  
  // State for user dialogs
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handlers for user actions
  const handleAddUser = () => {
    setIsAddDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleRenewUser = (user: User) => {
    setSelectedUser(user);
    setIsRenewDialogOpen(true);
  };

  const handleAddCredits = () => {
    // You can implement the add credits functionality here
    console.log("Add credits clicked");
  };

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      toast({
        title: "User deleted successfully",
        description: "The user has been removed from the system.",
      });
      refreshData();
    }
    return success;
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.Email?.toLowerCase().includes(query) ||
      user.Name?.toLowerCase().includes(query) ||
      user.User_Type?.toLowerCase().includes(query) ||
      user.Country?.toLowerCase().includes(query)
    );
  });

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <UserSearch 
            value={searchQuery} 
            onChange={setSearchQuery} 
          />
          <UserHeaderActions 
            onAddUser={handleAddUser} 
            onRefresh={refreshData} 
            onAddCredits={handleAddCredits} 
          />
        </div>
        <UsersTable
          users={filteredUsers as User[]}
          isLoading={isLoading}
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onRenewUser={handleRenewUser}
          onDeleteUser={handleDeleteUser}
          isAdmin={isAdmin}
        />
      </Card>

      {/* User Dialogs */}
      {isAddDialogOpen && (
        <AddUserDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={() => {
            refreshData();
            return Promise.resolve(true);
          }}
        />
      )}

      {selectedUser && isEditDialogOpen && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          user={selectedUser}
          onSave={() => {
            refreshData();
            return Promise.resolve(true);
          }}
        />
      )}

      {selectedUser && isViewDialogOpen && (
        <ViewUserDialog
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          user={selectedUser}
        />
      )}

      {selectedUser && isRenewDialogOpen && (
        <RenewUserDialog
          isOpen={isRenewDialogOpen}
          onClose={() => setIsRenewDialogOpen(false)}
          userType={selectedUser.User_Type}
          onConfirm={() => {
            refreshData();
            return Promise.resolve(true);
          }}
        />
      )}
    </div>
  );
}
