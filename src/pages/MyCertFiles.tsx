
import { useUserCertFiles } from "@/hooks/useUserCertFiles";
import { UserCertFilesTable } from "@/components/user/UserCertFilesTable";
import { Loading } from "@/components/ui/loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

export default function MyCertFiles() {
  const { data, isLoading, error } = useUserCertFiles();
  const { t } = useLanguage();

  if (isLoading) {
    return <Loading text={t("loadingData") || "Loading data..."} />;
  }

  if (error) {
    return (
      <ErrorAlert
        title={t("errorLoadingData") || "Error Loading Data"}
        description={t("pleaseRefreshPage") || "Please try refreshing the page."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              <span>{t("myCertFiles") || "My CertFiles"}</span>
            </CardTitle>
            <CardDescription>
              {t("viewCertFiles") || "View and manage your cert files"}
              {data && data.length > 0 && (
                <span className="ml-2 font-medium">
                  ({data.length} {t("totalRecords") || "total records"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <UserCertFilesTable data={data || []} />
        </CardContent>
      </Card>
    </div>
  );
}
