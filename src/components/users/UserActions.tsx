
import { User } from "@/hooks/useSharedData";
import { Button } from "@/components/ui/button";
import { Eye, Edit, RefreshCw, Trash } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface UserActionsProps {
  user: User;
  isAdmin: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onRenew: (user: User) => void;
  onDelete: (userId: string) => void;
}

export function UserActions({ 
  user, 
  isAdmin, 
  onView, 
  onEdit, 
  onRenew, 
  onDelete 
}: UserActionsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onView(user)}
      >
        <Eye className="h-4 w-4 mr-1" />
        {t("viewDetails")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(user)}
      >
        <Edit className="h-4 w-4 mr-1" />
        {t("edit")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRenew(user)}
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        {t("renew")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onDelete(user.id)}
      >
        <Trash className="h-4 w-4 mr-1" />
        {t("delete")}
      </Button>
    </div>
  );
}
