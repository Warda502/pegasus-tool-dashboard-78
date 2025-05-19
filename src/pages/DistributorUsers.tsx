
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/AuthContext";
import { ViewUserDialog } from "@/components/users/ViewUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { RenewUserDialog } from "@/components/users/RenewUserDialog";
import { AddCreditsDialog } from "@/components/users/AddCreditsDialog";
import { UserFilters } from "@/components/users/UserFilters";
import { UserHeaderActions } from "@/components/users/UserHeaderActions";
import { useUserDialogs } from "@/hooks/useUserDialogs";
import { useDistributorOperations, DistributorUser } from "@/hooks/data/useDistributorOperations";
import { UsersTable } from "@/components/users/UsersTable";

export default function DistributorUsers() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { isDistributor } = useAuth();
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
  
  const { loading, getDistributorUsers, addUserAsDistributor, addCreditsToUser } = useDistributorOperations();
  
  const [users, setUsers] = useState<DistributorUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<DistributorUser[]>([]);
  
  // Function to refresh data
  const handleRefresh = async () => {
    const result = await getDistributorUsers();
    if (result.data) {
      setUsers(result.data);
    } else {
      toast(t("error") || "خطأ", {
        description: result.error || t("failedToLoadUsers") || "فشل تحميل بيانات المستخدمين"
      });
    }
  };

  useEffect(() => {
    if (isDistributor) {
      handleRefresh();
    } else {
      navigate('/dashboard');
    }
  }, [isDistributor, navigate]);
  
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

  // Handler for adding credits
  const handleAddCreditsConfirm = async (userId: string, creditsToAdd: number) => {
    console.log(`Adding ${creditsToAdd} credits to user ${userId}`);
    const success = await addCreditsToUser(userId, creditsToAdd);
    if (success) {
      handleRefresh();
    }
  };

  // Handler for adding users
  const handleAddUser = async (newUser: any) => {
    console.log("Adding new user");
    const success = await addUserAsDistributor(newUser);
    if (success) {
      handleRefresh();
      return true;
    }
    return false;
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
              <span>{t("distributorUsers") || "مستخدمو الموزع"}</span>
            </CardTitle>
            <CardDescription>
              {t("distributorUsersDescription") || "إدارة المستخدمين التابعين للموزع"}
              {users.length > 0 && (
                <span className="ml-2 font-medium">
                  ({users.length} {t("totalUsers") || "إجمالي المستخدمين"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <UserFilters onSearch={handleSearch} />
            
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <UserHeaderActions
                onRefresh={handleRefresh}
                onAddCredits={openAddCreditsDialog}
                onAddUser={openAddDialog}
                // Distributor doesn't have access to add to plan
                onAddToPlan={null}
              />
            </div>
          </div>
          
          <UsersTable
            users={filteredUsers}
            isLoading={loading}
            onViewUser={openViewDialog}
            onEditUser={openEditDialog}
            onRenewUser={openRenewDialog}
            // Distributor can't delete users
            onDeleteUser={null}
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
        onSave={async () => false} // Distributors can't edit users yet
      />
      
      <RenewUserDialog
        isOpen={isRenewDialogOpen}
        onClose={() => setIsRenewDialogOpen(false)}
        onConfirm={() => false} // Distributors can't renew users yet
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
