
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Wallet } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface DistributorHeaderActionsProps {
  onRefresh: () => void;
  onAddDistributor: () => void;
}

export function DistributorHeaderActions({
  onRefresh,
  onAddDistributor
}: DistributorHeaderActionsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-2 ml-auto">
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={onRefresh}
      >
        <RefreshCw className="h-4 w-4" />
        <span className="hidden sm:inline">{t("refresh") || "Refresh"}</span>
      </Button>
      
      <Button
        size="sm"
        className="gap-1"
        onClick={onAddDistributor}
      >
        <Plus className="h-4 w-4" />
        <span>{t("addDistributor") || "Add Distributor"}</span>
      </Button>
    </div>
  );
}
