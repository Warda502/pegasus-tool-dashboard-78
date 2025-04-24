import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSharedData, useLanguage, User } from "@/hooks/useSharedData";
import { supabase } from "@/integrations/supabase/client";
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
import { UserSearch } from "@/components/users/UserSearch";
import { UsersTable } from "@/components/users/UsersTable";
import { UserHeaderActions } from "@/components/users/UserHeaderActions";

export default function UsersManager() {
  const navigate = useNavigate();
  const { users, isLoading, addCreditToUser, refreshData } = useSharedData();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const { role } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isAddCreditsDialogOpen, setIsAddCreditsDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);
  
  const handleDeleteUser = async (userId: string) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }
      
      toast(t("deleteSuccess"), {
        description: t("deleteUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast("Error", {
        description: "Failed to delete user"
      });
    }
  };
  
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };
  
  const handleAddUser = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleRenewUser = (user: User) => {
    setSelectedUser(user);
    setIsRenewDialogOpen(true);
  };

  const handleAddCredits = () => {
    setIsAddCreditsDialogOpen(true);
  };
  
  const handleSaveEditedUser = async (updatedUser: User) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updatedUser.Name,
          email: updatedUser.Email,
          password: updatedUser.Password,
          phone: updatedUser.Phone,
          country: updatedUser.Country,
          activate: updatedUser.Activate,
          block: updatedUser.Block,
        })
        .eq('id', updatedUser.id);

      if (error) {
        throw new Error("Failed to update user");
      }

      toast(t("updateSuccess"), {
        description: t("updateUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (error) {
      console.error("Error updating user:", error);
      toast("Error", {
        description: "Failed to update user data"
      });
    }
  };
  
  const handleAddNewUser = async (newUser: any) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.Email,
        password: newUser.Password,
      });
      
      if (authError) {
        throw new Error(authError.message);
      }
      
      if (!authData.user) {
        throw new Error("Failed to create auth user");
      }
      
      const userId = authData.user.id;

      const { error: userError } = await supabase.from('users').insert({
        id: userId,
        uid: userId,
        email: newUser.Email,
        password: newUser.Password,
        name: newUser.Name || '',
        phone: newUser.Phone || '',
        country: newUser.Country || 'السعودية',
        activate: newUser.Activate || 'Active',
        block: newUser.Block || 'Not Blocked',
        credits: newUser.Credits || '0.0',
        user_type: newUser.User_Type || 'Credits License',
        email_type: 'User',
        expiry_time: newUser.Expiry_Time || null,
        start_date: newUser.Start_Date || new Date().toISOString().split('T')[0],
        hwid: 'Null'
      });

      if (userError) {
        throw new Error("Failed to add user data");
      }
      
      toast(t("addSuccess"), {
        description: t("addUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (error) {
      console.error("Error adding user:", error);
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to add user"
      });
    }
  };
  
  const handleRenewConfirm = async (months: string) => {
    if (!selectedUser) return;
    
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(months));
      const newExpiryDate = expiryDate.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('users')
        .update({
          user_type: "Monthly License",
          expiry_time: newExpiryDate
        })
        .eq('id', selectedUser.id);

      if (error) {
        throw new Error("Failed to renew user");
      }

      toast(t("renewSuccess"), {
        description: t("renewUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (error) {
      console.error("Error renewing user:", error);
      toast("Error", {
        description: "Failed to renew user account"
      });
    }
  };

  const handleAddCreditsConfirm = async (userId: string, creditsToAdd: number) => {
    try {
      await addCreditToUser(userId, creditsToAdd);
      
      toast(t("addCreditSuccess"), {
        description: t("addCreditDescription")
      });
    } catch (error) {
      console.error("Error adding credits:", error);
      toast("Error", {
        description: "Failed to add credits"
      });
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    navigate("/login");
  };
  
  const handleAuthError = (errorCode: string): string => {
    if (errorCode.includes("EMAIL_NOT_FOUND")) {
      return t("emailNotFound") || "The email address is not registered!";
    } else if (errorCode.includes("INVALID_EMAIL")) {
      return t("invalidEmail") || "The email format is invalid! (@ is missing or incorrect format)";
    } else if (errorCode.includes("INVALID_LOGIN_CREDENTIALS")) {
      return t("invalidCredentials") || "Invalid Login Credentials";
    } else if (errorCode.includes("INVALID_PASSWORD")) {
      return t("invalidPassword") || "The password is incorrect!";
    } else if (errorCode.includes("USER_DISABLED")) {
      return t("accountDisabled") || "This account has been disabled by the administrator!";
    } else if (errorCode.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
      return t("tooManyAttempts") || "Too many failed attempts, please try again later!";
    } else if (errorCode.includes("API_KEY_INVALID")) {
      return t("invalidApiKey") || "The API key is invalid!";
    } else if (errorCode.includes("EMAIL_EXISTS")) {
      return t("emailExists") || "البريد الإلكتروني مستخدم بالفعل";
    } else {
      return t("serverError") || "Error In Server Error Code: 401";
    }
  };
  
  const filteredUsers = users.filter(user => {
    if (user.Email_Type !== "User") return false;
    
    return (
      user.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.User_Type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.Country?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
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
              <CardDescription>{t("usersDescription")}</CardDescription>
            </div>
          </div>
          <UserHeaderActions
            isAdmin={role === "admin"}
            onRefresh={handleRefresh}
            onAddCredits={handleAddCredits}
            onAddUser={handleAddUser}
          />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <UserSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
          {isLoading ? (
            <div className="text-center py-8">{t("loadingData")}</div>
          ) : filteredUsers.length > 0 ? (
            <UsersTable
              users={filteredUsers}
              isAdmin={role === "admin"}
              onViewUser={handleViewDetails}
              onEditUser={handleEditUser}
              onRenewUser={handleRenewUser}
              onDeleteUser={handleDeleteUser}
            />
          ) : (
            <div className="text-center py-8">
              {t("noUsers")}
            </div>
          )}
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
        onSave={handleSaveEditedUser}
      />
      
      <RenewUserDialog
        isOpen={isRenewDialogOpen}
        onClose={() => setIsRenewDialogOpen(false)}
        onConfirm={handleRenewConfirm}
        userType={selectedUser?.User_Type || ""}
      />
      
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddNewUser}
      />

      <AddCreditsDialog
        isOpen={isAddCreditsDialogOpen}
        onClose={() => setIsAddCreditsDialogOpen(false)}
        users={users.filter(user => user.Email_Type === "User")}
        onAddCredits={handleAddCreditsConfirm}
      />
    </div>
  );
}
