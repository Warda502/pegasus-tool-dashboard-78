
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: {
    key: string;
    value: string | null;
  };
}

export function EditGroupDialog({
  isOpen,
  onClose,
  onSuccess,
  group,
}: EditGroupDialogProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    key: group.key,
    value: group.value || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.key) {
      toast.error(t("keyRequired") || "Key is required");
      return;
    }
    
    setIsLoading(true);
    try {
      // Have to delete and re-insert since key is the primary key
      const { error: deleteError } = await supabase
        .from('groups')
        .delete()
        .eq('key', group.key);
        
      if (deleteError) throw deleteError;
      
      const { error: insertError } = await supabase
        .from('groups')
        .insert({
          key: formData.key,
          value: formData.value || null
        });
        
      if (insertError) throw insertError;
      
      toast.success(t("success") || "Success", {
        description: "Group value updated successfully"
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating group value:", error);
      toast.error(t("error") || "Error", {
        description: "Failed to update group value"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("edit") || "Edit Group"}</DialogTitle>
          <DialogDescription>
            {t("editGroupDescription") || "Update group information"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="key" className="text-right">
              {t("key")}
            </Label>
            <Input
              id="key"
              name="key"
              value={formData.key}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              {t("value")}
            </Label>
            <Input
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              className="col-span-3"
              placeholder={t("valueOptional") || "Value is optional"}
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
