
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface User {
  id: string;
  Name?: string;
  Email?: string;
  Password?: string;
  Phone?: string;
  Country?: string;
  Activate?: string;
  Block?: string;
  // Supabase schema properties
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  country?: string;
  activate?: string;
  block?: string;
  [key: string]: any;
}

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updatedUser: User) => void;
}

export function EditUserDialog({
  isOpen,
  onClose,
  user,
  onSave
}: EditUserDialogProps) {
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const { t, isRTL } = useLanguage();
  
  useEffect(() => {
    if (user) {
      // Create a merged user object with compatibility for both data structures
      const mergedUser = {
        ...user,
        Name: user.Name || user.name,
        Email: user.Email || user.email,
        Password: user.Password || user.password,
        Phone: user.Phone || user.phone,
        Country: user.Country || user.country,
        Activate: user.Activate || user.activate,
        Block: user.Block || user.block,
      };
      
      setEditedUser(mergedUser);
    }
  }, [user]);

  if (!editedUser) return null;
  
  const handleChange = (field: string, value: string) => {
    setEditedUser(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };
  
  const handleCheckboxChange = (field: string, checked: boolean) => {
    if (field === "Activate") {
      handleChange(field, checked ? "Activate" : "Not Activate");
    } else if (field === "Block") {
      handleChange(field, checked ? "Blocked" : "Not Blocked");
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedUser) return;
    try {
      // Update both legacy and new fields
      const updatedUser = {
        ...editedUser,
        // Update Supabase fields as well
        name: editedUser.Name,
        email: editedUser.Email,
        password: editedUser.Password,
        phone: editedUser.Phone,
        country: editedUser.Country,
        activate: editedUser.Activate,
        block: editedUser.Block,
      };
      
      onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      toast(t("error") || "خطأ", {
        description: t("updateUserError") || "فشل في حفظ بيانات المستخدم"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir={isRTL ? "rtl" : "ltr"} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("editUser") || "تعديل المستخدم"}</DialogTitle>
          <DialogDescription>
            {t("editUserDescription") || "قم بتعديل بيانات المستخدم"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("name") || "الاسم"}</Label>
              <Input id="name" value={editedUser.Name || ""} onChange={e => handleChange("Name", e.target.value)} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">{t("email") || "البريد الإلكتروني"}</Label>
              <Input id="email" type="email" value={editedUser.Email || ""} onChange={e => handleChange("Email", e.target.value)} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">{t("password") || "كلمة المرور"}</Label>
              <Input id="password" type="password" value={editedUser.Password || ""} onChange={e => handleChange("Password", e.target.value)} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">{t("phone") || "رقم الهاتف"}</Label>
              <Input id="phone" value={editedUser.Phone || ""} onChange={e => handleChange("Phone", e.target.value)} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="country">{t("country") || "الدولة"}</Label>
              <Input id="country" value={editedUser.Country || ""} onChange={e => handleChange("Country", e.target.value)} />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="activate" checked={editedUser.Activate === "Activate"} onCheckedChange={checked => handleCheckboxChange("Activate", Boolean(checked))} />
                <Label htmlFor="activate">{t("activate") || "تفعيل"}</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox id="block" checked={editedUser.Block === "Blocked"} onCheckedChange={checked => handleCheckboxChange("Block", Boolean(checked))} />
                <Label htmlFor="block">{t("block") || "حظر"}</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button type="submit">
              {t("saveChanges") || "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
