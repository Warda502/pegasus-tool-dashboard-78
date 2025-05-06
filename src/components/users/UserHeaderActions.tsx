
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserHeaderActionsProps {
  onRefresh: () => void;
  onAddCredits: () => void;
  onAddUser: () => void;
}

export function UserHeaderActions({
  onRefresh,
  onAddCredits,
  onAddUser,
}: UserHeaderActionsProps) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={onAddCredits} 
        className="flex items-center" 
        variant="outline"
        size={isMobile ? "sm" : "default"}
      >
        <PlusCircle className="h-4 w-4 mr-1" />
        {t("addCredit")}
      </Button>
      <Button 
        onClick={onAddUser} 
        className="flex items-center" 
        variant="outline"
        size={isMobile ? "sm" : "default"}
      >
        <UserPlus className="h-4 w-4 mr-1" />
        {t("addUser")}
      </Button>
    </div>
  );
}
