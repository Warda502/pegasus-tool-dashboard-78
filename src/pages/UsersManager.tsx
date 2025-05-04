
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

  useEffect(() => {
    // Initial data refresh when component mounts
    console.log("Triggering initial data refresh");
    refreshData();
  }, [refreshData]);
  
  // Function to handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Filter users based on search query - but admin sees all users
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

  const handleAddCreditsConfirm = async (userId: string, creditsToAdd: number) => {
    try {
      await addCreditToUser(userId, creditsToAdd);
      
      toast(t("addCreditSuccess"), {
        description: t("addCreditDescription")
      });
      
      // Refresh data after adding credits
      refreshData();
    } catch (error) {
      console.error("Error adding credits:", error);
      toast("Error", {
        description: "Failed to add credits"
      });
    }
  };

  // Initialize filtered users when users change
  useEffect(() => {
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
              isAdmin={role === "admin"}
              onRefresh={refreshData}
              onAddCredits={openAddCreditsDialog}
              onAddUser={openAddDialog}
            />
          </div>
          
          <UsersTable
            users={filteredUsers}
            isAdmin={role === "admin"}
            isLoading={isLoading}
            onViewUser={openViewDialog}
            onEditUser={openEditDialog}
            onRenewUser={openRenewDialog}
            onDeleteUser={deleteUser}
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
        onSave={updateUser}
      />
      
      <RenewUserDialog
        isOpen={isRenewDialogOpen}
        onClose={() => setIsRenewDialogOpen(false)}
        onConfirm={(months) => selectedUser && renewUser(selectedUser, months)}
        userType={selectedUser?.User_Type || ""}
      />
      
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={addUser}
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
