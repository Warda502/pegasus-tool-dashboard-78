
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddSettingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddSettingDialog({ isOpen, onClose, onSuccess }: AddSettingDialogProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    title: "",
    object_name: "Button",
    value: false
  });

  const resetForm = () => {
    setFormData({
      key: "",
      title: "",
      object_name: "Button",
      value: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.key || !formData.object_name) {
        toast(t("error"), {
          description: t("pleaseCompleteAllRequiredFields") || "Please complete all required fields",
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("settings").insert({
        key: formData.key,
        title: formData.title || null,
        object_name: formData.object_name,
        value: formData.value
      });

      if (error) {
        throw error;
      }

      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding setting:", error);
      toast(t("error"), {
        description: (error as Error).message || t("unexpectedError") || "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleObjectTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, object_name: value }));
  };

  const handleValueChange = (value: string) => {
    setFormData((prev) => ({ ...prev, value: value === "true" }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addNewSetting") || "Add New Setting"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="key">{t("key") || "Key"} *</Label>
              <Input
                id="key"
                name="key"
                value={formData.key}
                onChange={handleChange}
                placeholder={t("enterKey") || "Enter key"}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">{t("title") || "Title"}</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t("enterTitle") || "Enter title"}
              />
              <p className="text-sm text-muted-foreground">
                {t("titleOptional") || "Title is optional and will be displayed instead of key"}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="object_name">{t("objectType") || "Object Type"} *</Label>
              <Select
                value={formData.object_name}
                onValueChange={handleObjectTypeChange}
              >
                <SelectTrigger id="object_name">
                  <SelectValue placeholder={t("selectObjectType") || "Select object type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Button">Button</SelectItem>
                  <SelectItem value="Switch">Switch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="default_value">{t("defaultValue") || "Default Value"}</Label>
              <Select
                value={formData.value ? "true" : "false"}
                onValueChange={handleValueChange}
              >
                <SelectTrigger id="default_value">
                  <SelectValue placeholder={t("selectDefaultValue") || "Select default value"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">ON</SelectItem>
                  <SelectItem value="false">OFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("saving") || "Saving..." : t("save") || "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
