
import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UpdateRecord {
  varizon: string;
  changelog: string;
  name: string;
  release_at: string;
}

export function UpdateTimeline() {
  const { t } = useLanguage();

  const { data: updates, isLoading, error } = useQuery({
    queryKey: ["updates-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("update")
        .select("*")
        .order("release_at", { ascending: false });
      
      if (error) throw error;
      return data as UpdateRecord[];
    }
  });

  if (isLoading) {
    return <div className="py-4 text-center text-muted-foreground">{t("loading")}</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {t("error")}: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!updates || updates.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">{t("noData")}</div>;
  }

  return (
    <div className="relative overflow-auto max-h-[600px] pr-4">
      <div className="space-y-8">
        {updates.map((update, index) => (
          <div key={index} className="relative">
            <div className="flex items-center">
              <div className="absolute mt-1 left-0">
                <div className="w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
              </div>
              {index < updates.length - 1 && (
                <div className="absolute mt-3 left-[7px] top-4 h-full w-[2px] bg-border"></div>
              )}
              <h3 className="text-lg font-semibold ml-7">
                {update.name ? `${update.name} ${update.varizon}` : `Update ${update.varizon}`}
              </h3>
            </div>

            <div className="mt-2 ml-7">
              <div className="whitespace-pre-wrap bg-muted p-4 rounded-md">
                {update.changelog}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
