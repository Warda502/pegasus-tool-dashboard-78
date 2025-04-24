
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  Name: string;
  Email: string;
  Password: string;
  Phone: string;
  Country: string;
  Activate: string;
  Block: string;
}

export default function UserEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }
    
    fetchUser(token);
  }, [userId, navigate]);

  const fetchUser = async (idToken: string) => {
    try {
      const response = await fetch(
        `https://pegasus-tool-database-default-rtdb.firebaseio.com/users/${userId}.json?auth=${idToken}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      const data = await response.json();
      if (data) {
        setUser({ id: userId, ...data });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في جلب بيانات المستخدم",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");
    if (!token || !user) return;

    try {
      const response = await fetch(
        `https://pegasus-tool-database-default-rtdb.firebaseio.com/users/${userId}.json?auth=${token}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            Name: user.Name,
            Email: user.Email,
            Password: user.Password,
            Phone: user.Phone,
            Country: user.Country,
            Activate: user.Activate,
            Block: user.Block,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });
      
      navigate("/users-manager");
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث بيانات المستخدم",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (!user) {
    return <div className="text-center py-8">لم يتم العثور على المستخدم</div>;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate("/users-manager")} className="ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">تعديل المستخدم</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-lg p-6">
          <div>
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              value={user.Name}
              onChange={(e) => setUser({ ...user, Name: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={user.Email}
              onChange={(e) => setUser({ ...user, Email: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={user.Password}
              onChange={(e) => setUser({ ...user, Password: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={user.Phone}
              onChange={(e) => setUser({ ...user, Phone: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="country">الدولة</Label>
            <Input
              id="country"
              value={user.Country}
              onChange={(e) => setUser({ ...user, Country: e.target.value })}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="activate"
                checked={user.Activate === "Activate"}
                onCheckedChange={(checked) =>
                  setUser({ ...user, Activate: checked ? "Activate" : "Not Activate" })
                }
              />
              <Label htmlFor="activate">تفعيل</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="block"
                checked={user.Block === "Blocked"}
                onCheckedChange={(checked) =>
                  setUser({ ...user, Block: checked ? "Blocked" : "Not Blocked" })
                }
              />
              <Label htmlFor="block">حظر</Label>
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            حفظ التغييرات
          </Button>
        </form>
      </main>
    </div>
  );
}
