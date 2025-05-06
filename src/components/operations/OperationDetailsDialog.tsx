import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Operation {
  id: string;
  operation_type: string;
  operation_data: any;
  created_at: string;
  user_id: string;
  user_email?: string;
  status?: string;
  credits?: number;
}

interface OperationDetailsDialogProps {
  operation: Operation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OperationDetailsDialog({
  operation,
  isOpen,
  onClose,
}: OperationDetailsDialogProps) {
  const { t, isRTL, currentLanguage } = useLanguage();

  if (!operation) return null;

  // Format the operation data for display
  const formatOperationData = (data: any) => {
    if (!data) return "No data";
    
    try {
      if (typeof data === "string") {
        try {
          // Try to parse if it's a JSON string
          const parsed = JSON.parse(data);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // If not JSON, return as is
          return data;
        }
      }
      
      // If it's already an object, stringify it
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error formatting operation data:", error);
      return "Error formatting data";
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "default";
    
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "success";
      case "failed":
      case "error":
        return "destructive";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {t("operationDetails") || "Operation Details"}
            {operation.status && (
              <Badge variant={getStatusColor(operation.status) as any}>
                {operation.status}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {t("operationId") || "Operation ID"}: {operation.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4 flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1">{t("type") || "Type"}</div>
              <div>{operation.operation_type}</div>
            </div>
            <div>
              <div className="font-medium mb-1">{t("date") || "Date"}</div>
              <div>{formatDate(operation.created_at)}</div>
            </div>
            {operation.user_email && (
              <div>
                <div className="font-medium mb-1">{t("user") || "User"}</div>
                <div>{operation.user_email}</div>
              </div>
            )}
            {operation.credits !== undefined && (
              <div>
                <div className="font-medium mb-1">{t("credits") || "Credits"}</div>
                <div>{operation.credits}</div>
              </div>
            )}
          </div>
          
          <div className="space-y-2 flex-1 overflow-hidden">
            <div className="font-medium">{t("operationData") || "Operation Data"}</div>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <pre className="text-xs whitespace-pre-wrap break-all">
                {formatOperationData(operation.operation_data)}
              </pre>
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>{t("close") || "Close"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
