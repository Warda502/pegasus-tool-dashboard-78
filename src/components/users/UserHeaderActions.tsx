
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus, PlusCircle, CreditCard, BarChart3 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface UserHeaderActionsProps {
  onRefresh: () => void;
  onAddCredits: () => void;
  onAddUser: () => void;
  onAddToPlan: () => void;
}

export function UserHeaderActions({ 
  onRefresh,
  onAddCredits,
  onAddUser,
  onAddToPlan
}: UserHeaderActionsProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-wrap items-center gap-2 ms-auto">
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-1" />
        {t("refresh")}
      </Button>
      
      <Button variant="outline" size="sm" onClick={onAddCredits}>
        <CreditCard className="h-4 w-4 mr-1" />
        {t("addCredits") || "Add Credits"}
      </Button>
      
      <Button variant="outline" size="sm" onClick={onAddToPlan}>
        <BarChart3 className="h-4 w-4 mr-1" />
        {t("addToPlan") || "Add To User Plan"}
      </Button>
      
      <Button variant="secondary" size="sm" onClick={onAddUser}>
        <UserPlus className="h-4 w-4 mr-1" />
        {t("addUser")}
      </Button>
    </div>
  );
}
