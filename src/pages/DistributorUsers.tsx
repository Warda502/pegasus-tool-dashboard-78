
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DistributorUser {
  id: string;
  name: string;
  email: string;
  credits: string;
  activate: string;
  block: string;
}

export default function DistributorUsers() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<DistributorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch users assigned to this distributor
  useEffect(() => {
    const fetchDistributorUsers = async () => {
      try {
        if (!user?.id) return;
        
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('distributor_id', user.id);
          
        if (error) {
          console.error('Error fetching distributor users:', error);
          toast.error(t("fetchError") || "Error fetching users");
          return;
        }
        
        const formattedUsers = data.map(user => ({
          id: user.id,
          name: user.name || '',
          email: user.email || '',
          credits: user.credits || '0.0',
          activate: user.activate || 'Not Activate',
          block: user.block || 'Not Blocked'
        }));
        
        setUsers(formattedUsers);
        
      } catch (error) {
        console.error('Error in fetchDistributorUsers:', error);
        toast.error(t("unexpectedError") || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDistributorUsers();
  }, [user, t]);
  
  // Handle user removal
  const handleRemoveUser = async () => {
    try {
      if (!selectedUserId) return;
      
      // Update the user to remove the distributor_id
      const { error } = await supabase
        .from('users')
        .update({ distributor_id: null })
        .eq('id', selectedUserId);
        
      if (error) {
        console.error('Error removing user from distributor:', error);
        toast.error(t("removeUserError") || "Error removing user");
        return;
      }
      
      // Update local state
      setUsers(users.filter(user => user.id !== selectedUserId));
      toast.success(t("userRemoved") || "User removed successfully");
      
    } catch (error) {
      console.error('Error in handleRemoveUser:', error);
      toast.error(t("unexpectedError") || "An unexpected error occurred");
    } finally {
      setSelectedUserId(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("distributorUsers") || "Managed Users"}</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {t("noUsersFound") || "No users assigned to you yet"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name") || "Name"}</TableHead>
                  <TableHead>{t("email") || "Email"}</TableHead>
                  <TableHead>{t("credits") || "Credits"}</TableHead>
                  <TableHead>{t("status") || "Status"}</TableHead>
                  <TableHead>{t("actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.credits}</TableCell>
                    <TableCell>
                      {user.block === 'Blocked' ? (
                        <span className="text-red-500">{t("blocked") || "Blocked"}</span>
                      ) : user.activate !== 'Active' ? (
                        <span className="text-orange-500">{t("notActive") || "Not Active"}</span>
                      ) : (
                        <span className="text-green-500">{t("active") || "Active"}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("removeUser") || "Remove User"}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("removeUserConfirmation") || "Are you sure you want to remove this user from your management? This action cannot be undone."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRemoveUser}>{t("remove") || "Remove"}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
