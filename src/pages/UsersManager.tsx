
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSharedData, useLanguage } from "@/hooks/useSharedData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ViewUserDialog } from "@/components/users/ViewUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { RenewUserDialog } from "@/components/users/RenewUserDialog";
import { AddCreditsDialog } from "@/components/users/AddCreditsDialog";
import { UserFilters } from "@/components/users/UserFilters";
import { UserHeaderActions } from "@/components/users/UserHeaderActions";
import { useUserDialogs } from "@/hooks/useUserDialogs";
import { useUserOperations } from "@/hooks/useUserOperations";
import { UsersTable } from "@/components/users/UsersTable";

export default function UsersManager() {
  const navigate = useNavigate();
  const { users, isLoading, addCreditToUser, refreshData } = useSharedData();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const {
    selectedUser,
    isViewDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isRenewDialogOpen,
    isAddCreditsDialogOpen,
    setIsViewDialogOpen,
    setIsEditDialogOpen,
    setIsAddDialogOpen,
    setIsRenewDialogOpen,
    setIsAddCreditsDialogOpen,
    openViewDialog,
    openEditDialog,
    openRenewDialog,
    openAddDialog,
    openAddCreditsDialog
  } = useUserDialogs();
  
  const { updateUser, addUser, renewUser, deleteUser } = useUserOperations();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  
  // Function to handle data refreshing with enhanced logging
  const handleRefresh = () => {
    refreshData();
  };

  useEffect(() => {
    handleRefresh();
  }, []);
  
  // Function to handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Filter users based on search query
    const filtered = users.filter(user => {
      const matchesSearch = query.trim() === "" || 
        (user.Email?.toLowerCase().includes(query.toLowerCase())) ||
        (user.Name?.toLowerCase().includes(query.toLowerCase())) ||
        (user.Phone?.toLowerCase().includes(query.toLowerCase())) ||
        (user.Country?.toLowerCase().includes(query.toLowerCase()));
      
      return matchesSearch;
    });
    
    setFilteredUsers(filtered);
  };

  // Enhanced handler with logging for adding credits
  const handleAddCreditsConfirm = async (userId: string, creditsToAdd: number) => {
    console.log(`UsersManager: Adding ${creditsToAdd} credits to user ${userId}`);
    try {
      await addCreditToUser(userId, creditsToAdd);
      
      toast(t("addCreditSuccess") || "Credits Added", {
        description: t("addCreditDescription") || "Credits have been added successfully"
      });
      handleRefresh();
    } catch (error) {
      console.error("Error adding credits:", error);
      toast(t("error") || "Error", {
        description: t("failedToAddCredits") || "Failed to add credits"
      });
    }
  };

  // Enhanced handlers for user operations
  const handleUpdateUser = async (updatedUser: any) => {
    console.log("UsersManager: Updating user:", updatedUser.id);
    try {
      await updateUser(updatedUser);
      console.log("UsersManager: User updated, refreshing data");
      handleRefresh();
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  };

  const handleAddUser = async (newUser: any) => {
    console.log("UsersManager: Adding new user");
    try {
      await addUser(newUser);
      console.log("UsersManager: User added, refreshing data");
      handleRefresh();
      return true;
    } catch (error) {
      console.error("Error adding user:", error);
      return false;
    }
  };

  const handleRenewUser = async (user: any, months: string) => {
    console.log(`UsersManager: Renewing user ${user.id} for ${months} months`);
    try {
      await renewUser(user, months);
      console.log("UsersManager: User renewed, refreshing data");
      handleRefresh();
      return true;
    } catch (error) {
      console.error("Error renewing user:", error);
      return false;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    console.log(`UsersManager: Deleting user ${userId}`);
    if (confirm(t("confirmDelete") || "Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        console.log("UsersManager: User deleted, refreshing data");
        handleRefresh();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // Initialize filtered users when users change
  useEffect(() => {
    console.log(`UsersManager: Users data changed, total: ${users.length}`);
    handleSearch(searchQuery);
  }, [users, searchQuery]);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{t("users")}</span>
            </CardTitle>
            <CardDescription>
              {t("usersDescription")}
              {users.length > 0 && (
                <span className="ml-2 font-medium">
                  ({users.length} {t("totalUsers") || "total users"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <UserFilters onSearch={handleSearch} />
            
            <UserHeaderActions
              onRefresh={handleRefresh}
              onAddCredits={openAddCreditsDialog}
              onAddUser={openAddDialog}
            />
          </div>
          
          <UsersTable
            users={filteredUsers}
            isLoading={isLoading}
            onViewUser={openViewDialog}
            onEditUser={openEditDialog}
            onRenewUser={openRenewDialog}
            onDeleteUser={handleDeleteUser}
          />
        </CardContent>
      </Card>

      <ViewUserDialog 
        isOpen={isViewDialogOpen} 
        onClose={() => setIsViewDialogOpen(false)} 
        user={selectedUser} 
      />
      
      <EditUserDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        user={selectedUser}
        onSave={handleUpdateUser}
      />
      
      <RenewUserDialog
        isOpen={isRenewDialogOpen}
        onClose={() => setIsRenewDialogOpen(false)}
        onConfirm={(months) => selectedUser && handleRenewUser(selectedUser, months)}
        userType={selectedUser?.User_Type || ""}
      />
      
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddUser}
      />

      <AddCreditsDialog
        isOpen={isAddCreditsDialogOpen}
        onClose={() => setIsAddCreditsDialogOpen(false)}
        users={users}
        onAddCredits={handleAddCreditsConfirm}
      />
    </div>
  );
}
