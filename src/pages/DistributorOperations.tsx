
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Activity, RefreshCcw, AlertTriangle, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useDistributorOperations } from "@/hooks/useDistributorOperations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ServerHistoryItem {
  id: string;
  distributor_id: string;
  operation_type: string;
  operation_details: Record<string, any>;
  amount: number;
  timestamp: string;
  status: string;
  target_user_id: string | null;
}

export default function DistributorOperations() {
  const { isRTL, t } = useLanguage();
  const { isAuthenticated, isDistributor } = useAuth();
  const { fetchServerHistory } = useDistributorOperations();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOperations, setFilteredOperations] = useState<ServerHistoryItem[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<ServerHistoryItem | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { data: operations = [], isLoading, refetch } = useQuery({
    queryKey: ["server_history"],
    queryFn: fetchServerHistory,
    enabled: isAuthenticated && isDistributor,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleViewOperation = (operation: ServerHistoryItem) => {
    setSelectedOperation(operation);
    setIsDetailsDialogOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Filter operations based on search query
    const filtered = operations.filter(op => {
      return query.trim() === "" || 
        op.operation_type.toLowerCase().includes(query.toLowerCase()) ||
        op.status.toLowerCase().includes(query.toLowerCase());
    });
    
    setFilteredOperations(filtered);
  };

  // Initialize filtered operations when operations change
  useEffect(() => {
    handleSearch(searchQuery);
  }, [operations, searchQuery]);

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "yyyy/MM/dd HH:mm");
    } catch {
      return timestamp;
    }
  };

  const getOperationTypeDisplay = (type: string) => {
    switch (type) {
      case 'add_user':
        return t('addUser') || 'Add User';
      case 'delete_user':
        return t('deleteUser') || 'Delete User';
      case 'add_credits':
        return t('addCredits') || 'Add Credits';
      default:
        return type;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span>{t("serverHistory") || "Server History"}</span>
            </CardTitle>
            <CardDescription>
              {t("serverHistoryDescription") || "View your server operations history"}
              {operations.length > 0 && (
                <span className="ml-2 font-medium">
                  ({operations.length} {t("totalOperations") || "total operations"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="w-full md:w-80">
              <Input
                placeholder={t("searchOperations") || "Search operations..."}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              {t("refresh") || "Refresh"}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : filteredOperations.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-start font-medium">{t("operationType") || "Operation Type"}</th>
                    <th className="p-2 text-start font-medium">{t("timestamp") || "Timestamp"}</th>
                    <th className="p-2 text-start font-medium">{t("status") || "Status"}</th>
                    <th className="p-2 text-start font-medium">{t("actions") || "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperations.map((op) => (
                    <tr key={op.id} className="border-t">
                      <td className="p-2">
                        {getOperationTypeDisplay(op.operation_type)}
                      </td>
                      <td className="p-2">{formatTimestamp(op.timestamp)}</td>
                      <td className="p-2">
                        <Badge
                          variant={
                            op.status === 'completed'
                              ? 'success'
                              : op.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {op.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOperation(op)}
                        >
                          {t("details") || "Details"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center bg-muted/20 rounded-md">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">
                {t("noOperationsFound") || "No operations found"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchQuery
                  ? t("noOperationsMatchSearch") || "No operations match your search query"
                  : t("noOperationsYet") || "You don't have any operations recorded yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operation details dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("operationDetails") || "Operation Details"}</DialogTitle>
            <DialogDescription>
              {selectedOperation && getOperationTypeDisplay(selectedOperation.operation_type)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOperation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">{t("operationId") || "Operation ID"}:</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedOperation.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t("status") || "Status"}:</p>
                  <Badge variant={getStatusBadgeVariant(selectedOperation.status)}>
                    {selectedOperation.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <p className="text-sm">{formatTimestamp(selectedOperation.timestamp)}</p>
              </div>

              {selectedOperation.target_user_id && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <p className="text-sm">
                    {t("targetUser") || "Target User"}: {selectedOperation.target_user_id}
                  </p>
                </div>
              )}

              {selectedOperation.amount > 0 && (
                <div>
                  <p className="text-sm font-medium">{t("amount") || "Amount"}:</p>
                  <p className="text-sm">{selectedOperation.amount}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium">{t("details") || "Details"}:</p>
                <div className="mt-1 p-2 rounded bg-muted/50 overflow-auto max-h-64">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(selectedOperation.operation_details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
