
import { Button } from "@/components/ui/button";
import { RefreshCw, PlusCircle, UserPlus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface UserHeaderActionsProps {
  isAdmin: boolean;
  onRefresh: () => void;
  onAddCredits: () => void;
  onAddUser: () => void;
}

export function UserHeaderActions({
  isAdmin,
  onRefresh,
  onAddCredits,
  onAddUser,
}: UserHeaderActionsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Button onClick={onRefresh} className="flex items-center" variant="outline">
        <RefreshCw className="h-5 w-5 mr-2" />
        {t("refresh")}
      </Button>
      {isAdmin && (
        <>
          <Button onClick={onAddCredits} className="flex items-center" variant="outline">
            <PlusCircle className="h-5 w-5 mr-2" />
            {t("addCredit")}
          </Button>
          <Button onClick={onAddUser} className="flex items-center" variant="outline">
            <UserPlus className="h-5 w-5 mr-2" />
            {t("addUser")}
          </Button>
        </>
      )}
    </div>
  );
}
