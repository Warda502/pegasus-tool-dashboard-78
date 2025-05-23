
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/useLanguage";
import type { Operation } from "@/hooks/data/types";

interface OperationDetailsDialogProps {
  operation: Operation | null;
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
}

export const OperationDetailsDialog = ({ operation, isOpen, onOpenChange }: OperationDetailsDialogProps) => {
  const { t, language, isRTL } = useLanguage();
  
  if (!operation) return null;

  const detailItems = [
    { label: t("operationID"), value: operation.operation_id },
    { label: t("operationType"), value: operation.operation_type },
    { label: t("serialNumber"), value: operation.phone_sn },
    { label: t("brand"), value: operation.brand },
    { label: t("model"), value: operation.model },
    { label: t("imei"), value: operation.imei },
    { label: t("user"), value: operation.username },
    { label: t("credit"), value: operation.credit },
    { label: t("time"), value: operation.time },
    { label: t("status"), value: operation.status },
    { label: t("android"), value: operation.android },
    { label: t("baseband"), value: operation.baseband },
    { label: t("carrier"), value: operation.carrier },
    { label: t("securityPatch"), value: operation.security_patch },
    { label: t("uid"), value: operation.uid },
    { label: t("hwid"), value: operation.hwid },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button onClick={() => onOpenChange(false)}>{t("close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
