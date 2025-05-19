
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, RefreshCw, Filter } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useSharedData, formatTimeString } from "@/hooks/useSharedData";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Operation } from "@/hooks/data/types";
import { OperationDetailsDialog } from "@/components/operations/OperationDetailsDialog";
import { useFetchOperations } from "@/hooks/data/useFetchOperations";

export default function DistributorOperations() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { isDistributor } = useAuth();
  const { operations, isLoading, refetch } = useFetchOperations();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (!isDistributor) {
      navigate('/dashboard');
    }
  }, [isDistributor, navigate]);

  useEffect(() => {
    // Filter operations based on search query and status
    const filtered = operations.filter(op => {
      const matchesSearch = searchQuery.trim() === "" || 
        (op.Imei || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (op.Model || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (op.Phone_SN || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (op.UserName || "").toString().toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "" || 
        (op.Status || "").toString().toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredOperations(filtered);
  }, [operations, searchQuery, statusFilter]);

  const handleViewDetails = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDetailsOpen(true);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {t("distributorOperations") || "عمليات المستخدمين"}
          </CardTitle>
          <CardDescription>
            {t("distributorOperationsDescription") || "عرض وإدارة عمليات المستخدمين التابعين للموزع"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t("searchOperations") || "بحث عن العمليات"} 
                className="pl-8" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder={t("filterStatus") || "فلترة الحالة"} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("allStatuses") || "كل الحالات"}</SelectItem>
                <SelectItem value="Completed">{t("completed") || "مكتمل"}</SelectItem>
                <SelectItem value="Pending">{t("pending") || "قيد الانتظار"}</SelectItem>
                <SelectItem value="Failed">{t("failed") || "فشل"}</SelectItem>
                <SelectItem value="Refunded">{t("refunded") || "مسترد"}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="ml-auto" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t("refresh") || "تحديث"}
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("user") || "المستخدم"}</TableHead>
                  <TableHead>{t("operationType") || "نوع العملية"}</TableHead>
                  <TableHead>{t("model") || "الموديل"}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("imei") || "IMEI"}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("time") || "الوقت"}</TableHead>
                  <TableHead>{t("credit") || "الرصيد"}</TableHead>
                  <TableHead>{t("status") || "الحالة"}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("actions") || "الإجراءات"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredOperations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {t("noOperationsFound") || "لم يتم العثور على عمليات"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOperations.map((operation, index) => (
                    <TableRow key={index} onClick={() => handleViewDetails(operation)} className="cursor-pointer">
                      <TableCell className="font-medium">{operation.UserName}</TableCell>
                      <TableCell>{operation.OprationTypes}</TableCell>
                      <TableCell>{operation.Model}</TableCell>
                      <TableCell className="hidden sm:table-cell">{operation.Imei}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatTimeString(operation.Time || "")}</TableCell>
                      <TableCell>{operation.Credit}</TableCell>
                      <TableCell>
                        <Badge variant={
                          operation.Status === "Completed" ? "default" :
                          operation.Status === "Pending" ? "outline" :
                          operation.Status === "Refunded" ? "secondary" :
                          "destructive"
                        }>
                          {operation.Status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(operation);
                        }}>
                          {t("view") || "عرض"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <OperationDetailsDialog
        isOpen={isDetailsOpen}
        operation={selectedOperation}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOperation(null);
        }}
        onRefund={null}  // Distributors can't refund operations
      />
    </div>
  );
}
