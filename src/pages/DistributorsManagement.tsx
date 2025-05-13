
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddDistributorDialog } from "@/components/distributors/AddDistributorDialog";
import { DistributorsTable } from "@/components/distributors/DistributorsTable";

export default function DistributorsManagement() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('distributorsManagement')}</h1>
          <p className="text-muted-foreground">{t('distributorsManagementDescription')}</p>
        </div>
        <AddDistributorDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addDistributor')}
          </Button>
        </AddDistributorDialog>
      </div>
      <DistributorsTable />
    </div>
  );
}
