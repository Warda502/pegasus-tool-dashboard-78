
import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Setting {
  key: string;
  object_name: string;
  title: string | null;
  value: boolean | null;
}

interface SettingsTableProps {
  data: Setting[];
  type: "Button" | "Switch";
  onUpdateSuccess: () => void;
}

export function SettingsTable({ data, type, onUpdateSuccess }: SettingsTableProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const updateSetting = async (setting: Setting, newValue: boolean) => {
    const { error } = await supabase
      .from('settings')
      .update({ value: newValue })
      .eq('key', setting.key)
      .eq('object_name', setting.object_name);

    if (error) {
      toast(t("error"), {
        description: error.message,
      });
      return false;
    }

    onUpdateSuccess();
    return true;
  };

  const handleSwitchChange = async (setting: Setting, checked: boolean) => {
    await updateSetting(setting, checked);
  };

  const handleSelectChange = async (setting: Setting, value: string) => {
    await updateSetting(setting, value === "ON");
  };

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          {t("noSettingsFound") || "No settings found"}
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((setting) => (
            <div
              key={`${setting.object_name}-${setting.key}`}
              className={`flex items-center justify-between p-3 rounded-md ${
                type === "Button" ? "bg-muted/40" : "bg-white"
              }`}
            >
              <div className="font-medium">
                {setting.title || setting.key}
              </div>
              
              {type === "Button" ? (
                <Switch
                  checked={setting.value === true}
                  onCheckedChange={(checked) => handleSwitchChange(setting, checked)}
                />
              ) : (
                <Select
                  value={setting.value ? "ON" : "OFF"}
                  onValueChange={(value) => handleSelectChange(setting, value)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON">ON</SelectItem>
                    <SelectItem value="OFF">OFF</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
