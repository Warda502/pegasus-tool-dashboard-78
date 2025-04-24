
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
  Name?: string;
  Email?: string;
  Password?: string;
  Phone?: string;
  Country?: string;
  Activate?: string;
  Block?: string;
  Credits?: string;
  User_Type?: string;
  Email_Type?: string;
  Expiry_Time?: string;
  Start_Date?: string;
  Hwid?: string;
  UID?: string;
  // Supabase schema properties
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  country?: string;
  activate?: string;
  block?: string;
  credits?: string;
  user_type?: string;
  email_type?: string;
  expiry_time?: string;
  start_date?: string;
  hwid?: string;
  uid?: string;
}

interface ViewUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function ViewUserDialog({ isOpen, onClose, user }: ViewUserDialogProps) {
  const { t, isRTL } = useLanguage();
  
  if (!user) return null;

  // Helper function to get the value from either the legacy or new property
  const getValue = (legacyProp: string, newProp: string) => {
    return user[legacyProp] !== undefined ? user[legacyProp] : user[newProp];
  };

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
              <p className="text-sm text-muted-foreground mt-1">{getValue("Name", "name")}</p>
            </div>
            <div>
              <p className="font-semibold">{t("email") || "Email"}</p>
              <p className="text-sm text-muted-foreground mt-1">{getValue("Email", "email")}</p>
            </div>
            <div>
              <p className="font-semibold">{t("phone") || "Phone"}</p>
              <p className="text-sm text-muted-foreground mt-1">{getValue("Phone", "phone")}</p>
            </div>
            <div>
              <p className="font-semibold">{t("country") || "Country"}</p>
              <p className="text-sm text-muted-foreground mt-1">{getValue("Country", "country")}</p>
            </div>
            <div>
              <p className="font-semibold">{t("userType") || "User Type"}</p>
              <p className="text-sm text-muted-foreground mt-1">{getValue("User_Type", "user_type")}</p>
            </div>
            <div>
              <p className="font-semibold">{t("credit") || "Credit"}</p>
              <p className="text-sm text-muted-foreground mt-1">{getValue("Credits", "credits")}</p>
            </div>
            <div>
              <p className="font-semibold">{t("status") || "Status"}</p>
              <p className="text-sm text-muted-foreground mt-1">{getValue("Block", "block")}</p>
            </div>
            <div>
              <p className="font-semibold">{t("activation") || "Activation"}</p>
              <p className="text-sm text-muted-foreground mt-1">{getValue("Activate", "activate")}</p>
            </div>
            <div>
              <p className="font-semibold">{t("startDate") || "Start Date"}</p>
              <p className="text-sm text-muted-foreground mt-1">{getValue("Start_Date", "start_date")}</p>
            </div>
            <div>
              <p className="font-semibold">{t("expiryDate") || "Expiry Date"}</p>
              <p className="text-sm text-muted-foreground mt-1">{getValue("Expiry_Time", "expiry_time")}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
