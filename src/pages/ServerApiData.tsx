
import { useServerData } from "@/hooks/useServerData";
import { ApiDataTable } from "@/components/server/ApiDataTable";
import { Loading } from "@/components/ui/loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export default function ServerApiData() {
  const { data, isLoading, error } = useServerData();
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              <span>{t("serverApiData") || "Server API Data"}</span>
            </CardTitle>
            <CardDescription>
              {t("viewServerData") || "View and manage server API data"}
              {data && data.length > 0 && (
                <span className="ml-2 font-medium">
                  ({data.length} {t("totalRecords") || "total records"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ApiDataTable data={data || []} />
        </CardContent>
      </Card>
    </div>
  );
}
