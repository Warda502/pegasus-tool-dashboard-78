
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

  const handleView = () => {
    console.log("View button clicked for user:", user.id);
    onView(user);
  };

  const handleEdit = () => {
    console.log("Edit button clicked for user:", user.id);
    onEdit(user);
  };

  const handleRenew = () => {
    console.log("Renew button clicked for user:", user.id);
    onRenew(user);
  };

  const handleDelete = () => {
    console.log("Delete button clicked for user:", user.id);
    onDelete(user.id || "");
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleView}
      >
        <Eye className="h-4 w-4 mr-1" />
        {t("viewDetails")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEdit}
      >
        <Edit className="h-4 w-4 mr-1" />
        {t("edit")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRenew}
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        {t("renew")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
      >
        <Trash className="h-4 w-4 mr-1" />
        {t("delete")}
      </Button>
    </div>
  );
}
