
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage, formatTimeString } from "@/hooks/useSharedData";
import type { Operation } from "@/hooks/useSharedData";

interface OperationDetailsDialogProps {
  operation: Operation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OperationDetailsDialog = ({ operation, isOpen, onClose }: OperationDetailsDialogProps) => {
  const { t, language, isRTL } = useLanguage();
  
  if (!operation) return null;

  const detailItems = [
    { label: t("operationID"), value: operation.OprationID },
    { label: t("operationType"), value: operation.OprationTypes },
    { label: t("serialNumber"), value: operation.Phone_SN },
    { label: t("brand"), value: operation.Brand },
    { label: t("model"), value: operation.Model },
    { label: t("imei"), value: operation.Imei },
    { label: t("user"), value: operation.UserName },
    { label: t("credit"), value: operation.Credit },
    { label: t("time"), value: formatTimeString(operation.Time) },
    { label: t("status"), value: operation.Status },
    { label: t("android"), value: operation.Android },
    { label: t("baseband"), value: operation.Baseband },
    { label: t("carrier"), value: operation.Carrier },
    { label: t("securityPatch"), value: operation.Security_Patch },
    { label: t("uid"), value: operation.UID },
    { label: t("hwid"), value: operation.Hwid },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("operationDetails")}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {detailItems.map((item, index) => (
              <div key={index} className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">{item.label}</div>
                <div className="font-medium mt-1">{item.value}</div>
              </div>
            ))}
            
            {operation.LogOpration && (
              <div className="col-span-1 md:col-span-2 border rounded-md p-3">
                <div className="text-sm text-muted-foreground">Log</div>
                <pre className="mt-2 whitespace-pre-wrap text-sm bg-muted p-2 rounded">
                  {operation.LogOpration}
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>{t("close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
