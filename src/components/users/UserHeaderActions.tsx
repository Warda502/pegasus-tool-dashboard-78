
import { Button } from "@/components/ui/button";
import { Plus, Coins, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface UserHeaderActionsProps {
  onRefresh: () => void;
  onAddCredits: () => void;
  onAddUser: () => void;
}

export function UserHeaderActions({ 
  onRefresh, 
  onAddCredits, 
  onAddUser 
}: UserHeaderActionsProps) {
  const { t } = useLanguage();

  // Add logging to button actions for debugging
  const handleRefresh = () => {
    console.log("UserHeaderActions: Refresh button clicked");
    onRefresh();
  };

  const handleAddCredits = () => {
    console.log("UserHeaderActions: Add credits button clicked");
    onAddCredits();
  };

  const handleAddUser = () => {
    console.log("UserHeaderActions: Add user button clicked");
    onAddUser();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 ml-auto">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleRefresh}
      >
        <RefreshCcw className="h-4 w-4 mr-1" />
        {t("refresh")}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleAddCredits}
      >
        <Coins className="h-4 w-4 mr-1" />
        {t("addCredit")}
      </Button>
      <Button 
        size="sm"
        onClick={handleAddUser}
      >
        <Plus className="h-4 w-4 mr-1" />
        {t("addUser")}
      </Button>
    </div>
  );
}
