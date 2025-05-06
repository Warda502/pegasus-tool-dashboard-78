
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import UsersTable from "@/components/users/UsersTable";
import UserHeaderActions from "@/components/users/UserHeaderActions";
import AddUserDialog from "@/components/users/AddUserDialog";
import EditUserDialog from "@/components/users/EditUserDialog";
import ViewUserDialog from "@/components/users/ViewUserDialog";
import RenewUserDialog from "@/components/users/RenewUserDialog";
import { useSharedData } from "@/hooks/data/DataContext";
import { useAuth } from "@/hooks/auth/AuthContext";
import { User } from "@/hooks/data/types";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

export default function UsersManager() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const { users, loading, refreshUsers } = useSharedData();
  const { isAdmin } = useAuth();
  
  // State for user dialogs
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);

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

  const handleDeleteUser = async (userId: string) => {
    try {
      await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      toast({
        title: "User deleted successfully",
        description: "The user has been removed from the system.",
      });
      refreshUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error deleting user",
        description: "There was an error deleting the user. Please try again.",
      });
    }
    return true;
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <Card className="p-6">
        <UserHeaderActions onAddUser={handleAddUser} />
        <UsersTable
          users={users}
          isLoading={loading}
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
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onUserAdded={refreshUsers}
        />
      )}

      {selectedUser && isEditDialogOpen && (
        <EditUserDialog
          user={selectedUser}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUserUpdated={refreshUsers}
        />
      )}

      {selectedUser && isViewDialogOpen && (
        <ViewUserDialog
          user={selectedUser}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />
      )}

      {selectedUser && isRenewDialogOpen && (
        <RenewUserDialog
          user={selectedUser}
          open={isRenewDialogOpen}
          onOpenChange={setIsRenewDialogOpen}
          onUserUpdated={refreshUsers}
        />
      )}
    </div>
  );
}
