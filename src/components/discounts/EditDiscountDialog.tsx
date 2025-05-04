
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditDiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  discount: {
    id: string;
    email: string;
    model: string;
    count_refund: number;
    number_discounts: number;
  };
}

export function EditDiscountDialog({
  isOpen,
  onClose,
  onSuccess,
  discount,
}: EditDiscountDialogProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: discount.email,
    model: discount.model,
    count_refund: discount.count_refund,
    number_discounts: discount.number_discounts
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "count_refund" || name === "number_discounts" 
        ? parseInt(value) || 0 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.email || !formData.model || formData.count_refund <= 0 || formData.number_discounts <= 0) {
      toast.error(t("fillAllFields") || "Please fill all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('discounts')
        .update({
          email: formData.email,
          model: formData.model,
          count_refund: formData.count_refund,
          number_discounts: formData.number_discounts,
        })
        .eq('id', discount.id);
        
      if (error) throw error;
      
      toast.success(t("success") || "Success", {
        description: "Discount updated successfully"
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating discount:", error);
      toast.error(t("error") || "Error", {
        description: "Failed to update discount"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("edit") || "Edit Discount"}</DialogTitle>
          <DialogDescription>
            {t("editDiscountDescription") || "Update discount information"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              {t("email")}
            </Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              {t("model")}
            </Label>
            <Input
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="count_refund" className="text-right">
              {t("countRefund")}
            </Label>
            <Input
              id="count_refund"
              name="count_refund"
              type="number"
              value={formData.count_refund}
              onChange={handleChange}
              className="col-span-3"
              min="1"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="number_discounts" className="text-right">
              {t("numberDiscounts")}
            </Label>
            <Input
              id="number_discounts"
              name="number_discounts"
              type="number"
              value={formData.number_discounts}
              onChange={handleChange}
              className="col-span-3"
              min="1"
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("updating") : t("saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
