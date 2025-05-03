
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddSettingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddSettingDialog({ isOpen, onClose, onSuccess }: AddSettingDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState("");
  const [title, setTitle] = useState("");
  const [objectName, setObjectName] = useState("Button"); // Default to Button

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!key.trim() || !title.trim()) {
      toast(t("error"), {
        description: t("allFieldsRequired") || "All fields are required",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('settings')
        .insert([
          { 
            key, 
            title, 
            object_name: objectName,
            value: false // Default to false
          }
        ]);
      
      if (error) throw error;
      
      onSuccess();
      onClose();
      
      setKey("");
      setTitle("");
      setObjectName("Button");
      
    } catch (error) {
      console.error("Error adding setting:", error);
      toast(t("error"), {
        description: error instanceof Error ? error.message : t("unexpectedError") || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addNewSetting") || "Add New Setting"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="object_name">{t("objectType") || "Object Type"}</Label>
              <Select 
                value={objectName} 
                onValueChange={setObjectName}
              >
                <SelectTrigger id="object_name">
                  <SelectValue placeholder={t("selectType") || "Select Type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Button">Button</SelectItem>
                  <SelectItem value="Switch">Switch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="key">{t("key") || "Key"}</Label>
              <Input
                id="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={t("enterKey") || "Enter Key"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">{t("title") || "Title"}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("enterTitle") || "Enter Title"}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                {t("cancel") || "Cancel"}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? t("saving") || "Saving..." : t("save") || "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
