
import { FileManager } from "@/components/server/FileManager";
import { useLanguage } from "@/hooks/useLanguage";

export default function ServerStorage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">{t("serverStorage") || "Server Storage"}</h2>
      <FileManager />
    </div>
  );
}
