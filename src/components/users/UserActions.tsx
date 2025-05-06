
import { User } from "@/hooks/data/types";
import { Button } from "@/components/ui/button";
import { Eye, Edit, RefreshCw, Trash } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface UserActionsProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onRenew: (user: User) => void;
  onDelete: (userId: string) => void;
}

export function UserActions({ 
  user,  
  onView, 
  onEdit, 
  onRenew, 
  onDelete 
}: UserActionsProps) {
  const { t } = useLanguage();

  // Function to handle view action with logging
  const handleView = () => {
    console.log("View action triggered for user:", user.Email);
    onView(user);
  };

  // Function to handle edit action with logging
  const handleEdit = () => {
    console.log("Edit action triggered for user:", user.Email);
    onEdit(user);
  };

  // Function to handle renew action with logging
  const handleRenew = () => {
    console.log("Renew action triggered for user:", user.Email);
    onRenew(user);
  };

  // Function to handle delete action with confirmation and logging
  const handleDelete = () => {
    console.log("Delete action triggered for user:", user.Email);
    if (confirm(t("confirmDeleteUser") || "Are you sure you want to delete this user?")) {
      onDelete(user.id);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
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
