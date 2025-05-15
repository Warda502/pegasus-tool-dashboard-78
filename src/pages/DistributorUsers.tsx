
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Users, RefreshCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useDistributorOperations } from "@/hooks/useDistributorOperations";
import { ViewUserDialog } from "@/components/users/ViewUserDialog";
import { UserSearch } from "@/components/users/UserSearch";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/hooks/useSharedData";

export default function DistributorUsers() {
  const { isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { isAuthenticated, isDistributor } = useAuth();
  const { fetchDistributorUsers, deleteUser } = useDistributorOperations();
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["distributor_users"],
    queryFn: fetchDistributorUsers,
    enabled: isAuthenticated && isDistributor,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm(t("confirmDelete") || "Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        handleRefresh();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Filter users based on search query
    const filtered = users.filter(user => {
      return query.trim() === "" || 
        (user.Email?.toLowerCase().includes(query.toLowerCase())) ||
        (user.Name?.toLowerCase().includes(query.toLowerCase())) ||
        (user.Phone?.toLowerCase().includes(query.toLowerCase())) ||
        (user.Country?.toLowerCase().includes(query.toLowerCase()));
    });
    
    setFilteredUsers(filtered);
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
              <span>{t("distributorUsers") || "My Users"}</span>
            </CardTitle>
            <CardDescription>
              {t("distributorUsersDescription") || "Manage users assigned to you"}
              {users.length > 0 && (
                <span className="ml-2 font-medium">
                  ({users.length} {t("totalUsers") || "total users"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <UserSearch onSearch={handleSearch} />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              {t("refresh") || "Refresh"}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-start font-medium">{t("name") || "Name"}</th>
                    <th className="p-2 text-start font-medium">{t("email") || "Email"}</th>
                    <th className="p-2 text-start font-medium">{t("country") || "Country"}</th>
                    <th className="p-2 text-start font-medium">{t("actions") || "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-2">{user.Name || "—"}</td>
                      <td className="p-2">{user.Email}</td>
                      <td className="p-2">{user.Country || "—"}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            {t("view") || "View"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            {t("delete") || "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center bg-muted/20 rounded-md">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">
                {t("noUsersFound") || "No users found"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchQuery
                  ? t("noUsersMatchSearch") || "No users match your search query"
                  : t("noUsersAssigned") || "You don't have any users assigned to you yet"}
              </p>
            </div>
          )}
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
