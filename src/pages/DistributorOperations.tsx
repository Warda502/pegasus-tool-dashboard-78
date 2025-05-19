
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCcw, Search, Calendar as CalendarIcon, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";

interface Operation {
  operation_id: string;
  operation_type: string;
  model: string;
  brand: string;
  username: string;
  time: string;
  credit: string;
  status: string;
  imei: string;
  phone_sn: string;
  hwid: string;
}

export default function DistributorOperations() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [operations, setOperations] = useState<Operation[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributorId, setDistributorId] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [operationType, setOperationType] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  const fetchDistributorId = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_distributor_id');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setDistributorId(data);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching distributor ID:", error);
      toast({
        title: t("error") || "خطأ",
        description: (error as Error).message,
        variant: "destructive"
      });
      return null;
    }
  };
  
  const fetchOperations = async (distributorId: string) => {
    setLoading(true);
    try {
      // First, get all users under this distributor
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('uid')
        .eq('distributor_id', distributorId);
        
      if (usersError) {
        throw usersError;
      }
      
      if (!usersData || usersData.length === 0) {
        setOperations([]);
        setFilteredOperations([]);
        setLoading(false);
        return;
      }
      
      // Extract user IDs
      const userIds = usersData.map(user => user.uid);
      
      // Fetch operations for these users
      const { data: operationsData, error: operationsError } = await supabase
        .from('operations')
        .select('*')
        .in('uid', userIds)
        .order('time', { ascending: false });
        
      if (operationsError) {
        throw operationsError;
      }
      
      setOperations(operationsData as Operation[]);
      setFilteredOperations(operationsData as Operation[]);
    } catch (error) {
      console.error("Error fetching operations:", error);
      toast({
        title: t("error") || "خطأ",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const init = async () => {
      const id = await fetchDistributorId();
      if (id) {
        fetchOperations(id);
      }
    };
    
    init();
  }, [user?.id]);
  
  useEffect(() => {
    applyFilters();
  }, [searchTerm, operationType, dateFrom, dateTo, sortField, sortDirection]);
  
  const applyFilters = () => {
    let filtered = [...operations];
    
    // Apply search term filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(op => 
        (op.username?.toLowerCase().includes(lowerSearch)) ||
        (op.model?.toLowerCase().includes(lowerSearch)) ||
        (op.operation_id?.toLowerCase().includes(lowerSearch)) ||
        (op.imei?.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Apply operation type filter
    if (operationType) {
      filtered = filtered.filter(op => op.operation_type === operationType);
    }
    
    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(op => {
        const opDate = new Date(op.time);
        const startDate = new Date(dateFrom);
        startDate.setHours(0, 0, 0, 0);
        return opDate >= startDate;
      });
    }
    
    if (dateTo) {
      filtered = filtered.filter(op => {
        const opDate = new Date(op.time);
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        return opDate <= endDate;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField as keyof Operation] || "";
      let bVal = b[sortField as keyof Operation] || "";
      
      // Handle date field
      if (sortField === "time") {
        return sortDirection === "asc" 
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }
      
      // Handle numeric fields
      if (sortField === "credit") {
        const aNum = parseFloat(aVal as string) || 0;
        const bNum = parseFloat(bVal as string) || 0;
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }
      
      // Handle string fields
      return sortDirection === "asc" 
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });
    
    setFilteredOperations(filtered);
  };
  
  const resetFilters = () => {
    setSearchTerm("");
    setOperationType(null);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSortField("time");
    setSortDirection("desc");
  };
  
  const refreshData = async () => {
    if (distributorId) {
      fetchOperations(distributorId);
    } else {
      const id = await fetchDistributorId();
      if (id) {
        fetchOperations(id);
      }
    }
  };
  
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const getOperationTypes = () => {
    const types = new Set<string>();
    operations.forEach(op => {
      if (op.operation_type) {
        types.add(op.operation_type);
      }
    });
    return Array.from(types);
  };
  
  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("distributorOperations") || "عمليات المستخدمين"}
        </h1>
        
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          {t("refresh") || "تحديث"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("filterOperations") || "تصفية العمليات"}</CardTitle>
          <CardDescription>
            {t("filterOperationsDesc") || "البحث وتصفية عمليات المستخدمين"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">{t("search") || "بحث"}</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t("searchPlaceholder") || "بحث باسم المستخدم أو الموديل..."}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">{t("operationType") || "نوع العملية"}</Label>
              <Select 
                value={operationType || ""} 
                onValueChange={(value) => setOperationType(value || null)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder={t("allOperations") || "كل العمليات"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("allOperations") || "كل العمليات"}</SelectItem>
                  {getOperationTypes().map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>{t("dateFrom") || "من تاريخ"}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? (
                      format(dateFrom, "PPP")
                    ) : (
                      <span>{t("pickDate") || "اختر تاريخ"}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>{t("dateTo") || "إلى تاريخ"}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? (
                      format(dateTo, "PPP")
                    ) : (
                      <span>{t("pickDate") || "اختر تاريخ"}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              {t("resetFilters") || "إعادة ضبط الفلاتر"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("operationsList") || "قائمة العمليات"}</CardTitle>
          <CardDescription>
            {t("totalOperations") || "إجمالي العمليات"}: {filteredOperations.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("operation_id")}>
                    <div className="flex items-center gap-1">
                      {t("operationId") || "رقم العملية"}
                      {sortField === "operation_id" && (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("username")}>
                    <div className="flex items-center gap-1">
                      {t("username") || "اسم المستخدم"}
                      {sortField === "username" && (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("operation_type")}>
                    <div className="flex items-center gap-1">
                      {t("operationType") || "نوع العملية"}
                      {sortField === "operation_type" && (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("model")}>
                    <div className="flex items-center gap-1">
                      {t("model") || "الموديل"}
                      {sortField === "model" && (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("credit")}>
                    <div className="flex items-center gap-1">
                      {t("credit") || "الرصيد"}
                      {sortField === "credit" && (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("time")}>
                    <div className="flex items-center gap-1">
                      {t("time") || "الوقت"}
                      {sortField === "time" && (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("status")}>
                    <div className="flex items-center gap-1">
                      {t("status") || "الحالة"}
                      {sortField === "status" && (
                        sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {t("loading") || "جاري التحميل..."}
                    </TableCell>
                  </TableRow>
                ) : filteredOperations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {t("noOperations") || "لا توجد عمليات"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOperations.map((operation, index) => (
                    <TableRow key={operation.operation_id || index}>
                      <TableCell className="font-medium">
                        {operation.operation_id}
                      </TableCell>
                      <TableCell>{operation.username}</TableCell>
                      <TableCell>{operation.operation_type}</TableCell>
                      <TableCell>
                        {operation.brand ? `${operation.brand} ` : ""}
                        {operation.model || "-"}
                      </TableCell>
                      <TableCell>{operation.credit || "-"}</TableCell>
                      <TableCell>
                        {operation.time ? new Date(operation.time).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          operation.status === 'Success' ? 'bg-green-100 text-green-800' :
                          operation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {operation.status === 'Success' ? (t("success") || "ناجحة") :
                           operation.status === 'Pending' ? (t("pending") || "قيد الإنتظار") :
                           (t("failed") || "فاشلة")}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
