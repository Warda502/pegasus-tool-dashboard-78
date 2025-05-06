
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
import { useUserOperations } from "@/hooks/data/useUserOperations";
import { UsersTable } from "@/components/users/UsersTable";

export default function UsersManager() {
  const navigate = useNavigate();
  const { users, isLoading, addCreditToUser, refreshData } = useSharedData();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  
  // User dialogs state management using custom hook
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
  
  // User operations from data hook with consistent type definitions
  const { updateUser, addUser, renewUser, deleteUser } = useUserOperations();
  
  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);

  // Initial data load
  useEffect(() => {
    console.log("UsersManager: Triggering initial data refresh");
    refreshData();
  }, [refreshData]);
  
  // Search handler with improved logging
  const handleSearch = (query: string) => {
    console.log("UsersManager: Searching for:", query);
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
    
    console.log(`UsersManager: Found ${filtered.length} matching users`);
    setFilteredUsers(filtered);
  };

  // Handler for adding credits with improved error handling
  const handleAddCreditsConfirm = async (userId: string, creditsToAdd: number) => {
    console.log(`UsersManager: Adding ${creditsToAdd} credits to user ID ${userId}`);
    try {
      await addCreditToUser(userId, creditsToAdd);
      
      toast(t("addCreditSuccess"), {
        description: t("addCreditDescription")
      });
      
      // Explicitly refresh data and query client after operation
      console.log("UsersManager: Refreshing data after adding credits");
      refreshData();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error("UsersManager: Error adding credits:", error);
      toast(t("error") || "Error", {
        description: t("failedAddCredits") || "Failed to add credits"
      });
    }
  };

  // Enhanced delete handler with confirmation and refresh
  const handleDeleteUser = async (userId: string) => {
    console.log("UsersManager: Deleting user with ID:", userId);
    try {
      const success = await deleteUser(userId);
      
      if (success) {
        console.log("UsersManager: User deleted successfully, refreshing data");
        refreshData(); // Ensure UI is updated
      }
    } catch (error) {
      console.error("UsersManager: Error deleting user:", error);
    }
  };

  // Enhanced update handler with refresh
  const handleUpdateUser = async (updatedUser: any) => {
    console.log("UsersManager: Updating user:", updatedUser);
    try {
      const success = await updateUser(updatedUser);
      
      if (success) {
        console.log("UsersManager: User updated successfully, refreshing data");
        setIsEditDialogOpen(false);
        refreshData(); // Ensure UI is updated
      }
    } catch (error) {
      console.error("UsersManager: Error updating user:", error);
    }
  };

  // Enhanced add user handler with refresh
  const handleAddUser = async (newUser: any) => {
    console.log("UsersManager: Adding new user:", newUser);
    try {
      const success = await addUser(newUser);
      
      if (success) {
        console.log("UsersManager: User added successfully, refreshing data");
        setIsAddDialogOpen(false);
        refreshData(); // Ensure UI is updated
      }
    } catch (error) {
      console.error("UsersManager: Error adding user:", error);
    }
  };

  // Enhanced renew user handler with refresh
  const handleRenewUser = async (user: any, months: string) => {
    console.log(`UsersManager: Renewing user ${user?.Email} for ${months} months`);
    try {
      const success = await renewUser(user, months);
      
      if (success) {
        console.log("UsersManager: User renewed successfully, refreshing data");
        setIsRenewDialogOpen(false);
        refreshData(); // Ensure UI is updated
      }
    } catch (error) {
      console.error("UsersManager: Error renewing user:", error);
    }
  };

  // Update filtered users when source data changes
  useEffect(() => {
    console.log("UsersManager: Users data changed, re-applying filter");
    handleSearch(searchQuery);
  }, [users]);

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
              onRefresh={() => {
                console.log("UsersManager: Refresh button clicked");
                refreshData();
              }}
              onAddCredits={() => {
                console.log("UsersManager: Add credits button clicked");
                openAddCreditsDialog();
              }}
              onAddUser={() => {
                console.log("UsersManager: Add user button clicked");
                openAddDialog();
              }}
            />
          </div>
          
          <UsersTable
            users={filteredUsers}
            isLoading={isLoading}
            onViewUser={(user) => {
              console.log("UsersManager: View user action triggered for:", user.Email);
              openViewDialog(user);
            }}
            onEditUser={(user) => {
              console.log("UsersManager: Edit user action triggered for:", user.Email);
              openEditDialog(user);
            }}
            onRenewUser={(user) => {
              console.log("UsersManager: Renew user action triggered for:", user.Email);
              openRenewDialog(user);
            }}
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
