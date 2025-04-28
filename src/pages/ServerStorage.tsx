
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileManager } from "@/components/server/FileManager";
import { useLanguage } from "@/hooks/useLanguage";
import { FileQuestion } from "lucide-react";

export default function ServerStorage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              <span>{t("serverStorage") || "Server Storage"}</span>
            </CardTitle>
            <CardDescription>
              {t("manageServerFiles") || "Manage and organize server files and folders"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <FileManager />
        </CardContent>
      </Card>
    </div>
  );
}
