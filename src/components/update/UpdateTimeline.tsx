
import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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

  // Improved function to parse changelog text with better section detection
  const parseChangelog = (changelog: string) => {
    if (!changelog) return [];

    const sections: Array<{type: string, title: string, content: string}> = [];
    
    // Split by double newlines to separate main sections
    const mainSections = changelog.split(/\n\n+/);
    
    mainSections.forEach(section => {
      // Clean section and check if empty
      const trimmedSection = section.trim();
      if (!trimmedSection) return;
      
      // Look for specific patterns
      let sectionType: string;
      let sectionTitle: string;
      let sectionContent: string;
      
      // Check for "Add To" patterns which typically have more detailed content
      if (trimmedSection.startsWith("Add To")) {
        const lines = trimmedSection.split('\n');
        sectionTitle = lines[0]; // First line is the title
        sectionContent = lines.slice(1).join('\n'); // Rest is content
        sectionType = "Add";
      } 
      // Check for standalone "Add" section
      else if (trimmedSection.startsWith("Add ")) {
        sectionType = "Add";
        sectionTitle = trimmedSection;
        sectionContent = "";
      }
      // Check for Improvements section
      else if (trimmedSection.includes("Improve") || 
               trimmedSection === "Improvements" || 
               trimmedSection.includes("Enhancement")) {
        sectionType = "Improvement";
        sectionTitle = trimmedSection;
        sectionContent = "";
      } 
      // Check for Fix section
      else if (trimmedSection.includes("Fix") || 
               trimmedSection === "Fix Bugs" || 
               trimmedSection.includes("Bug")) {
        sectionType = "Fix";
        sectionTitle = trimmedSection;
        sectionContent = "";
      } 
      // Default to Other for anything else
      else {
        sectionType = "Other";
        sectionTitle = "";
        sectionContent = trimmedSection;
      }
      
      // Detect model lists including Dialn and Unisoc patterns
      const isModelList = 
        /SM-[A-Z0-9]+/.test(sectionContent) || 
        /Carrier\[.*?\]/.test(sectionContent) || 
        /BIT\[.*?\]/.test(sectionContent) ||
        /Dialn\s+\w+/.test(sectionContent) ||
        /Unisoc\s+\w+/.test(sectionContent);
      
      sections.push({
        type: sectionType,
        title: sectionTitle,
        content: isModelList ? sectionContent : sectionTitle + (sectionContent ? '\n' + sectionContent : '')
      });
    });
    
    return sections;
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
                      {section.title && section.title !== section.content && (
                        <div className="font-medium mb-1">{section.title}</div>
                      )}
                      
                      {/* Enhanced model list detection for better formatting */}
                      {section.content && (
                        /SM-[A-Z0-9]+/.test(section.content) || 
                        /Carrier\[.*?\]/.test(section.content) || 
                        /BIT\[.*?\]/.test(section.content) ||
                        /Dialn\s+\w+/.test(section.content) ||
                        /Unisoc\s+\w+/.test(section.content) ? (
                          <pre className="whitespace-pre-wrap font-sans text-sm mt-2 bg-muted p-3 rounded-md overflow-x-auto">
                            {section.content}
                          </pre>
                        ) : (
                          <span>{section.content}</span>
                        )
                      )}
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
