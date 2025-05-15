
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Search, RefreshCw, FileText } from "lucide-react";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatTimeString } from "@/hooks/useSharedData";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DistributorOperation {
  id: string;
  distributor_id: string;
  operation_type: string;
  amount: number;
  timestamp: string;
  target_user_id: string | null;
  operation_details: any;
  status: string;
  username?: string; // Joined field
}

export default function DistributorOperations() {
  const { user, isDistributor } = useAuth();
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [operations, setOperations] = useState<DistributorOperation[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<DistributorOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOperation, setSelectedOperation] = useState<DistributorOperation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchOperations = async () => {
      setIsLoading(true);
      try {
        // Fetch operations for this distributor
        const { data, error } = await supabase
          .from('server_history')
          .select(`
            *,
            target_user:target_user_id(email, name)
          `)
          .eq('distributor_id', user.id)
          .order('timestamp', { ascending: false });
          
        if (error) throw error;
        
        // Process the data to include username
        const processedData = data.map(op => ({
          ...op,
          username: op.target_user?.name || op.target_user?.email || '-'
        }));
        
        setOperations(processedData);
        setFilteredOperations(processedData);
      } catch (error) {
        console.error("Error fetching operations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOperations();
  }, [user]);

  useEffect(() => {
    // Apply search filter when operations or search query changes
    if (!operations) return;
    
    const filtered = operations.filter(op => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        (op.operation_type.toLowerCase().includes(query)) ||
        (op.username?.toLowerCase().includes(query)) ||
        (op.status.toLowerCase().includes(query))
      );
    });
    
    setFilteredOperations(filtered);
  }, [operations, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefresh = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('server_history')
        .select(`
          *,
          target_user:target_user_id(email, name)
        `)
        .eq('distributor_id', user.id)
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      
      const processedData = data.map(op => ({
        ...op,
        username: op.target_user?.name || op.target_user?.email || '-'
      }));
      
      setOperations(processedData);
      setFilteredOperations(processedData);
    } catch (error) {
      console.error("Error refreshing operations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDetails = (operation: DistributorOperation) => {
    setSelectedOperation(operation);
    setIsDetailsOpen(true);
  };

  if (!isDistributor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("accessDenied")}</CardTitle>
          <CardDescription>{t("distributorAccessOnly")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              <span>{t("myOperations") || "My Operations"}</span>
            </CardTitle>
            <CardDescription>
              {t("distributorOperationsDesc") || "View your operation history"}
              {filteredOperations.length > 0 && (
                <span className="ml-2 font-medium">
                  ({filteredOperations.length} {t("totalOperations") || "total operations"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("searchOperations") || "Search operations..."}
                className="w-full pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("refresh")}
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("operationType")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("time")}</TableHead>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredOperations.length > 0 ? (
                  filteredOperations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell className="font-medium">
                        {operation.operation_type}
                      </TableCell>
                      <TableCell>
                        {operation.amount}
                      </TableCell>
                      <TableCell>
                        {formatTimeString(new Date(operation.timestamp).toISOString())}
                      </TableCell>
                      <TableCell>
                        {operation.username}
                      </TableCell>
                      <TableCell>
                        <span className={
                          operation.status === 'completed' 
                            ? 'text-green-600' 
                            : operation.status === 'pending' 
                              ? 'text-amber-500' 
                              : 'text-red-500'
                        }>
                          {operation.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetails(operation)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {t("viewDetails")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      {searchQuery 
                        ? t("noSearchResults") || "No operations match your search" 
                        : t("noOperationsFound") || "No operations found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("operationDetails")}</DialogTitle>
            <DialogDescription>
              {t("operationDetailsDesc") || "Detailed information about this operation"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOperation && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">{t("operationType")}</h4>
                  <p>{selectedOperation.operation_type}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">{t("operationDate")}</h4>
                  <p>{formatTimeString(new Date(selectedOperation.timestamp).toISOString())}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">{t("amount")}</h4>
                  <p>{selectedOperation.amount}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">{t("status")}</h4>
                  <p className={
                    selectedOperation.status === 'completed' 
                      ? 'text-green-600' 
                      : selectedOperation.status === 'pending' 
                        ? 'text-amber-500' 
                        : 'text-red-500'
                  }>
                    {selectedOperation.status}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">{t("targetUser")}</h4>
                  <p>{selectedOperation.username}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">{t("operationDetails")}</h4>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                  {JSON.stringify(selectedOperation.operation_details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
