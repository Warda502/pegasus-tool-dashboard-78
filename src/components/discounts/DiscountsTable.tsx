
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

interface Discount {
  id: string;
  email: string;
  model: string;
  count_refund: number;
  number_discounts: number;
  uid: string;
}

interface DiscountsTableProps {
  data: Discount[];
  onDeleteSuccess: () => void;
}

export const DiscountsTable: React.FC<DiscountsTableProps> = ({ data, onDeleteSuccess }) => {
  const { t, isRTL } = useLanguage();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (discount: Discount) => {
    setSelectedDiscount(discount);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDiscount) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', selectedDiscount.id);
      
      if (error) throw error;
      
      toast.success(t("discountDeletedSuccess") || "Discount deleted successfully");
      onDeleteSuccess();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error(t("errorDeletingDiscount") || "Error deleting discount");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t("noDiscountsFound") || "No discount records found"}
      </div>
    );
  }

  return (
    <>
      <Table dir={isRTL ? "rtl" : "ltr"}>
        <TableHeader>
          <TableRow>
            <TableHead>{t("email") || "Email"}</TableHead>
            <TableHead>{t("model") || "Model"}</TableHead>
            <TableHead>{t("refundAmount") || "Refund Amount"}</TableHead>
            <TableHead className="text-center">{t("remainingDiscounts") || "Remaining Discounts"}</TableHead>
            <TableHead className="text-right">{t("actions") || "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((discount) => (
            <TableRow key={discount.id}>
              <TableCell className="font-medium">{discount.email}</TableCell>
              <TableCell>{discount.model}</TableCell>
              <TableCell>{discount.count_refund}</TableCell>
              <TableCell className="text-center">{discount.number_discounts}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(discount)}
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
              {t("deleteDiscountConfirmation") || "Are you sure you want to delete this discount? This action cannot be undone."}
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
