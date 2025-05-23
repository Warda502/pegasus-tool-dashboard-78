
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, RefreshCw, Edit, Trash, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Label } from "@/components/ui/label";
import { UserActions } from "@/components/users/UserActions";
import { User } from "@/hooks/useSharedData";
import { useUserOperations } from "@/hooks/useUserOperations";
import { useUserDialogs } from "@/hooks/useUserDialogs";

const DistributorUsers = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [distributorId, setDistributorId] = useState<string | null>(null);
  const { deleteUser, updateUser, addUser, renewUser } = useUserOperations();
  const { 
    ViewUserDialog, 
    EditUserDialog, 
    AddUserDialog, 
    RenewUserDialog,
    viewUser,
    editUser,
    openAddUser,
    renewUserDialog,
    isViewOpen,
    isEditOpen,
    isAddOpen,
    isRenewOpen
  } = useUserDialogs();

  useEffect(() => {
    const fetchDistributorId = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('distributors')
          .select('id')
          .eq('uid', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching distributor id:", error);
          return;
        }
        
        setDistributorId(data.id);
      } catch (err) {
        console.error("Error in fetchDistributorId:", err);
      }
    };
    
    fetchDistributorId();
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!distributorId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('distributor_id', distributorId);
          
        if (error) {
          console.error("Error fetching users:", error);
          return;
        }
        
        // Transform data to match User interface
        const transformedUsers = data.map(user => ({
          ...user,
          Name: user.name || "",
          Email: user.email || "",
          Password: user.password || "",
          Phone: user.phone || "",
          Country: user.country || "",
          Activate: user.activate || "Not Activate",
          Block: user.block || "Not Blocked",
          Credits: user.credits || "0.0",
          User_Type: user.user_type || "Credits License",
          Email_Type: user.email_type || "User",
          Expiry_Time: user.expiry_time || "",
          Start_Date: user.start_date || "",
          Hwid: user.hwid || "",
          UID: user.uid || ""
        }));
        
        setUsers(transformedUsers);
      } catch (err) {
        console.error("Error in fetchUsers:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [distributorId]);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddUser = async (userData: any) => {
    if (!distributorId) {
      toast.error(t("error"), {
        description: t("distributorNotFound") || "Distributor ID not found"
      });
      return false;
    }
    
    // Add distributor_id to user data
    const userDataWithDistributor = {
      ...userData,
      distributor_id: distributorId
    };
    
    const success = await addUser(userDataWithDistributor);
    if (success) {
      // Refresh users list
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('distributor_id', distributorId);
        
      if (!error && data) {
        const transformedUsers = data.map(user => ({
          ...user,
          Name: user.name || "",
          Email: user.email || "",
          Password: user.password || "",
          Phone: user.phone || "",
          Country: user.country || "",
          Activate: user.activate || "Not Activate",
          Block: user.block || "Not Blocked",
          Credits: user.credits || "0.0",
          User_Type: user.user_type || "Credits License",
          Email_Type: user.email_type || "User",
          Expiry_Time: user.expiry_time || "",
          Start_Date: user.start_date || "",
          Hwid: user.hwid || "",
          UID: user.uid || ""
        }));
        
        setUsers(transformedUsers);
      }
    }
    
    return success;
  };

  const handleRefresh = async () => {
    if (!distributorId) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('distributor_id', distributorId);
        
      if (error) {
        console.error("Error refreshing users:", error);
        return;
      }
      
      // Transform data to match User interface
      const transformedUsers = data.map(user => ({
        ...user,
        Name: user.name || "",
        Email: user.email || "",
        Password: user.password || "",
        Phone: user.phone || "",
        Country: user.country || "",
        Activate: user.activate || "Not Activate",
        Block: user.block || "Not Blocked",
        Credits: user.credits || "0.0",
        User_Type: user.user_type || "Credits License",
        Email_Type: user.email_type || "User",
        Expiry_Time: user.expiry_time || "",
        Start_Date: user.start_date || "",
        Hwid: user.hwid || "",
        UID: user.uid || ""
      }));
      
      setUsers(transformedUsers);
      toast.success(t("success"), {
        description: t("dataRefreshed") || "Data refreshed successfully"
      });
    } catch (err) {
      console.error("Error in refreshUsers:", err);
      toast.error(t("error"), {
        description: t("refreshError") || "Error refreshing data"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("manageUsers") || "Manage Users"}</h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh")}
          </Button>
          
          <Button onClick={() => openAddUser()} variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("addUser")}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchUsers") || "Search users..."}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("users") || "Users"}</CardTitle>
          <CardDescription>
            {t("usersDescription") || "Manage users that are assigned to you"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("userType")}</TableHead>
                  <TableHead>{t("credits")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <User className="h-10 w-10 mb-2" />
                        <p>{t("noUsersFound") || "No users found"}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.Name}</TableCell>
                      <TableCell>{user.Email}</TableCell>
                      <TableCell>{user.User_Type}</TableCell>
                      <TableCell>{user.Credits}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.Activate === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {user.Activate}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <UserActions 
                          user={user}
                          isAdmin={false}
                          onView={viewUser}
                          onEdit={editUser}
                          onRenew={renewUserDialog}
                          onDelete={deleteUser}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* User Dialogs */}
      <ViewUserDialog />
      <EditUserDialog onUpdate={updateUser} />
      <AddUserDialog onAdd={handleAddUser} />
      <RenewUserDialog onRenew={renewUser} />
    </div>
  );
};

export default DistributorUsers;
