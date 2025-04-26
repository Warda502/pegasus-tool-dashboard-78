
import { useServerData } from "@/hooks/useServerData";
import { ApiDataTable } from "@/components/server/ApiDataTable";
import { Loading } from "@/components/ui/loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { useLanguage } from "@/hooks/useLanguage";

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
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("serverApiData") || "Server API Data"}</h2>
        <p className="text-muted-foreground">
          {t("viewServerData") || "View and manage server API data"}
        </p>
      </div>
      <ApiDataTable data={data} />
    </div>
  );
}
