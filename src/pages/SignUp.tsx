
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase, createUserRecord } from "@/integrations/supabase/client";

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
      });
      return;
    }

    setLoading(true);

    try {
      // تسجيل المستخدم باستخدام Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || "حدث خطأ في إنشاء الحساب");
      }

      if (!data.user) {
        throw new Error("لم يتم إنشاء المستخدم");
      }

      // إنشاء سجل إضافي للمستخدم في جدول المستخدمين
      const today = new Date().toISOString().split('T')[0];
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // افتراضيًا شهر واحد
      
      await createUserRecord(data.user.id, {
        Name: email.split('@')[0], // اسم افتراضي
        Email: email,
        Password: password, // يجب تشفير كلمة المرور في الإنتاج
        Phone: "",
        Country: "",
        Activate: "Active",
        Block: "Not Blocked",
        Credits: "0.0",
        User_Type: "Monthly License",
        Email_Type: "User",
        Expiry_Time: expiryDate.toISOString().split('T')[0],
        Start_Date: today,
        Hwid: "Null",
        UID: data.user.id
      });

      // حفظ بيانات المستخدم في localStorage
      localStorage.setItem("userToken", data.session?.access_token || "");
      localStorage.setItem("userId", data.user.id);
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "جاري تحويلك للوحة التحكم...",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-right"
                dir="rtl"
              />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-right"
                dir="rtl"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
          </Button>
          <div className="text-center mt-4">
            <p>
              لديك حساب بالفعل؟{" "}
              <Button
                variant="link"
                className="p-0 mx-1"
                onClick={() => navigate("/login")}
              >
                تسجيل الدخول
              </Button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
