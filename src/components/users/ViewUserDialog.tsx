
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";

interface User {
  id: string;
  Name: string;
  Activate: string;
  Block: string;
  Country: string;
  Credits: string;
  Email: string;
  Email_Type: string;
  Expiry_Time: string;
  Hwid: string;
  Password: string;
  Phone: string;
  Start_Date: string;
  UID: string;
  User_Type: string;
}

interface ViewUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function ViewUserDialog({ isOpen, onClose, user }: ViewUserDialogProps) {
  const { t, isRTL } = useLanguage();
  
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir={isRTL ? "rtl" : "ltr"} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("userDetails") || "User Details"}</DialogTitle>
          <DialogDescription>
            {t("completeUserInfo") || "Complete user information"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">{t("name") || "Name"}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.Name}</p>
            </div>
            <div>
              <p className="font-semibold">{t("email") || "Email"}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.Email}</p>
            </div>
            <div>
              <p className="font-semibold">{t("phone") || "Phone"}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.Phone}</p>
            </div>
            <div>
              <p className="font-semibold">{t("country") || "Country"}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.Country}</p>
            </div>
            <div>
              <p className="font-semibold">{t("userType") || "User Type"}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.User_Type}</p>
            </div>
            <div>
              <p className="font-semibold">{t("credit") || "Credit"}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.Credits}</p>
            </div>
            <div>
              <p className="font-semibold">{t("status") || "Status"}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.Block}</p>
            </div>
            <div>
              <p className="font-semibold">{t("activation") || "Activation"}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.Activate}</p>
            </div>
            <div>
              <p className="font-semibold">{t("startDate") || "Start Date"}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.Start_Date}</p>
            </div>
            <div>
              <p className="font-semibold">{t("expiryDate") || "Expiry Date"}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.Expiry_Time}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
