
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Plus, RefreshCw, Pencil, Trash2, Users } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";

interface Distributor {
  id: string;
  uid: string;
  name?: string;
  email?: string;
  credit_limit: number;
  current_balance: number;
  commission_rate?: string;
  status?: string;
  created_at?: string;
}

export default function Distributors() {
  const { t, isRTL } = useLanguage();
  const { isAdmin } = useAuth();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    creditLimit: "1000",
    commissionRate: "10",
    password: ""
  });
  
  // Load distributors
  const loadDistributors = async () => {
    try {
      setLoading(true);
      
      // Get distributors with their user information
      const { data, error } = await supabase
        .from('distributors')
        .select(`
          id, 
          uid, 
          credit_limit, 
          current_balance, 
          commission_rate, 
          status, 
          created_at,
          website,
          facebook
        `);

      if (error) {
        throw error;
      }

      // Get user data for each distributor
      const distributorsWithUserData = await Promise.all(
        data.map(async (distributor) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name, email')
            .eq('uid', distributor.uid)
            .single();

          if (userError) {
            console.error(`Error fetching user data for distributor ${distributor.id}:`, userError);
            return {
              ...distributor,
              name: 'Unknown',
              email: 'Unknown'
            };
          }

          return {
            ...distributor,
            name: userData?.name || 'Unknown',
            email: userData?.email || 'Unknown'
          };
        })
      );

      setDistributors(distributorsWithUserData);
    } catch (error) {
      console.error("Error loading distributors:", error);
      toast(t("error") || "خطأ", {
        description: t("failedToLoadDistributors") || "فشل تحميل بيانات الموزعين"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAdmin) {
      loadDistributors();
    }
  }, [isAdmin]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      creditLimit: "1000",
      commissionRate: "10",
      password: ""
    });
  };
  
  const handleAddDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          name: formData.name
        }
      });
      
      if (authError) {
        throw new Error(authError.message);
      }
      
      if (!authData.user) {
        throw new Error("Failed to create auth user");
      }
      
      const userId = authData.user.id;
      
      // 2. Create distributor in distributors table
      const { data: distributorData, error: distributorError } = await supabase
        .from('distributors')
        .insert({
          uid: userId,
          credit_limit: parseFloat(formData.creditLimit),
          current_balance: 0,
          commission_rate: formData.commissionRate,
          status: 'active'
        })
        .select('id')
        .single();
      
      if (distributorError) {
        // Try to clean up auth user on failure
        await supabase.auth.admin.deleteUser(userId);
        throw new Error(`Failed to create distributor: ${distributorError.message}`);
      }
      
      // 3. Create user in users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          uid: userId,
          email: formData.email,
          password: formData.password, // Store for legacy compatibility
          name: formData.name,
          email_type: 'Distributor',
          user_type: 'Distributor',
          activate: 'Active',
          block: 'Not Blocked',
          credits: '0.0',
          start_date: new Date().toISOString().split('T')[0],
          hwid: 'Null'
        });
      
      if (userError) {
        // Clean up on failure
        await supabase.from('distributors').delete().eq('id', distributorData.id);
        await supabase.auth.admin.deleteUser(userId);
        throw new Error(`Failed to create user record: ${userError.message}`);
      }
      
      toast(t("success") || "نجاح", {
        description: t("distributorAdded") || "تمت إضافة الموزع بنجاح"
      });
      
      setIsAddDialogOpen(false);
      resetForm();
      loadDistributors();
      
    } catch (error) {
      console.error("Error adding distributor:", error);
      toast(t("error") || "خطأ", {
        description: error instanceof Error ? error.message : "Failed to add distributor"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditDistributor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDistributor) return;
    
    try {
      setLoading(true);
      
      // Update distributor info
      const { error: distributorError } = await supabase
        .from('distributors')
        .update({
          credit_limit: parseFloat(formData.creditLimit),
          commission_rate: formData.commissionRate
        })
        .eq('id', selectedDistributor.id);
      
      if (distributorError) {
        throw new Error(`Failed to update distributor: ${distributorError.message}`);
      }
      
      // Update user info
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name
        })
        .eq('uid', selectedDistributor.uid);
      
      if (userError) {
        throw new Error(`Failed to update user record: ${userError.message}`);
      }
      
      toast(t("success") || "نجاح", {
        description: t("distributorUpdated") || "تم تحديث بيانات الموزع بنجاح"
      });
      
      setIsEditDialogOpen(false);
      resetForm();
      loadDistributors();
      
    } catch (error) {
      console.error("Error updating distributor:", error);
      toast(t("error") || "خطأ", {
        description: error instanceof Error ? error.message : "Failed to update distributor"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteDistributor = async (distributor: Distributor) => {
    if (!window.confirm(t("confirmDeleteDistributor") || "هل أنت متأكد من رغبتك في حذف هذا الموزع؟")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // 1. Delete from distributors table
      const { error: distributorError } = await supabase
        .from('distributors')
        .delete()
        .eq('id', distributor.id);
      
      if (distributorError) {
        throw new Error(`Failed to delete distributor: ${distributorError.message}`);
      }
      
      // 2. Delete from auth
      const { error: authError } = await supabase
        .rpc('delete_auth_user', { user_id: distributor.uid });
      
      if (authError) {
        console.error("Error deleting auth user:", authError);
        // Non-critical, continue
      }
      
      // 3. Delete from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', distributor.uid);
      
      if (userError) {
        console.error("Error deleting user record:", userError);
        // Non-critical, continue
      }
      
      toast(t("success") || "نجاح", {
        description: t("distributorDeleted") || "تم حذف الموزع بنجاح"
      });
      
      loadDistributors();
      
    } catch (error) {
      console.error("Error deleting distributor:", error);
      toast(t("error") || "خطأ", {
        description: error instanceof Error ? error.message : "Failed to delete distributor"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const openEditDialog = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setFormData({
      email: distributor.email || "",
      name: distributor.name || "",
      creditLimit: distributor.credit_limit.toString(),
      commissionRate: distributor.commission_rate || "10",
      password: "" // We don't set password for edit
    });
    setIsEditDialogOpen(true);
  };
  
  const addCreditsToDistributor = async (distributor: Distributor) => {
    const amount = prompt(
      t("enterCreditsAmount") || "أدخل كمية الرصيد المراد إضافتها:",
      "100"
    );
    
    if (!amount) return;
    
    const creditsToAdd = parseFloat(amount);
    
    if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
      toast(t("error") || "خطأ", {
        description: t("invalidAmount") || "كمية غير صالحة"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Get current balance
      const { data: currentData, error: fetchError } = await supabase
        .from('distributors')
        .select('current_balance')
        .eq('id', distributor.id)
        .single();
      
      if (fetchError) {
        throw new Error("Failed to fetch current balance");
      }
      
      const currentBalance = parseFloat(currentData.current_balance || "0");
      const newBalance = currentBalance + creditsToAdd;
      
      // Update distributor balance
      const { error: updateError } = await supabase
        .from('distributors')
        .update({ current_balance: newBalance })
        .eq('id', distributor.id);
      
      if (updateError) {
        throw new Error("Failed to update balance");
      }
      
      // Record the transaction
      const { error: transactionError } = await supabase
        .from('distributor_credits')
        .insert({
          distributor_id: distributor.id,
          amount: creditsToAdd,
          operation_type: 'add',
          description: 'Credits added by admin',
          admin_id: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
        // Non-critical, continue
      }
      
      toast(t("success") || "نجاح", {
        description: t("creditsAddedToDistributor") || "تمت إضافة الرصيد للموزع بنجاح"
      });
      
      loadDistributors();
      
    } catch (error) {
      console.error("Error adding credits to distributor:", error);
      toast(t("error") || "خطأ", {
        description: error instanceof Error ? error.message : "Failed to add credits"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{t("distributors") || "الموزعون"}</span>
            </CardTitle>
            <CardDescription>
              {t("distributorsDescription") || "إدارة الموزعين واعتماداتهم"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadDistributors()}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("refresh") || "تحديث"}
            </Button>
            <Button 
              size="sm" 
              onClick={() => setIsAddDialogOpen(true)}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("addDistributor") || "إضافة موزع"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name") || "الاسم"}</TableHead>
                  <TableHead>{t("email") || "البريد الإلكتروني"}</TableHead>
                  <TableHead>{t("creditLimit") || "حد الائتمان"}</TableHead>
                  <TableHead>{t("balance") || "الرصيد"}</TableHead>
                  <TableHead>{t("commission") || "العمولة"}</TableHead>
                  <TableHead>{t("status") || "الحالة"}</TableHead>
                  <TableHead>{t("actions") || "الإجراءات"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : distributors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      {t("noDistributorsFound") || "لم يتم العثور على موزعين"}
                    </TableCell>
                  </TableRow>
                ) : (
                  distributors.map((distributor) => (
                    <TableRow key={distributor.id}>
                      <TableCell className="font-medium">{distributor.name}</TableCell>
                      <TableCell>{distributor.email}</TableCell>
                      <TableCell>{distributor.credit_limit?.toString()}</TableCell>
                      <TableCell>{distributor.current_balance?.toString()}</TableCell>
                      <TableCell>{distributor.commission_rate || "-"}%</TableCell>
                      <TableCell>{distributor.status}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(distributor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => addCreditsToDistributor(distributor)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteDistributor(distributor)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Distributor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addDistributor") || "إضافة موزع"}</DialogTitle>
            <DialogDescription>
              {t("addDistributorDescription") || "أدخل بيانات الموزع الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDistributor}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("name") || "الاسم"}</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email") || "البريد الإلكتروني"}</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t("password") || "كلمة المرور"}</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creditLimit">{t("creditLimit") || "حد الائتمان"}</Label>
                <Input 
                  id="creditLimit" 
                  name="creditLimit" 
                  type="number" 
                  required 
                  value={formData.creditLimit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="commissionRate">{t("commissionRate") || "نسبة العمولة"}</Label>
                <Input 
                  id="commissionRate" 
                  name="commissionRate" 
                  type="number" 
                  required 
                  value={formData.commissionRate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t("cancel") || "إلغاء"}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t("add") || "إضافة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Distributor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editDistributor") || "تعديل الموزع"}</DialogTitle>
            <DialogDescription>
              {t("editDistributorDescription") || "تعديل بيانات الموزع"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDistributor}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("name") || "الاسم"}</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email") || "البريد الإلكتروني"}</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email}
                  disabled // Email can't be changed
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creditLimit">{t("creditLimit") || "حد الائتمان"}</Label>
                <Input 
                  id="creditLimit" 
                  name="creditLimit" 
                  type="number" 
                  required 
                  value={formData.creditLimit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="commissionRate">{t("commissionRate") || "نسبة العمولة"}</Label>
                <Input 
                  id="commissionRate" 
                  name="commissionRate" 
                  type="number" 
                  required 
                  value={formData.commissionRate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t("cancel") || "إلغاء"}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t("save") || "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
