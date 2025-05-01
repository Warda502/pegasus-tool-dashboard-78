
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";

interface Group {
  key: string;
  value: string | null;
  inserted_at: string | null;
}

interface GroupsTableProps {
  data: Group[];
  onDeleteSuccess: () => void;
}

export const GroupsTable: React.FC<GroupsTableProps> = ({ data, onDeleteSuccess }) => {
  const { t, isRTL } = useLanguage();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (group: Group) => {
    setSelectedGroup(group);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGroup) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('key', selectedGroup.key);
      
      if (error) throw error;
      
      toast.success(t("groupValueDeletedSuccess") || "Group value deleted successfully");
      onDeleteSuccess();
    } catch (error) {
      console.error('Error deleting group value:', error);
      toast.error(t("errorDeletingGroupValue") || "Error deleting group value");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "yyyy/MM/dd hh:mm a");
    } catch {
      return dateString;
    }
  };

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t("noGroupsFound") || "No group values found"}
      </div>
    );
  }

  return (
    <>
      <Table dir={isRTL ? "rtl" : "ltr"}>
        <TableHeader>
          <TableRow>
            <TableHead>{t("key") || "Key"}</TableHead>
            <TableHead>{t("value") || "Value"}</TableHead>
            <TableHead>{t("insertedAt") || "Inserted At"}</TableHead>
            <TableHead className="text-right">{t("actions") || "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((group) => (
            <TableRow key={group.key}>
              <TableCell className="font-medium">{group.key}</TableCell>
              <TableCell>{group.value || "-"}</TableCell>
              <TableCell>{formatDate(group.inserted_at)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(group)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="sr-only">{t("delete") || "Delete"}</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete") || "Confirm Delete"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteGroupValueConfirmation") || "Are you sure you want to delete this group value? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? t("deleting") || "Deleting..." : t("delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
