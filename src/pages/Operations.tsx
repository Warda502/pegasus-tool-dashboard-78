
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LineChart, Search, FileDown, RefreshCw, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { useSharedData, formatTimeString, useLanguage, Operation, refundOperation } from "@/hooks/useSharedData";
import { OperationDetailsDialog } from "@/components/operations/OperationDetailsDialog";

export default function Operations() {
  const { operations, isLoading, refreshData } = useSharedData();
  const { t, language, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Filter operations based on search term
  const filteredOperations = operations.filter((op) => {
    if (searchTerm.trim() === "") return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      op.OprationID?.toLowerCase().includes(searchLower) ||
      op.OprationTypes?.toLowerCase().includes(searchLower) ||
      op.Phone_SN?.toLowerCase().includes(searchLower) ||
      op.Brand?.toLowerCase().includes(searchLower) ||
      op.Model?.toLowerCase().includes(searchLower) ||
      op.Imei?.toLowerCase().includes(searchLower) ||
      op.UserName?.toLowerCase().includes(searchLower) ||
      op.Status?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOperations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOperations.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    // Only show pagination if we have items
    if (filteredOperations.length === 0) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => paginate(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {totalPages <= 7 ? (
            // If fewer than 7 pages, show all
            [...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => paginate(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))
          ) : (
            // If more than 7 pages, show smart pagination
            <>
              {/* Always show first page */}
              <PaginationItem>
                <PaginationLink
                  onClick={() => paginate(1)}
                  isActive={currentPage === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>

              {/* Show ellipsis if current page is more than 3 */}
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Show current page and surrounding pages */}
              {[...Array(5)].map((_, i) => {
                const pageNum = currentPage - 2 + i;
                if (pageNum > 1 && pageNum < totalPages) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => paginate(pageNum)}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              {/* Show ellipsis if current page is less than totalPages - 2 */}
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Always show last page */}
              <PaginationItem>
                <PaginationLink
                  onClick={() => paginate(totalPages)}
                  isActive={currentPage === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => paginate(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Handle view details
  const handleViewDetails = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsDetailsDialogOpen(true);
  };

  // Handle refund
  const handleRefund = async (operation: Operation) => {
    const success = await refundOperation(operation);
    
    if (success) {
      toast(t("refundSuccess"), {
        description: t("refundDescription")
      });
      refreshData();
    } else {
      toast("Error", {
        description: "Failed to process refund"
      });
    }
  };

  // Update time display in tables
  const renderTable = (operations: Operation[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{t("operationID")}</TableHead>
            <TableHead>{t("operationType")}</TableHead>
            <TableHead>{t("brand")}</TableHead>
            <TableHead>{t("model")}</TableHead>
            <TableHead>{t("imei")}</TableHead>
            <TableHead>{t("user")}</TableHead>
            <TableHead>{t("credit")}</TableHead>
            <TableHead>{t("time")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.length > 0 ? (
            operations.map((op) => (
              <TableRow key={op.OprationID}>
                <TableCell className="font-medium">{op.OprationID}</TableCell>
                <TableCell>{op.OprationTypes}</TableCell>
                <TableCell>{op.Brand}</TableCell>
                <TableCell>{op.Model}</TableCell>
                <TableCell>{op.Imei}</TableCell>
                <TableCell>{op.UserName}</TableCell>
                <TableCell>{op.Credit}</TableCell>
                <TableCell dir="ltr" className="text-right">{formatTimeString(op.Time)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    op.Status?.toLowerCase() === "success" || op.Status?.toLowerCase() === "succeeded"
                      ? "bg-green-100 text-green-800"
                      : op.Status?.toLowerCase() === "failed" || op.Status?.toLowerCase() === "failure"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {op.Status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(op)}>
                      <FileText className="h-4 w-4 mr-1" />
                      {t("details")}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRefund(op)}
                      disabled={!op.Credit || op.Credit === "0.0"}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      {t("refund")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                {isLoading ? t("loading") : t("noData")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const handleRefresh = () => {
    refreshData();
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      t("operationID"),
      t("operationType"),
      t("serialNumber"),
      t("brand"),
      t("model"),
      t("imei"),
      t("user"),
      t("credit"),
      t("time"),
      t("status"),
      t("android"),
      t("baseband"),
      t("carrier"),
      t("securityPatch"),
      t("uid"),
      t("hwid"),
      "Log"
    ];

    const csvRows = [
      headers.join(','),
      ...filteredOperations.map(op => [
        op.OprationID,
        op.OprationTypes,
        op.Phone_SN,
        op.Brand,
        op.Model,
        op.Imei,
        op.UserName,
        op.Credit,
        op.Time,
        op.Status,
        op.Android,
        op.Baseband,
        op.Carrier,
        op.Security_Patch,
        op.UID,
        op.Hwid,
        op.LogOpration
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `operations_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast(t("exported"), {
      description: t("exportSuccess")
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              <span>{t("operations")}</span>
            </CardTitle>
            <CardDescription>
              {t("operationsManagement")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("refresh")}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <FileDown className="h-4 w-4 mr-2" />
              {t("export")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("search")}
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {t("filter")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSearchTerm("Succeeded")}>
                  {t("successfulOperations")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("Failed")}>
                  {t("failedOperations")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("")}>
                  {t("showAll")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {renderTable(currentItems)}

          {renderPagination()}

          <div className="text-sm text-muted-foreground">
            {t("totalOperations")
              .replace("{0}", filteredOperations.length.toString())
              .replace("{1}", (indexOfFirstItem + 1).toString())
              .replace("{2}", Math.min(indexOfLastItem, filteredOperations.length).toString())
            }
          </div>
        </CardContent>
      </Card>

      {/* Operation Details Dialog */}
      <OperationDetailsDialog 
        operation={selectedOperation}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />
    </div>
  );
}
