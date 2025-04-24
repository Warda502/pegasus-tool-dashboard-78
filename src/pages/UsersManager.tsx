
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSharedData, useLanguage, User } from "@/hooks/useSharedData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ViewUserDialog } from "@/components/users/ViewUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { RenewUserDialog } from "@/components/users/RenewUserDialog";
import { AddCreditsDialog } from "@/components/users/AddCreditsDialog";
import { UserHeaderActions } from "@/components/users/UserHeaderActions";
import { UserFilters } from "@/components/users/UserFilters";
import { useUserDialogs } from "@/hooks/useUserDialogs";
import { useUserOperations } from "@/hooks/useUserOperations";
import { UsersTable } from "@/components/users/UsersTable";
import { Loading } from "@/components/ui/loading";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [licenseTypeFilter, setLicenseTypeFilter] = useState("all");

  useEffect(() => {
    // Initial data refresh when component mounts
    console.log("Triggering initial data refresh");
    refreshData();
  }, [refreshData]);
  
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    refreshData();
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

  // Filter users based on search query, status and license type - but admin sees all users
  const filteredUsers = users.filter(user => {
    // Admin can see everything, just apply search filter
    if (role === "admin") {
      return searchQuery.trim() === "" || 
        (user.Email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.Name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.Phone?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.Country?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // For non-admin users, apply all filters
    // Apply search filter if there's a search query
    const matchesSearch = searchQuery.trim() === "" || 
      (user.Email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.Name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.Phone?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.Country?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply status filter if not set to "all"
    const matchesStatus = statusFilter === "all" || user.Block === statusFilter;
    
    // Apply license type filter if not set to "all"
    const matchesLicenseType = licenseTypeFilter === "all" || user.User_Type === licenseTypeFilter;
    
    return matchesSearch && matchesStatus && matchesLicenseType;
  });
  
  console.log("Total users:", users.length, "Filtered users:", filteredUsers.length, "Role:", role);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-gray-100">
      <Card className="max-w-7xl mx-auto shadow mt-8">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-extrabold text-gray-900">{t("users")}</CardTitle>
              <CardDescription>
                {t("usersDescription")} 
                {role === "admin" ? ` (${users.length} total)` : ""}
              </CardDescription>
            </div>
          </div>
          <UserHeaderActions
            isAdmin={role === "admin"}
            onRefresh={handleRefresh}
            onAddCredits={openAddCreditsDialog}
            onAddUser={openAddDialog}
          />
        </CardHeader>
        <CardContent className="pt-4">
          <UserFilters
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            licenseTypeFilter={licenseTypeFilter}
            onLicenseTypeFilterChange={setLicenseTypeFilter}
            isAdmin={role === "admin"}
          />
          
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
