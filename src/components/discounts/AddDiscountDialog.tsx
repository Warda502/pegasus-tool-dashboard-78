
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { User } from "@/hooks/useSharedData";

interface AddDiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSuccess: () => void;
}

export const AddDiscountDialog = ({
  isOpen,
  onClose,
  users,
  onSuccess
}: AddDiscountDialogProps) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [model, setModel] = useState("");
  const [countRefund, setCountRefund] = useState("");
  const [numberDiscounts, setNumberDiscounts] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !model || !countRefund || !numberDiscounts) {
      toast.error(t("fillAllFields") || "Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      
      const selectedUserData = users.find(user => user.id === selectedUser);
      if (!selectedUserData) {
        throw new Error("User not found");
      }

      const { error } = await supabase
        .from('discounts')
        .insert({
          uid: selectedUserData.UID,
          email: selectedUserData.Email,
          model: model,
          count_refund: parseFloat(countRefund),
          number_discounts: parseInt(numberDiscounts)
        });

      if (error) throw error;
      
      toast.success(t("discountAddedSuccess") || "Discount added successfully");
      
      // Reset form after submission
      setSelectedUser("");
      setModel("");
      setCountRefund("");
      setNumberDiscounts("");
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding discount:', error);
      toast.error(t("errorAddingDiscount") || "Error adding discount");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUser("");
    setModel("");
    setCountRefund("");
    setNumberDiscounts("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("addNewDiscount") || "Add New Discount"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user-select">{t("user") || "User"}</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectUser") || "Select User"} />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.Email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">{t("model") || "Model"}</Label>
            <Input
              id="model"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="iPhone 13 Pro Max"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="count-refund">{t("countRefund") || "Refund Amount"}</Label>
            <Input
              id="count-refund"
              type="number"
              step="0.1"
              value={countRefund}
              onChange={e => setCountRefund(e.target.value)}
              placeholder="10.0"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              {t("refundAmountExplanation") || "Amount to refund for each operation"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="number-discounts">{t("numberDiscounts") || "Number of Discounts"}</Label>
            <Input
              id="number-discounts"
              type="number"
              value={numberDiscounts}
              onChange={e => setNumberDiscounts(e.target.value)}
              placeholder="5"
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              {t("discountTimesExplanation") || "How many times the discount can be applied"}
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>{t("cancel") || "Cancel"}</Button>
            <Button type="submit" disabled={!selectedUser || !model || !countRefund || !numberDiscounts || loading}>
              {loading ? (t("adding") || "Adding...") : (t("add") || "Add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
