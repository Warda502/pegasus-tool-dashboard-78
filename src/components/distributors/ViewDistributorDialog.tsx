
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";
import { Distributor } from "@/hooks/data/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ViewDistributorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  distributor: Distributor | null;
}

export function ViewDistributorDialog({ 
  isOpen, 
  onClose, 
  distributor 
}: ViewDistributorDialogProps) {
  const { t } = useLanguage();

  if (!distributor) {
    return null;
  }

  const {
    id,
    user,
    commission_rate,
    website,
    facebook,
    permissions
  } = distributor;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {t("distributorDetails") || "Distributor Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <h3 className="text-lg font-semibold">
              {user?.name || t("unknownName") || "Unknown Name"}
            </h3>
            <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("id") || "ID"}
              </h4>
              <p className="text-sm">{id}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("phone") || "Phone"}
              </h4>
              <p className="text-sm">{user?.phone || "-"}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">
              {t("country") || "Country"}
            </h4>
            <p className="text-sm">{user?.country || "-"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("website") || "Website"}
              </h4>
              <p className="text-sm">{website || "-"}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("facebook") || "Facebook"}
              </h4>
              <p className="text-sm">{facebook || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("commissionRate") || "Commission Rate"}
              </h4>
              <p className="text-sm">{commission_rate || "0"}%</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("permissions") || "Permissions"}
              </h4>
              <p className="text-sm">{permissions || "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("expiryDate") || "Expiry Date"}
              </h4>
              <p className="text-sm">{user?.expiry_time || "-"}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("status") || "Status"}
              </h4>
              <div className="flex items-center">
                {user?.activate === 'Active' ? (
                  <Badge variant="success">
                    {t("active") || "Active"}
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    {t("inactive") || "Inactive"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
