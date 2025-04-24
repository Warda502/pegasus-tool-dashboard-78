
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSharedData, useLanguage } from "@/hooks/useSharedData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Search, Edit, Trash, UserPlus, ArrowLeft, Eye, RefreshCw, PlusCircle } from "lucide-react";
import { ViewUserDialog } from "@/components/users/ViewUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { AddUserDialog } from "@/components/users/AddUserDialog";
import { RenewUserDialog } from "@/components/users/RenewUserDialog";
import { AddCreditsDialog } from "@/components/users/AddCreditsDialog";
import { useQueryClient } from "@tanstack/react-query";

export default function UsersManager() {
  const navigate = useNavigate();
  const { users, isLoading, addCreditToUser, refreshData } = useSharedData();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
      const url = `https://pegasus-tool-database-default-rtdb.firebaseio.com/users/${userId}.json?auth=${token}`;
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`فشل حذف المستخدم: ${response.status}`);
      }
      
      toast(t("deleteSuccess"), {
        description: t("deleteUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error("فشل في حذف المستخدم:", error);
      toast("خطأ", {
        description: "فشل في حذف المستخدم"
      });
      handleLogout();
    }
  };
  
  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };
  
  const handleAddUser = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleRenewUser = (user: any) => {
    setSelectedUser(user);
    setIsRenewDialogOpen(true);
  };

  const handleAddCredits = () => {
    setIsAddCreditsDialogOpen(true);
  };
  
  const handleSaveEditedUser = async (updatedUser: any) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      const url = `https://pegasus-tool-database-default-rtdb.firebaseio.com/users/${updatedUser.id}.json?auth=${token}`;
      const response = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify({
          Name: updatedUser.Name,
          Email: updatedUser.Email,
          Password: updatedUser.Password,
          Phone: updatedUser.Phone,
          Country: updatedUser.Country,
          Activate: updatedUser.Activate,
          Block: updatedUser.Block,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      toast(t("updateSuccess"), {
        description: t("updateUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (error) {
      console.error("Error updating user:", error);
      toast("خطأ", {
        description: "فشل في تحديث بيانات المستخدم"
      });
      handleLogout();
    }
  };
  
  const handleAddNewUser = async (newUser: any) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      // First create Firebase Auth user
      const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAoZXmXFEvXAujyaI1ahFolBf06in5R4P4`;
      const authResponse = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newUser.Email,
          password: newUser.Password,
          returnSecureToken: true
        })
      });
      
      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(handleAuthError(errorData.error?.message || "فشل في إنشاء المستخدم"));
      }
      
      const authData = await authResponse.json();
      const localId = authData.localId;
      
      // Now save user data to Firebase Realtime Database
      newUser.UID = localId;
      newUser.Hwid = "Null"; // As specified in the code

      const url = `https://pegasus-tool-database-default-rtdb.firebaseio.com/users/${localId}.json?auth=${token}`;
      const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error("Failed to add user data");
      }
      
      toast(t("addSuccess"), {
        description: t("addUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (error) {
      console.error("Error adding user:", error);
      toast("خطأ", {
        description: error instanceof Error ? error.message : "فشل في إضافة المستخدم"
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
      // Calculate new expiry date
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(months));
      const newExpiryDate = expiryDate.toISOString().split('T')[0];
      
      const url = `https://pegasus-tool-database-default-rtdb.firebaseio.com/users/${selectedUser.id}.json?auth=${token}`;
      const response = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify({
          User_Type: "Monthly License",
          Expiry_Time: newExpiryDate
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to renew user");
      }

      toast(t("renewSuccess"), {
        description: t("renewUserSuccess")
      });
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (error) {
      console.error("Error renewing user:", error);
      toast("خطأ", {
        description: "فشل في تجديد حساب المستخدم"
      });
      handleLogout();
    }
  };

  const handleAddCreditsConfirm = async (userId: string, creditsToAdd: number) => {
    try {
      // Use the shared addCreditToUser function with +0 suffix
      await addCreditToUser(userId, creditsToAdd);
      
      toast(t("addCreditSuccess"), {
        description: t("addCreditDescription")
      });
    } catch (error) {
      console.error("Error adding credits:", error);
      toast("خطأ", {
        description: "فشل في إضافة الرصيد"
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
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} className="flex items-center" variant="outline">
              <RefreshCw className="h-5 w-5 mr-2" />
              {t("refresh")}
            </Button>
            <Button onClick={handleAddCredits} className="flex items-center" variant="outline">
              <PlusCircle className="h-5 w-5 mr-2" />
              {t("addCredit")}
            </Button>
            <Button onClick={handleAddUser} className="flex items-center" variant="outline">
              <UserPlus className="h-5 w-5 mr-2" />
              {t("addUser")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-gray-400`} />
              <Input
                placeholder={t("searchUsers")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? "pl-3 pr-10 w-full" : "pl-10 pr-3 w-full"}
              />
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-8">{t("loadingData")}</div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("userType")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("country")}</TableHead>
                    <TableHead>{t("credit")}</TableHead>
                    <TableHead>{t("startDate")}</TableHead>
                    <TableHead>{t("expiryDate")}</TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.Email}</TableCell>
                      <TableCell>{user.User_Type}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${user.Block === "Not Blocked" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {user.Block}
                        </span>
                      </TableCell>
                      <TableCell>{user.Country}</TableCell>
                      <TableCell>{user.Credits}</TableCell>
                      <TableCell>{user.Start_Date}</TableCell>
                      <TableCell>{user.Expiry_Time}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(user)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t("viewDetails")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t("edit")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRenewUser(user)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            {t("renew")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            {t("delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
