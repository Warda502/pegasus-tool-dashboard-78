
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, RefreshCcw, Edit, CreditCard } from "lucide-react";

interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  credits: string;
  user_type: string;
  expiry_time: string;
  activate: string;
}

export default function DistributorUsers() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributorId, setDistributorId] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddCreditsDialogOpen, setIsAddCreditsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    credits: "0.0",
    user_type: "Monthly License",
    expiry_days: "30"
  });
  
  const [creditAmount, setCreditAmount] = useState("10");
  
  const fetchDistributorId = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_distributor_id');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setDistributorId(data);
        fetchDistributorBalance(data);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching distributor ID:", error);
      toast({
        title: t("error") || "خطأ",
        description: (error as Error).message,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const fetchDistributorBalance = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('distributors')
        .select('current_balance')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      setCurrentBalance(data?.current_balance || 0);
    } catch (error) {
      console.error("Error fetching distributor balance:", error);
    }
  };
  
  const fetchUsers = async (distributorId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('distributor_id', distributorId);
        
      if (error) {
        throw error;
      }
      
      setUsers(data as User[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: t("error") || "خطأ",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const init = async () => {
      const id = await fetchDistributorId();
      if (id) {
        fetchUsers(id);
      }
    };
    
    init();
  }, [user?.id]);
  
  const refreshData = async () => {
    if (distributorId) {
      fetchUsers(distributorId);
      fetchDistributorBalance(distributorId);
    } else {
      const id = await fetchDistributorId();
      if (id) {
        fetchUsers(id);
      }
    }
  };
  
  const handleAddUser = async () => {
    if (!distributorId) {
      toast({
        title: t("error") || "خطأ",
        description: t("distributorNotFound") || "لم يتم العثور على الموزع",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(newUser.expiry_days));
      const expiryTime = expiryDate.toISOString();
      
      // Create user in supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error(t("failedToCreateUser") || "فشل في إنشاء المستخدم");
      }
      
      // Create user in our users table
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          uid: authData.user.id,
          name: newUser.name,
          email: newUser.email,
          password: newUser.password, // Note: In a production app, never store plain passwords
          phone: newUser.phone,
          country: newUser.country,
          credits: newUser.credits,
          user_type: newUser.user_type,
          expiry_time: expiryTime,
          email_type: 'User',
          distributor_id: distributorId,
          start_date: new Date().toISOString(),
          activate: 'Active',
          block: 'Not Blocked'
        }]);
        
      if (userError) {
        throw userError;
      }
      
      toast({
        title: t("success") || "نجاح",
        description: t("userAddedSuccessfully") || "تم إضافة المستخدم بنجاح"
      });
      
      setIsAddDialogOpen(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        phone: "",
        country: "",
        credits: "0.0",
        user_type: "Monthly License",
        expiry_days: "30"
      });
      
      refreshData();
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: t("error") || "خطأ",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };
  
  const handleAddCredits = async () => {
    if (!selectedUser || !distributorId) return;
    
    try {
      const amount = parseFloat(creditAmount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error(t("invalidAmount") || "المبلغ غير صالح");
      }
      
      if (amount > currentBalance) {
        throw new Error(t("insufficientBalance") || "رصيد غير كاف");
      }
      
      // Update user credits
      const userCurrentCredits = parseFloat(selectedUser.credits || "0");
      const userNewCredits = userCurrentCredits + amount;
      
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ credits: userNewCredits.toString() })
        .eq('id', selectedUser.id);
        
      if (updateUserError) {
        throw updateUserError;
      }
      
      // Deduct credits from distributor balance
      const newDistributorBalance = currentBalance - amount;
      
      const { error: updateDistributorError } = await supabase
        .from('distributors')
        .update({ current_balance: newDistributorBalance })
        .eq('id', distributorId);
        
      if (updateDistributorError) {
        throw updateDistributorError;
      }
      
      // Log the transaction
      const { error: logError } = await supabase
        .from('distributor_credits')
        .insert([{
          distributor_id: distributorId,
          amount: -amount, // Negative amount for credits given to users
          operation_type: 'assign',
          description: `Credits added to user ${selectedUser.email}`
        }]);
        
      if (logError) {
        throw logError;
      }
      
      toast({
        title: t("success") || "نجاح",
        description: `${amount} ${t("creditsAddedToUser") || "تم إضافة رصيد للمستخدم"}`
      });
      
      setIsAddCreditsDialogOpen(false);
      setCreditAmount("10");
      setSelectedUser(null);
      
      refreshData();
    } catch (error) {
      console.error("Error adding credits:", error);
      toast({
        title: t("error") || "خطأ",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("distributorUsers") || "مستخدمي الموزع"}
        </h1>
        
        <div className="flex items-center gap-2">
          <div className="text-sm mr-4">
            <span className="font-medium">{t("balance") || "الرصيد"}:</span> {currentBalance}
          </div>
          
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {t("refresh") || "تحديث"}
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t("addUser") || "إضافة مستخدم"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addUser") || "إضافة مستخدم"}</DialogTitle>
                <DialogDescription>
                  {t("addUserDesc") || "أضف مستخدم جديد للنظام"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="col-span-1">
                    {t("name") || "الاسم"}
                  </Label>
                  <Input 
                    id="name" 
                    className="col-span-3" 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="col-span-1">
                    {t("email") || "البريد الإلكتروني"}
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    className="col-span-3"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="col-span-1">
                    {t("password") || "كلمة المرور"}
                  </Label>
                  <Input 
                    id="password" 
                    type="password"
                    className="col-span-3"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="col-span-1">
                    {t("phone") || "الهاتف"}
                  </Label>
                  <Input 
                    id="phone" 
                    className="col-span-3"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="country" className="col-span-1">
                    {t("country") || "الدولة"}
                  </Label>
                  <Input 
                    id="country" 
                    className="col-span-3"
                    value={newUser.country}
                    onChange={(e) => setNewUser({...newUser, country: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="credits" className="col-span-1">
                    {t("credits") || "الرصيد"}
                  </Label>
                  <Input 
                    id="credits" 
                    type="number"
                    className="col-span-3"
                    value={newUser.credits}
                    onChange={(e) => setNewUser({...newUser, credits: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiryDays" className="col-span-1">
                    {t("expiryDays") || "مدة الاشتراك (أيام)"}
                  </Label>
                  <Input 
                    id="expiryDays" 
                    type="number"
                    className="col-span-3"
                    value={newUser.expiry_days}
                    onChange={(e) => setNewUser({...newUser, expiry_days: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="userType" className="col-span-1">
                    {t("userType") || "نوع المستخدم"}
                  </Label>
                  <select 
                    id="userType"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={newUser.user_type}
                    onChange={(e) => setNewUser({...newUser, user_type: e.target.value})}
                  >
                    <option value="Monthly License">{t("monthlyLicense") || "اشتراك شهري"}</option>
                    <option value="Annual License">{t("annualLicense") || "اشتراك سنوي"}</option>
                    <option value="Lifetime">{t("lifetime") || "مدى الحياة"}</option>
                  </select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t("cancel") || "إلغاء"}
                </Button>
                <Button onClick={handleAddUser}>
                  {t("add") || "إضافة"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("usersList") || "قائمة المستخدمين"}</CardTitle>
          <CardDescription>
            {t("usersListDesc") || "عرض وإدارة المستخدمين التابعين لك"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name") || "الاسم"}</TableHead>
                <TableHead>{t("email") || "البريد الإلكتروني"}</TableHead>
                <TableHead>{t("credits") || "الرصيد"}</TableHead>
                <TableHead>{t("userType") || "نوع المستخدم"}</TableHead>
                <TableHead>{t("expiryDate") || "تاريخ الانتهاء"}</TableHead>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    {t("noUsers") || "لا يوجد مستخدمين"}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  // Format expiry date
                  const expiryDate = user.expiry_time 
                    ? new Date(user.expiry_time).toLocaleDateString() 
                    : t("notSet") || "غير محدد";
                  
                  // Check if expired
                  const isExpired = user.expiry_time 
                    ? new Date(user.expiry_time) < new Date() 
                    : false;
                    
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || "-"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.credits || "0"}</TableCell>
                      <TableCell>{user.user_type || "-"}</TableCell>
                      <TableCell>
                        <span className={isExpired ? "text-red-500" : ""}>
                          {expiryDate}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.activate === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.activate === 'Active' 
                            ? (t("active") || "نشط") 
                            : (t("inactive") || "غير نشط")
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsAddCreditsDialogOpen(true);
                            }}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Credits Dialog */}
      <Dialog open={isAddCreditsDialogOpen} onOpenChange={setIsAddCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("addCredits") || "إضافة رصيد"} - {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              {t("addCreditsDesc") || "إضافة رصيد للمستخدم"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-credits" className="col-span-1">
                {t("currentCredits") || "الرصيد الحالي"}
              </Label>
              <Input 
                id="current-credits"
                value={selectedUser?.credits || "0"}
                disabled
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-amount" className="col-span-1">
                {t("amount") || "المبلغ"}
              </Label>
              <Input 
                id="add-amount"
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-sm text-yellow-700">
                {t("currentDistributorBalance") || "رصيد الموزع الحالي"}: {currentBalance}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCreditsDialogOpen(false)}>
              {t("cancel") || "إلغاء"}
            </Button>
            <Button onClick={handleAddCredits}>
              {t("add") || "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
