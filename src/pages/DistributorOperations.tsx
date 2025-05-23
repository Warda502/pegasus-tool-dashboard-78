
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { OperationDetailsDialog } from "@/components/operations/OperationDetailsDialog";
import { Search, RefreshCw, FileText, Filter } from "lucide-react";
import { formatTimeString } from "@/hooks/useSharedData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Operation {
  operation_id: string;
  operation_type: string;
  phone_sn: string;
  brand: string;
  model: string;
  imei: string;
  username: string;
  credit: string;
  time: string;
  status: string;
  uid: string;
  [key: string]: any;
}

const DistributorOperations = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [operationTypeFilter, setOperationTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [distributorId, setDistributorId] = useState<string | null>(null);
  const [operationTypes, setOperationTypes] = useState<string[]>([]);
  const [statusTypes, setStatusTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchDistributorId = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('distributors')
          .select('id')
          .eq('uid', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching distributor id:", error);
          return;
        }
        
        setDistributorId(data.id);
      } catch (err) {
        console.error("Error in fetchDistributorId:", err);
      }
    };
    
    fetchDistributorId();
  }, [user]);

  useEffect(() => {
    const fetchOperations = async () => {
      if (!distributorId) return;
      
      try {
        setLoading(true);
        
        // Get users assigned to this distributor
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('uid')
          .eq('distributor_id', distributorId);
          
        if (usersError) {
          console.error("Error fetching distributor users:", usersError);
          return;
        }
        
        if (!users || users.length === 0) {
          setOperations([]);
          setLoading(false);
          return;
        }
        
        // Get user UIDs
        const userUids = users.map(user => user.uid).filter(Boolean);
        
        // Fetch operations for these users
        const { data, error } = await supabase
          .from('operations')
          .select('*')
          .in('uid', userUids)
          .order('time', { ascending: false });
          
        if (error) {
          console.error("Error fetching operations:", error);
          return;
        }
        
        setOperations(data);
        
        // Extract unique operation types and statuses for filters
        const types = [...new Set(data.map(op => op.operation_type))].filter(Boolean);
        const statuses = [...new Set(data.map(op => op.status))].filter(Boolean);
        
        setOperationTypes(types);
        setStatusTypes(statuses);
      } catch (err) {
        console.error("Error in fetchOperations:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOperations();
  }, [distributorId]);

  const handleViewDetails = (operation: Operation) => {
    setSelectedOperation(operation);
    setShowDetailsDialog(true);
  };

  const handleRefresh = async () => {
    if (!distributorId) return;
    
    setLoading(true);
    
    try {
      // Get users assigned to this distributor
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('uid')
        .eq('distributor_id', distributorId);
        
      if (usersError) {
        console.error("Error fetching distributor users:", usersError);
        return;
      }
      
      if (!users || users.length === 0) {
        setOperations([]);
        setLoading(false);
        return;
      }
      
      // Get user UIDs
      const userUids = users.map(user => user.uid).filter(Boolean);
      
      // Fetch operations for these users
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .in('uid', userUids)
        .order('time', { ascending: false });
        
      if (error) {
        console.error("Error refreshing operations:", error);
        return;
      }
      
      setOperations(data);
      toast.success(t("success"), {
        description: t("dataRefreshed") || "Data refreshed successfully"
      });
    } catch (err) {
      console.error("Error in refreshOperations:", err);
      toast.error(t("error"), {
        description: t("refreshError") || "Error refreshing data"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setOperationTypeFilter("");
    setDateFilter(undefined);
  };

  const filteredOperations = operations.filter(op => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (op.username?.toLowerCase().includes(searchLower) || false) ||
      (op.model?.toLowerCase().includes(searchLower) || false) ||
      (op.imei?.toLowerCase().includes(searchLower) || false) ||
      (op.operation_id?.toLowerCase().includes(searchLower) || false);
      
    const matchesStatus = !statusFilter || op.status === statusFilter;
    const matchesType = !operationTypeFilter || op.operation_type === operationTypeFilter;
    
    const matchesDate = !dateFilter || (
      op.time && op.time.includes(format(dateFilter, 'yyyy/MM/dd'))
    );
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("operations") || "Operations"}</h1>
        
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("refresh")}
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchOperations") || "Search operations..."}
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={operationTypeFilter} onValueChange={setOperationTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t("operationType") || "Operation Type"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("all") || "All"}</SelectItem>
              {operationTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t("status") || "Status"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("all") || "All"}</SelectItem>
              {statusTypes.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Calendar className="h-4 w-4 mr-2" />
                {dateFilter ? format(dateFilter, 'yyyy/MM/dd') : t("date") || "Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            {t("resetFilters") || "Reset"}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("operationsHistory") || "Operations History"}</CardTitle>
          <CardDescription>
            {t("operationsDescription") || "View operations history for your users"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("operationId")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("model")}</TableHead>
                  <TableHead>{t("credit")}</TableHead>
                  <TableHead>{t("time")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-10 w-10 mb-2" />
                        <p>{t("noOperationsFound") || "No operations found"}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOperations.map((operation) => (
                    <TableRow key={operation.operation_id}>
                      <TableCell className="font-mono text-xs">
                        {operation.operation_id?.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{operation.operation_type}</TableCell>
                      <TableCell>{operation.username}</TableCell>
                      <TableCell>{operation.model}</TableCell>
                      <TableCell>{operation.credit}</TableCell>
                      <TableCell>{formatTimeString(operation.time || "")}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          operation.status === "Success" ? "bg-green-100 text-green-800" : 
                          operation.status === "Failed" ? "bg-red-100 text-red-800" : 
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {operation.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(operation)}
                        >
                          {t("viewDetails")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Operation Details Dialog */}
      {selectedOperation && (
        <OperationDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          operation={selectedOperation}
        />
      )}
    </div>
  );
};

export default DistributorOperations;
