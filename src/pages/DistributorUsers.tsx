
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Search, RefreshCw } from "lucide-react";
import { useSharedData } from "@/hooks/data/DataContext";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { ViewUserDialog } from "@/components/users/ViewUserDialog";
import { useUserDialogs } from "@/hooks/useUserDialogs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User } from "@/hooks/data/types";
import { supabase } from "@/integrations/supabase/client";

export default function DistributorUsers() {
  const { users, refreshData } = useSharedData();
  const { user, isDistributor } = useAuth();
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    selectedUser, 
    isViewDialogOpen, 
    setIsViewDialogOpen, 
    openViewDialog 
  } = useUserDialogs();

  // Filter users that belong to this distributor
  useEffect(() => {
    if (!users || !user?.id) return;
    
    const distributorUsers = users.filter(u => 
      u.distributor_id === user.id || 
      u.distributor_id === user.uid
    );
    
    // Apply search filter
    const filtered = distributorUsers.filter(u => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        (u.email?.toLowerCase().includes(query)) ||
        (u.name?.toLowerCase().includes(query)) ||
        (u.Email?.toLowerCase().includes(query)) ||
        (u.Name?.toLowerCase().includes(query)) ||
        (u.Phone?.toLowerCase().includes(query)) ||
        (u.phone?.toLowerCase().includes(query))
      );
    });
    
    setFilteredUsers(filtered);
  }, [users, user, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = () => {
    refreshData();
  };

  const handleRemoveUser = async (userId: string) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Update the user to remove distributor association
      const { error } = await supabase
        .from('users')
        .update({ distributor_id: null })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success(t("userRemoved") || "User removed successfully");
      refreshData();
    } catch (error) {
      console.error("Error removing user:", error);
      toast.error(t("errorRemovingUser") || "Error removing user");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDistributor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("accessDenied")}</CardTitle>
          <CardDescription>{t("distributorAccessOnly")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{t("myUsers") || "My Users"}</span>
            </CardTitle>
            <CardDescription>
              {t("distributorUsersDesc") || "Manage users assigned to you"}
              {filteredUsers.length > 0 && (
                <span className="ml-2 font-medium">
                  ({filteredUsers.length} {t("totalUsers") || "total users"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("searchUsers") || "Search users..."}
                className="w-full pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("refresh")}
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("phone")}</TableHead>
                  <TableHead>{t("country")}</TableHead>
                  <TableHead>{t("credits")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id || user.uid}>
                      <TableCell className="font-medium">
                        {user.name || user.Name || "-"}
                      </TableCell>
                      <TableCell>{user.email || user.Email || "-"}</TableCell>
                      <TableCell>{user.phone || user.Phone || "-"}</TableCell>
                      <TableCell>{user.country || user.Country || "-"}</TableCell>
                      <TableCell>
                        {user.credits || user.Credits || "0"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(user)}
                          >
                            {t("viewDetails")}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                              >
                                {t("remove")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("confirmRemoval")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("removeUserConfirm") || "Are you sure you want to remove this user? They will no longer be associated with your account."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRemoveUser(user.id || "")}
                                >
                                  {t("remove")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      {searchQuery 
                        ? t("noSearchResults") || "No users match your search" 
                        : t("noUsersAssigned") || "No users are assigned to you yet"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ViewUserDialog 
        isOpen={isViewDialogOpen} 
        onClose={() => setIsViewDialogOpen(false)} 
        user={selectedUser} 
      />
    </div>
  );
}
