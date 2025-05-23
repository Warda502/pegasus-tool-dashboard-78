
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Plus, Search, RefreshCw, Edit, Trash, CreditCard, User, Users } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Distributor {
  id: string;
  uid: string;
  current_balance: number;
  credit_limit: number;
  commission_rate: string;
  status: string;
  facebook: string;
  website: string;
  permissions: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const Distributors = () => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add/Edit distributor dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  
  // Add credits dialog
  const [isAddCreditsDialogOpen, setIsAddCreditsDialogOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDescription, setCreditDescription] = useState("");
  
  // Form states
  const [formData, setFormData] = useState({
    userId: "",
    commission_rate: "",
    credit_limit: "",
    facebook: "",
    website: "",
    permissions: "",
  });
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchDistributors();
    fetchAvailableUsers();
  }, []);

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      
      // Fetch distributors with joined user data
      const { data, error } = await supabase
        .from('distributors')
        .select(`
          *,
          users!users_distributor_id_fkey (
            email,
            name
          )
        `);
        
      if (error) {
        console.error("Error fetching distributors:", error);
        return;
      }
      
      // Process data to include user info
      const processedData = data.map(item => ({
        ...item,
        user_email: item.users?.length > 0 ? item.users[0].email : undefined,
        user_name: item.users?.length > 0 ? item.users[0].name : undefined
      }));
      
      setDistributors(processedData);
    } catch (err) {
      console.error("Error in fetchDistributors:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      // Fetch users who are not already distributors and have email_type != 'distributor'
      const { data, error } = await supabase
        .from('users')
        .select('id, uid, email, name')
        .is('distributor_id', null)
        .not('email_type', 'eq', 'distributor');
        
      if (error) {
        console.error("Error fetching available users:", error);
        return;
      }
      
      setAvailableUsers(data || []);
    } catch (err) {
      console.error("Error in fetchAvailableUsers:", err);
    }
  };

  const handleRefresh = async () => {
    await fetchDistributors();
    await fetchAvailableUsers();
    toast.success(t("success"), {
      description: t("dataRefreshed") || "Data refreshed successfully"
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      commission_rate: "",
      credit_limit: "",
      facebook: "",
      website: "",
      permissions: "",
    });
  };

  const handleAddDistributor = async () => {
    try {
      if (!formData.userId) {
        toast.error(t("error"), {
          description: t("selectUser") || "Please select a user"
        });
        return;
      }
      
      if (!formData.commission_rate || !formData.credit_limit) {
        toast.error(t("error"), {
          description: t("requiredFields") || "Please fill in all required fields"
        });
        return;
      }
      
      // Get user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, uid')
        .eq('id', formData.userId)
        .single();
        
      if (userError) {
        console.error("Error fetching user data:", userError);
        toast.error(t("error"), {
          description: t("userNotFound") || "User not found"
        });
        return;
      }
      
      // Create distributor record
      const { data, error } = await supabase
        .from('distributors')
        .insert({
          uid: userData.uid,
          commission_rate: formData.commission_rate,
          credit_limit: parseFloat(formData.credit_limit),
          current_balance: 0,
          facebook: formData.facebook || null,
          website: formData.website || null,
          permissions: formData.permissions || null,
          status: 'active'
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating distributor:", error);
        toast.error(t("error"), {
          description: t("createFailed") || "Failed to create distributor"
        });
        return;
      }
      
      // Update user to be a distributor
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email_type: 'distributor',
          distributor_id: data.id
        })
        .eq('id', formData.userId);
        
      if (updateError) {
        console.error("Error updating user type:", updateError);
        
        // Attempt to rollback distributor creation
        await supabase
          .from('distributors')
          .delete()
          .eq('id', data.id);
          
        toast.error(t("error"), {
          description: t("updateFailed") || "Failed to update user type"
        });
        return;
      }
      
      toast.success(t("success"), {
        description: t("distributorCreated") || "Distributor created successfully"
      });
      
      resetForm();
      setIsAddDialogOpen(false);
      await handleRefresh();
    } catch (err) {
      console.error("Error in handleAddDistributor:", err);
      toast.error(t("error"), {
        description: t("unexpectedError") || "An unexpected error occurred"
      });
    }
  };

  const handleEditDistributor = async () => {
    try {
      if (!selectedDistributor) return;
      
      if (!formData.commission_rate || !formData.credit_limit) {
        toast.error(t("error"), {
          description: t("requiredFields") || "Please fill in all required fields"
        });
        return;
      }
      
      // Update distributor record
      const { error } = await supabase
        .from('distributors')
        .update({
          commission_rate: formData.commission_rate,
          credit_limit: parseFloat(formData.credit_limit),
          facebook: formData.facebook || null,
          website: formData.website || null,
          permissions: formData.permissions || null
        })
        .eq('id', selectedDistributor.id);
        
      if (error) {
        console.error("Error updating distributor:", error);
        toast.error(t("error"), {
          description: t("updateFailed") || "Failed to update distributor"
        });
        return;
      }
      
      toast.success(t("success"), {
        description: t("distributorUpdated") || "Distributor updated successfully"
      });
      
      resetForm();
      setIsEditDialogOpen(false);
      setSelectedDistributor(null);
      await handleRefresh();
    } catch (err) {
      console.error("Error in handleEditDistributor:", err);
      toast.error(t("error"), {
        description: t("unexpectedError") || "An unexpected error occurred"
      });
    }
  };

  const handleDeleteDistributor = async (distributor: Distributor) => {
    try {
      // Update user to remove distributor role
      const { error: userError } = await supabase
        .from('users')
        .update({
          email_type: 'user',
          distributor_id: null
        })
        .eq('uid', distributor.uid);
        
      if (userError) {
        console.error("Error updating user:", userError);
        toast.error(t("error"), {
          description: t("userUpdateFailed") || "Failed to update user"
        });
        return;
      }
      
      // Delete distributor record
      const { error } = await supabase
        .from('distributors')
        .delete()
        .eq('id', distributor.id);
        
      if (error) {
        console.error("Error deleting distributor:", error);
        toast.error(t("error"), {
          description: t("deleteFailed") || "Failed to delete distributor"
        });
        return;
      }
      
      toast.success(t("success"), {
        description: t("distributorDeleted") || "Distributor deleted successfully"
      });
      
      await handleRefresh();
    } catch (err) {
      console.error("Error in handleDeleteDistributor:", err);
      toast.error(t("error"), {
        description: t("unexpectedError") || "An unexpected error occurred"
      });
    }
  };

  const handleAddCredits = async () => {
    try {
      if (!selectedDistributor) return;
      
      const amount = parseFloat(creditAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error(t("error"), {
          description: t("invalidAmount") || "Please enter a valid amount"
        });
        return;
      }
      
      // Call RPC function to update distributor balance
      const { error: balanceError } = await supabase.rpc('update_distributor_balance', {
        distributor_id: selectedDistributor.id,
        amount: amount
      });
      
      if (balanceError) {
        console.error("Error updating balance:", balanceError);
        toast.error(t("error"), {
          description: balanceError.message || t("balanceUpdateFailed") || "Failed to update balance"
        });
        return;
      }
      
      // Record the transaction
      const { error: transactionError } = await supabase
        .from('distributor_credits')
        .insert({
          distributor_id: selectedDistributor.id,
          amount: amount,
          operation_type: 'admin_credit',
          description: creditDescription || 'Added by admin'
        });
        
      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
      }
      
      toast.success(t("success"), {
        description: t("creditsAdded") || "Credits added successfully"
      });
      
      setCreditAmount("");
      setCreditDescription("");
      setIsAddCreditsDialogOpen(false);
      setSelectedDistributor(null);
      await handleRefresh();
    } catch (err) {
      console.error("Error in handleAddCredits:", err);
      toast.error(t("error"), {
        description: t("unexpectedError") || "An unexpected error occurred"
      });
    }
  };

  const handleOpenEditDialog = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setFormData({
      userId: "", // Not needed for edit
      commission_rate: distributor.commission_rate || "",
      credit_limit: distributor.credit_limit?.toString() || "",
      facebook: distributor.facebook || "",
      website: distributor.website || "",
      permissions: distributor.permissions || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenAddCreditsDialog = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setCreditAmount("");
    setCreditDescription("");
    setIsAddCreditsDialogOpen(true);
  };

  const filteredDistributors = distributors.filter(dist => {
    const searchLower = searchTerm.toLowerCase();
    return (
      dist.user_email?.toLowerCase().includes(searchLower) ||
      dist.user_name?.toLowerCase().includes(searchLower) ||
      dist.website?.toLowerCase().includes(searchLower) ||
      dist.facebook?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("distributors") || "Distributors"}</h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh")}
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("addDistributor") || "Add Distributor"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addDistributor") || "Add Distributor"}</DialogTitle>
                <DialogDescription>
                  {t("addDistributorDescription") || "Create a new distributor by selecting a user and configuring distributor settings."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">{t("selectUser") || "Select User"}</Label>
                  <select
                    id="userId"
                    name="userId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={formData.userId}
                    onChange={handleFormChange}
                  >
                    <option value="">{t("selectUser") || "Select a user"}</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">
                    {t("commissionRate") || "Commission Rate (%)"} *
                  </Label>
                  <Input
                    id="commission_rate"
                    name="commission_rate"
                    type="text"
                    placeholder="e.g., 10"
                    value={formData.commission_rate}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="credit_limit">
                    {t("creditLimit") || "Credit Limit"} *
                  </Label>
                  <Input
                    id="credit_limit"
                    name="credit_limit"
                    type="number"
                    placeholder="e.g., 1000"
                    value={formData.credit_limit}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebook">{t("facebook") || "Facebook"}</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    placeholder="Facebook profile or page"
                    value={formData.facebook}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">{t("website") || "Website"}</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="Website URL"
                    value={formData.website}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="permissions">{t("permissions") || "Permissions"}</Label>
                  <Textarea
                    id="permissions"
                    name="permissions"
                    placeholder="Additional permissions or notes"
                    value={formData.permissions}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleAddDistributor}>
                  {t("create") || "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchDistributors") || "Search distributors..."}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("distributors") || "Distributors"}</CardTitle>
          <CardDescription>
            {t("distributorsDescription") || "Manage distributors and their settings"}
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
                  <TableHead>{t("balance")}</TableHead>
                  <TableHead>{t("creditLimit")}</TableHead>
                  <TableHead>{t("commission")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistributors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="h-10 w-10 mb-2" />
                        <p>{t("noDistributorsFound") || "No distributors found"}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDistributors.map((distributor) => (
                    <TableRow key={distributor.id}>
                      <TableCell>{distributor.user_name || "-"}</TableCell>
                      <TableCell>{distributor.user_email || "-"}</TableCell>
                      <TableCell>{distributor.current_balance}</TableCell>
                      <TableCell>{distributor.credit_limit}</TableCell>
                      <TableCell>{distributor.commission_rate}%</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          distributor.status === 'active' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {distributor.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAddCreditsDialog(distributor)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            {t("addCredits")}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(distributor)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t("edit")}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                {t("delete")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("confirmDelete") || "Confirm Delete"}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("deleteDistributorConfirm") || "Are you sure you want to delete this distributor? This action cannot be undone."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteDistributor(distributor)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {t("delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Distributor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editDistributor") || "Edit Distributor"}</DialogTitle>
            <DialogDescription>
              {t("editDistributorDescription") || "Update distributor settings."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_commission_rate">
                {t("commissionRate") || "Commission Rate (%)"} *
              </Label>
              <Input
                id="edit_commission_rate"
                name="commission_rate"
                type="text"
                placeholder="e.g., 10"
                value={formData.commission_rate}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_credit_limit">
                {t("creditLimit") || "Credit Limit"} *
              </Label>
              <Input
                id="edit_credit_limit"
                name="credit_limit"
                type="number"
                placeholder="e.g., 1000"
                value={formData.credit_limit}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_facebook">{t("facebook") || "Facebook"}</Label>
              <Input
                id="edit_facebook"
                name="facebook"
                placeholder="Facebook profile or page"
                value={formData.facebook}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_website">{t("website") || "Website"}</Label>
              <Input
                id="edit_website"
                name="website"
                placeholder="Website URL"
                value={formData.website}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_permissions">{t("permissions") || "Permissions"}</Label>
              <Textarea
                id="edit_permissions"
                name="permissions"
                placeholder="Additional permissions or notes"
                value={formData.permissions}
                onChange={handleFormChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleEditDistributor}>
              {t("save") || "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Credits Dialog */}
      <Dialog open={isAddCreditsDialogOpen} onOpenChange={setIsAddCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addCredits") || "Add Credits"}</DialogTitle>
            <DialogDescription>
              {t("addCreditsDescription") || "Add credits to distributor's balance."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credit_amount">{t("amount") || "Amount"} *</Label>
              <Input
                id="credit_amount"
                type="number"
                placeholder="0.0"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="credit_description">{t("description") || "Description"}</Label>
              <Textarea
                id="credit_description"
                placeholder={t("creditDescription") || "Reason for adding credits"}
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddCreditsDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleAddCredits}>
              {t("add") || "Add Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Distributors;
