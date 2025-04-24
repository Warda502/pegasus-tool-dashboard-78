
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";

interface RenewUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (months: string) => void;
  userType: string;
}

export function RenewUserDialog({ isOpen, onClose, onConfirm, userType }: RenewUserDialogProps) {
  const [months, setMonths] = useState("3");
  const { t, isRTL } = useLanguage();
  
  const handleConfirm = () => {
    onConfirm(months);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("renewUser") || "تجديد حساب المستخدم"}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("chooseRenewalMonths") || "اختر عدد الأشهر لتجديد الحساب"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="months" className="block mb-2">{t("numberOfMonths") || "عدد الأشهر"}</Label>
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectMonths") || "اختر عدد الأشهر"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">{t("threeMonths") || "3 أشهر"}</SelectItem>
              <SelectItem value="6">{t("sixMonths") || "6 أشهر"}</SelectItem>
              <SelectItem value="9">{t("nineMonths") || "9 أشهر"}</SelectItem>
              <SelectItem value="12">{t("twelveMonths") || "12 أشهر"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel") || "إلغاء"}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>{t("renew") || "تجديد"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
