
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileManager } from "@/components/server/FileManager";
import { useLanguage } from "@/hooks/useLanguage";
import { FileQuestion } from "lucide-react";

export default function ServerStorage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
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
        <CardContent>
          <FileManager />
        </CardContent>
      </Card>
    </div>
  );
}
