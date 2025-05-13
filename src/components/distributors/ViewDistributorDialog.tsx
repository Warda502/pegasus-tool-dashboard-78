
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";
import type { Distributor } from "@/hooks/data/types/distributors";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";

interface ViewDistributorDialogProps {
  distributor: Distributor;
  children?: React.ReactNode;
}

export function ViewDistributorDialog({
  distributor,
  children,
}: ViewDistributorDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy/MM/dd HH:mm");
    } catch {
      return dateString;
    }
  };

  const InfoItem = ({ label, value }: { label: string; value: string | number | React.ReactNode }) => (
    <div className="flex flex-col space-y-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t('distributorDetails')}</DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{distributor.name}</CardTitle>
                <CardDescription>{distributor.email}</CardDescription>
              </div>
              <Badge
                variant={
                  distributor.status === "active" ? "outline" : "secondary"
                }
                className={
                  distributor.status === "active"
                    ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-400 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900 dark:border-green-700"
                    : "bg-red-100 text-red-800 hover:bg-red-100 border-red-400 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-900 dark:border-red-700"
                }
              >
                {distributor.status === "active" ? t("active") : t("inactive")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label={t('phone')} value={distributor.phone || "-"} />
              <InfoItem label={t('country')} value={distributor.country || "-"} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem 
                label={t('credits')} 
                value={
                  <span className="text-xl text-primary">
                    {distributor.credits_balance.toFixed(1)}
                  </span>
                } 
              />
              <InfoItem label={t('maxCreditLimit')} value={distributor.max_credit_limit.toFixed(1)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label={t('commissionRate')} value={`${distributor.commission_rate}%`} />
              <InfoItem label={t('createdAt')} value={formatDate(distributor.created_at)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setOpen(false)} className="ml-auto">
              {t('close')}
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
