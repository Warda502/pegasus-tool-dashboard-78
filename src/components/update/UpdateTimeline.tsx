
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

  // Helper function to identify line and section types with improved parsing
  const parseChangelog = (changelog: string) => {
    if (!changelog) return [];

    // Split by double newlines to separate sections better
    const sections = changelog.split(/\n\n+/);
    const parsedContent: Array<{type: string, content: string, isModelList: boolean}> = [];
    
    let currentType = "";
    
    // Process each section
    sections.forEach(section => {
      // Clean section and check if empty
      const trimmedSection = section.trim();
      if (!trimmedSection) return;
      
      // Identify section type from the first line
      const firstLine = trimmedSection.split('\n')[0].trim().toLowerCase();
      
      // Determine section type
      if (firstLine.includes("add to") || 
          firstLine.startsWith("add") || 
          firstLine.includes("add:") || 
          firstLine.includes("added:")) {
        currentType = "Add";
      } else if (firstLine.includes("improve") || 
                firstLine.includes("enhancement") || 
                firstLine.includes("update") ||
                firstLine === "improvements") {
        currentType = "Improvement";
      } else if (firstLine.includes("fix") || 
                firstLine.includes("bug") ||
                firstLine === "fix bugs") {
        currentType = "Fix";
      } else if (currentType === "") {
        // If we haven't determined a type yet, default to Other
        currentType = "Other";
      }
      
      // Check if this is a model list (contains model numbers like SM-XXXX)
      const isModelList = /SM-[A-Z0-9]+/.test(trimmedSection) || 
                          (trimmedSection.includes("Carrier[") && trimmedSection.includes("BIT["));
      
      // Add the section with its determined type
      parsedContent.push({
        type: currentType,
        content: trimmedSection,
        isModelList: isModelList
      });
    });
    
    return parsedContent;
  };

  // Helper function to preserve formatting for model lists
  const renderContent = (content: string, isModelList: boolean) => {
    if (!isModelList) {
      return <span>{content}</span>;
    }

    // For model lists, preserve newlines and spacing
    return (
      <pre className="whitespace-pre-wrap font-sans text-sm mt-2 bg-muted p-3 rounded-md overflow-x-auto">
        {content}
      </pre>
    );
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
              {/* Parse and display the changelog by sections */}
              {parseChangelog(update.changelog).map((section, i) => (
                <div key={`section-${i}`} className="mb-4">
                  <div className="flex items-start">
                    {section.type === "Add" && (
                      <Check className="h-4 w-4 mt-1 mr-2 flex-shrink-0 text-green-500" />
                    )}
                    {section.type === "Improvement" && (
                      <TrendingUp className="h-4 w-4 mt-1 mr-2 flex-shrink-0 text-blue-500" />
                    )}
                    {section.type === "Fix" && (
                      <Bug className="h-4 w-4 mt-1 mr-2 flex-shrink-0 text-orange-500" />
                    )}
                    {section.type === "Other" && (
                      <Pin className="h-4 w-4 mt-1 mr-2 flex-shrink-0 text-gray-500" />
                    )}
                    <div className="flex-1">
                      {renderContent(section.content, section.isModelList)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
