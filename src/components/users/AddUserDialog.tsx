
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newUser: any) => void;
}

export function AddUserDialog({
  isOpen,
  onClose,
  onSave
}: AddUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credits, setCredits] = useState("0");
  const [userType, setUserType] = useState("Credits License");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("السعودية");
  const [subscriptionMonths, setSubscriptionMonths] = useState("3");
  const [showSubscriptionMonths, setShowSubscriptionMonths] = useState(false);
  const { t, isRTL } = useLanguage();

  const countries = ["السعودية", "الإمارات", "قطر", "الكويت", "البحرين", "عُمان", "مصر", "الأردن", "لبنان", "العراق", "سوريا", "فلسطين", "اليمن", "ليبيا", "تونس", "الجزائر", "المغرب", "السودان", "الصومال", "جيبوتي", "موريتانيا"];

  useEffect(() => {
    setShowSubscriptionMonths(userType === "Monthly License");
  }, [userType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Get current date
    const startDate = new Date().toISOString().split('T')[0];

    // تحديد Expiry_Time بمنهج شبيه بالكود المطلوب:
    let expiryDate: string;
    if (userType === "Credits License") {
      expiryDate = "Unlimited";
    } else {
      // نوع Monthly License
      const monthsMap: Record<string, number> = {
        "3": 3,
        "6": 6,
        "9": 9,
        "12": 12
      };
      const monthsToAdd = monthsMap[subscriptionMonths] || 3;
      const baseDate = new Date(startDate);
      baseDate.setMonth(baseDate.getMonth() + monthsToAdd);
      expiryDate = baseDate.toISOString().split('T')[0];
    }

    const formattedCredits = credits + ".0";
    const newUser = {
      Name: name,
      Email: email,
      Password: password,
      Credits: formattedCredits,
      User_Type: userType,
      Phone: phone,
      Country: country,
      Activate: "Activate",
      Block: "Not Blocked",
      Start_Date: startDate,
      Expiry_Time: expiryDate,
      Email_Type: "User",
      Hwid: "Null"
    };
    try {
      onSave(newUser);

      // Reset form fields
      setName("");
      setEmail("");
      setPassword("");
      setCredits("0");
      setUserType("Credits License");
      setPhone("");
      setCountry("السعودية");
      setSubscriptionMonths("3");
    } catch (error) {
      console.error("Error adding user:", error);
      toast(t("error") || "خطأ", {
        description: t("addUserError") || "فشل في إضافة المستخدم"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir={isRTL ? "rtl" : "ltr"} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addNewUser") || "إضافة مستخدم جديد"}</DialogTitle>
          <DialogDescription>
            {t("enterNewUserData") || "أدخل بيانات المستخدم الجديد"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("name") || "الاسم"}</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">{t("email") || "البريد الإلكتروني"}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">{t("password") || "كلمة المرور"}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="userType">{t("userType") || "نوع المستخدم"}</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger id="userType">
                  <SelectValue placeholder={t("selectUserType") || "اختر نوع المستخدم"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credits License">{t("creditsLicense") || "رخصة رصيد"}</SelectItem>
                  <SelectItem value="Monthly License">{t("monthlyLicense") || "رخصة شهرية"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {showSubscriptionMonths ? (
              <div className="grid gap-2">
                <Label htmlFor="subscriptionMonths">{t("subscriptionPeriod") || "مدة الاشتراك"}</Label>
                <Select value={subscriptionMonths} onValueChange={setSubscriptionMonths}>
                  <SelectTrigger id="subscriptionMonths">
                    <SelectValue placeholder={t("selectSubscriptionPeriod") || "اختر مدة الاشتراك"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">{t("threeMonths") || "3 أشهر"}</SelectItem>
                    <SelectItem value="6">{t("sixMonths") || "6 أشهر"}</SelectItem>
                    <SelectItem value="9">{t("nineMonths") || "9 أشهر"}</SelectItem>
                    <SelectItem value="12">{t("twelveMonths") || "12 أشهر"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="credits">{t("credit") || "الرصيد"}</Label>
                <Input id="credits" type="number" value={credits} onChange={e => setCredits(e.target.value)} required />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="phone">{t("phone") || "رقم الهاتف"}</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="country">{t("country") || "الدولة"}</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country">
                  <SelectValue placeholder={t("selectCountry") || "اختر الدولة"} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(countryName => (
                    <SelectItem key={countryName} value={countryName}>
                      {countryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button type="submit">
              {t("addUser") || "إضافة المستخدم"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
