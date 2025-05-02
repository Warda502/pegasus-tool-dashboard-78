
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "@/components/ui/loading";
import { UpdateTimeline } from "@/components/update/UpdateTimeline";

interface UpdateData {
  name: string;
  varizon: string;
  link: string;
  changelog: string;
  direct_download: boolean;
}

export default function ToolUpdate() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<UpdateData>({
    name: "",
    varizon: "",
    link: "",
    changelog: "",
    direct_download: true
  });

  const { data: updateData, isLoading, refetch } = useQuery({
    queryKey: ["updateData"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("update")
        .select("*")
        .order("release_at", { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0] as UpdateData | undefined;
    }
  });

  useEffect(() => {
    if (updateData) {
      setFormData({
        name: updateData.name || "",
        varizon: updateData.varizon || "",
        link: updateData.link || "",
        changelog: updateData.changelog || "",
        direct_download: updateData.direct_download !== false, // Default to true if undefined
      });
    }
  }, [updateData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, direct_download: value === "ON" }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("update")
        .upsert({
          name: formData.name,
          varizon: formData.varizon,
          link: formData.link,
          changelog: formData.changelog,
          direct_download: formData.direct_download,
          release_at: new Date().toISOString()
        });

      if (error) throw error;

      toast(t("success"), {
        description: t("updateSaved"),
      });

      refetch();
    } catch (error) {
      console.error("Error saving update:", error);
      toast(t("error"), {
        description: t("unexpectedError"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Loading text={t("loading")} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{t("updateTool")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="direct-download" className="block text-sm font-medium">
              {t("directDownload")}
            </label>
            <div className="flex gap-2">
              <Input 
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder={t("link")}
                className="flex-1"
              />
              <Select 
                value={formData.direct_download ? "ON" : "OFF"}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="ON" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ON">ON</SelectItem>
                  <SelectItem value="OFF">OFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              {t("name")}
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t("name")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="varizon" className="block text-sm font-medium">
              {t("verizon")}
            </label>
            <Input
              id="varizon"
              name="varizon"
              value={formData.varizon}
              onChange={handleInputChange}
              placeholder="v0.0.0"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="changelog" className="block text-sm font-medium">
              {t("changeLog")}
            </label>
            <Textarea
              id="changelog"
              name="changelog"
              value={formData.changelog}
              onChange={handleInputChange}
              placeholder={t("changeLog")}
              className="min-h-[220px]"
            />
          </div>

          <Button onClick={handleSave} className="w-full">{t("saveUpdate")}</Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{t("updateLogs")}</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateTimeline />
        </CardContent>
      </Card>
    </div>
  );
}
