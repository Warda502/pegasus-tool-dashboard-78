
import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Check, TrendingUp, Bug, Pin } from "lucide-react";
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

  // Helper function to parse changelog content with improved parsing
  const parseChangelog = (changelog: string) => {
    if (!changelog) return [];

    const lines = changelog.split("\n").filter(line => line.trim());
    const parsedContent: Array<{type: string, content: string}> = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith("Add") || 
          trimmedLine.startsWith("add") || 
          trimmedLine.toLowerCase().includes("add:") || 
          trimmedLine.toLowerCase().includes("added:")) {
        parsedContent.push({ 
          type: "Add", 
          content: trimmedLine
            .replace(/^\[Add\]/i, "")
            .replace(/^add:/i, "")
            .replace(/^added:/i, "")
            .trim() 
        });
      } else if (trimmedLine.toLowerCase().includes("improve") || 
                trimmedLine.toLowerCase().includes("enhancement") || 
                trimmedLine.toLowerCase().includes("update") ||
                trimmedLine.startsWith("[Update]") ||
                trimmedLine.startsWith("[update]")) {
        parsedContent.push({ 
          type: "Improvement", 
          content: trimmedLine
            .replace(/^\[Update\]/i, "")
            .replace(/^\[Improve\]/i, "")
            .trim() 
        });
      } else if (trimmedLine.toLowerCase().includes("fix") || 
                trimmedLine.toLowerCase().includes("bug") ||
                trimmedLine.startsWith("[Fix]") ||
                trimmedLine.startsWith("[fix]")) {
        parsedContent.push({ 
          type: "Fix", 
          content: trimmedLine
            .replace(/^\[Fix\]/i, "")
            .replace(/^\[Bug\]/i, "")
            .trim() 
        });
      } else {
        // Default category if no specific type is detected
        parsedContent.push({ type: "Other", content: trimmedLine });
      }
    });

    return parsedContent;
  };

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

            <div className="mt-2 ml-7 space-y-3">
              {/* Display additions if any exist */}
              {parseChangelog(update.changelog).some(item => item.type === "Add") && (
                <>
                  <div className="text-sm text-muted-foreground">
                    • {t("add")} :-
                  </div>
                  {parseChangelog(update.changelog)
                    .filter(item => item.type === "Add")
                    .map((item, i) => (
                      <div key={`add-${i}`} className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 text-green-500" />
                        <span>{item.content}</span>
                      </div>
                    ))}
                </>
              )}

              {/* Display improvements if any exist */}
              {parseChangelog(update.changelog).some(item => item.type === "Improvement") && (
                <>
                  <div className="text-sm text-muted-foreground mt-4">
                    • {t("improvements")}
                  </div>
                  {parseChangelog(update.changelog)
                    .filter(item => item.type === "Improvement")
                    .map((item, i) => (
                      <div key={`imp-${i}`} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5 text-blue-500" />
                        <span>{item.content}</span>
                      </div>
                    ))}
                </>
              )}

              {/* Display fixes if any exist */}
              {parseChangelog(update.changelog).some(item => item.type === "Fix") && (
                <>
                  <div className="text-sm text-muted-foreground mt-4">
                    • {t("fixBugs")}
                  </div>
                  {parseChangelog(update.changelog)
                    .filter(item => item.type === "Fix")
                    .map((item, i) => (
                      <div key={`fix-${i}`} className="flex items-start gap-2">
                        <Bug className="h-4 w-4 mt-0.5 text-orange-500" />
                        <span>{item.content}</span>
                      </div>
                    ))}
                </>
              )}

              {/* Display other items if any exist */}
              {parseChangelog(update.changelog).some(item => item.type === "Other") && (
                <>
                  <div className="text-sm text-muted-foreground mt-4">
                    • {t("other")}
                  </div>
                  {parseChangelog(update.changelog)
                    .filter(item => item.type === "Other")
                    .map((item, i) => (
                      <div key={`other-${i}`} className="flex items-start gap-2">
                        <span className="inline-flex items-center">
                          <span className="mr-2">📌</span>
                          {item.content}
                        </span>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
