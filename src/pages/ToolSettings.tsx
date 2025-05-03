
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loading } from "@/components/ui/loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { SettingsTable } from "@/components/settings/SettingsTable";
import { AddSettingDialog } from "@/components/settings/AddSettingDialog";

interface Setting {
  key: string;
  object_name: string;
  title: string | null;
  value: boolean | null;
}

export default function ToolSettings() {
  const { t, isRTL } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('object_name', { ascending: true })
      
      if (error) throw error;
      return data as Setting[];
    }
  });

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['settings'] });
    toast(t("success"), {
      description: t("settingAddedSuccessfully") || "Setting added successfully",
    });
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['settings'] });
    toast(t("success"), {
      description: t("settingsUpdatedSuccessfully") || "Settings updated successfully",
    });
  };

  if (isLoading) {
    return <Loading text={t("loadingData") || "Loading data..."} />;
  }

  if (error) {
    return (
      <ErrorAlert
        title={t("errorLoadingData") || "Error Loading Data"}
        description={(error as Error).message || (t("pleaseRefreshPage") || "Please try refreshing the page.")}
      />
    );
  }

  // Group settings by their object_name
  const buttonSettings = settings?.filter(setting => setting.object_name === "Button") || [];
  const switchSettings = settings?.filter(setting => setting.object_name === "Switch") || [];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span>{t("toolSettings") || "Tool Settings"}</span>
            </CardTitle>
            <CardDescription>
              {t("manageToolSettings") || "Manage tool settings and configurations"}
              {settings && settings.length > 0 && (
                <span className="ml-2 font-medium">
                  ({settings.length} {t("totalRecords") || "total records"})
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              {t("addNewObject") || "Add New Object"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Buttons Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("buttons") || "Buttons"}</CardTitle>
              </CardHeader>
              <CardContent>
                <SettingsTable 
                  data={buttonSettings}
                  type="Button"
                  onUpdateSuccess={handleUpdateSuccess}
                />
              </CardContent>
            </Card>

            {/* Settings Switch Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("settingsSwitch") || "Settings Switch"}</CardTitle>
              </CardHeader>
              <CardContent>
                <SettingsTable 
                  data={switchSettings}
                  type="Switch"
                  onUpdateSuccess={handleUpdateSuccess}
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <AddSettingDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
