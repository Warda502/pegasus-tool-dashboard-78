
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, RefreshCcw } from "lucide-react";

interface Distributor {
  id: string;
  uid: string;
  name?: string;
  email?: string;
  current_balance: number;
  credit_limit: number;
  status: string;
  commission_rate?: string;
  created_at: string;
}

export default function Distributors() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    commission_rate: "10",
    credit_limit: "1000"
  });
  
  const fetchDistributors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('distributors')
        .select(`
          id,
          uid,
          current_balance,
          credit_limit,
          status,
          commission_rate,
          created_at,
          users!distributors_uid_fkey (name, email)
        `);
      
      if (error) {
        throw error;
      }
      
      const formattedData = data.map(distributor => ({
        id: distributor.id,
        uid: distributor.uid,
        name: distributor.users?.[0]?.name || "N/A",
        email: distributor.users?.[0]?.email || "N/A",
        current_balance: distributor.current_balance || 0,
        credit_limit: distributor.credit_limit || 0,
        status: distributor.status || "active",
        commission_rate: distributor.commission_rate || "0%",
        created_at: new Date(distributor.created_at).toLocaleDateString()
      }));
      
      setDistributors(formattedData);
    } catch (error) {
      console.error('Error fetching distributors:', error);
      toast({
        title: t("errorFetchingDistributors") || "خطأ في جلب الموزعين",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDistributors();
  }, []);
  
  const handleAddDistributor = async () => {
    try {
      // First check if the user exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, uid')
        .eq('email', formData.email)
        .single();
        
      if (userError) {
        throw new Error(t("userNotFound") || "المستخدم غير موجود");
      }
      
      // Now add the distributor record
      const { data: distributorData, error: distributorError } = await supabase
        .from('distributors')
        .insert([{
          uid: userData.uid,
          commission_rate: formData.commission_rate,
          credit_limit: parseFloat(formData.credit_limit),
          current_balance: 0,
          status: 'active'
        }])
        .select();
        
      if (distributorError) {
        throw distributorError;
      }
      
      // Update user type to distributor
      const { error: updateError } = await supabase
        .from('users')
        .update({ email_type: 'Distributor' })
        .eq('id', userData.id);
        
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: t("distributorAdded") || "تم إضافة الموزع",
        description: t("distributorAddedSuccess") || "تم إضافة الموزع بنجاح"
      });
      
      setIsAddDialogOpen(false);
      setFormData({
        email: "",
        name: "",
        commission_rate: "10",
        credit_limit: "1000"
      });
      
      fetchDistributors();
    } catch (error) {
      console.error('Error adding distributor:', error);
      toast({
        title: t("errorAddingDistributor") || "خطأ في إضافة الموزع",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };
  
  const handleEditDistributor = async () => {
    if (!selectedDistributor) return;
    
    try {
      const { error } = await supabase
        .from('distributors')
        .update({
          commission_rate: formData.commission_rate,
          credit_limit: parseFloat(formData.credit_limit),
          status: selectedDistributor.status
        })
        .eq('id', selectedDistributor.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: t("distributorUpdated") || "تم تحديث الموزع",
        description: t("distributorUpdatedSuccess") || "تم تحديث بيانات الموزع بنجاح"
      });
      
      setIsEditDialogOpen(false);
      setSelectedDistributor(null);
      
      fetchDistributors();
    } catch (error) {
      console.error('Error updating distributor:', error);
      toast({
        title: t("errorUpdatingDistributor") || "خطأ في تحديث الموزع",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };
  
  const handleAddCredit = async (distributorId: string, amount: number) => {
    try {
      // Add credit to distributor balance
      const { data: distributor, error: fetchError } = await supabase
        .from('distributors')
        .select('current_balance')
        .eq('id', distributorId)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      const newBalance = (distributor.current_balance || 0) + amount;
      
      const { error: updateError } = await supabase
        .from('distributors')
        .update({ current_balance: newBalance })
        .eq('id', distributorId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Log the transaction
      const { error: logError } = await supabase
        .from('distributor_credits')
        .insert([{
          distributor_id: distributorId,
          amount: amount,
          operation_type: 'add',
          description: 'Credit added by admin'
        }]);
        
      if (logError) {
        throw logError;
      }
      
      toast({
        title: t("creditAdded") || "تم إضافة الرصيد",
        description: `${amount} ${t("creditsAddedToDistributor") || "تم إضافة رصيد للموزع"}`
      });
      
      fetchDistributors();
    } catch (error) {
      console.error('Error adding credit:', error);
      toast({
        title: t("errorAddingCredit") || "خطأ في إضافة الرصيد",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("distributorsManagement") || "إدارة الموزعين"}
        </h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDistributors}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {t("refresh") || "تحديث"}
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t("addDistributor") || "إضافة موزع"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addDistributor") || "إضافة موزع"}</DialogTitle>
                <DialogDescription>
                  {t("addDistributorDesc") || "أضف مستخدم كموزع في النظام"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="col-span-1">
                    {t("email") || "البريد الإلكتروني"}
                  </Label>
                  <Input 
                    id="email" 
                    className="col-span-3" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="commission" className="col-span-1">
                    {t("commissionRate") || "نسبة العمولة"}
                  </Label>
                  <Input 
                    id="commission" 
                    className="col-span-3"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({...formData, commission_rate: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="creditLimit" className="col-span-1">
                    {t("creditLimit") || "حد الائتمان"}
                  </Label>
                  <Input 
                    id="creditLimit" 
                    type="number"
                    className="col-span-3"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t("cancel") || "إلغاء"}
                </Button>
                <Button onClick={handleAddDistributor}>
                  {t("add") || "إضافة"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("distributorsList") || "قائمة الموزعين"}</CardTitle>
          <CardDescription>
            {t("distributorsListDesc") || "عرض وإدارة الموزعين في النظام"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>{t("distributorsListCaption") || "قائمة بجميع الموزعين المسجلين"}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name") || "الاسم"}</TableHead>
                <TableHead>{t("email") || "البريد الإلكتروني"}</TableHead>
                <TableHead>{t("balance") || "الرصيد"}</TableHead>
                <TableHead>{t("creditLimit") || "حد الائتمان"}</TableHead>
                <TableHead>{t("commission") || "العمولة"}</TableHead>
                <TableHead>{t("status") || "الحالة"}</TableHead>
                <TableHead>{t("actions") || "الإجراءات"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    {t("loading") || "جاري التحميل..."}
                  </TableCell>
                </TableRow>
              ) : distributors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    {t("noDistributors") || "لا يوجد موزعين مسجلين"}
                  </TableCell>
                </TableRow>
              ) : (
                distributors.map((distributor) => (
                  <TableRow key={distributor.id}>
                    <TableCell className="font-medium">{distributor.name}</TableCell>
                    <TableCell>{distributor.email}</TableCell>
                    <TableCell>{distributor.current_balance}</TableCell>
                    <TableCell>{distributor.credit_limit}</TableCell>
                    <TableCell>{distributor.commission_rate}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        distributor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {distributor.status === 'active' ? 
                          (t("active") || "نشط") : 
                          (t("inactive") || "غير نشط")
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedDistributor(distributor);
                            setFormData({
                              ...formData,
                              name: distributor.name || "",
                              email: distributor.email || "",
                              commission_rate: distributor.commission_rate || "0",
                              credit_limit: distributor.credit_limit.toString()
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddCredit(distributor.id, 100)}
                        >
                          +100
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddCredit(distributor.id, 500)}
                        >
                          +500
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Distributor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editDistributor") || "تعديل الموزع"}</DialogTitle>
            <DialogDescription>
              {t("editDistributorDesc") || "تعديل بيانات الموزع"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="col-span-1">
                {t("name") || "الاسم"}
              </Label>
              <Input 
                id="edit-name" 
                className="col-span-3" 
                value={formData.name}
                disabled
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="col-span-1">
                {t("email") || "البريد الإلكتروني"}
              </Label>
              <Input 
                id="edit-email" 
                className="col-span-3"
                value={formData.email}
                disabled
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-commission" className="col-span-1">
                {t("commissionRate") || "نسبة العمولة"}
              </Label>
              <Input 
                id="edit-commission" 
                className="col-span-3"
                value={formData.commission_rate}
                onChange={(e) => setFormData({...formData, commission_rate: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-creditLimit" className="col-span-1">
                {t("creditLimit") || "حد الائتمان"}
              </Label>
              <Input 
                id="edit-creditLimit" 
                type="number"
                className="col-span-3"
                value={formData.credit_limit}
                onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="col-span-1">
                {t("status") || "الحالة"}
              </Label>
              <select 
                id="edit-status"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedDistributor?.status || 'active'}
                onChange={(e) => setSelectedDistributor(prev => prev ? {...prev, status: e.target.value} : null)}
              >
                <option value="active">{t("active") || "نشط"}</option>
                <option value="inactive">{t("inactive") || "غير نشط"}</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel") || "إلغاء"}
            </Button>
            <Button onClick={handleEditDistributor}>
              {t("save") || "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
