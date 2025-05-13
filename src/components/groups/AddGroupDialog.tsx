import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface AddGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddGroupDialog = ({
  isOpen,
  onClose,
  onSuccess
}: AddGroupDialogProps) => {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) {
      toast.error(t("keyRequired") || "Key is required");
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('groups')
        .insert({
          key: key,
          value: value,
          inserted_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success(t("groupValueAddedSuccess") || "Group value added successfully");
      
      // Reset form after submission
      setKey("");
      setValue("");
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding group value:', error);
      toast.error(t("errorAddingGroupValue") || "Error adding group value");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setKey("");
    setValue("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("addNewValue") || "Add New Value"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="key">{t("key") || "Key"}</Label>
            <Input
              id="key"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Enter key name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">{t("value") || "Value"}</Label>
            <Input
              id="value"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Enter value"
            />
            <p className="text-xs text-muted-foreground">
              {t("valueOptional") || "Value is optional"}
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>{t("cancel") || "Cancel"}</Button>
            <Button type="submit" disabled={!key || loading}>
              {loading ? (t("adding") || "Adding...") : (t("add") || "Add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
