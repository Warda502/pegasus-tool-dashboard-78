
import { useState } from "react";
import { useServerData } from "@/hooks/useServerData";
import { Loading } from "@/components/ui/loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Search, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface ApiData {
  Email: string | null;
  Hwid: string | null;
  Imei: string;
  ImeiSign: string | null;
  Model: string | null;
  Notes: string | null;
  Phone_sn: string | null;
  PubKey: string | null;
  PubKeySign: string | null;
  uid: string;
}

export default function ServerApiData() {
  const { data, isLoading, error } = useServerData();
  const { t, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search term
  const filteredData = data?.filter(item => 
    Object.entries(item).some(([key, value]) => {
      if (key === 'ImeiSign' || key === 'PubKey' || key === 'PubKeySign') return false;
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  ) || [];

  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  const handleExportRow = (row: ApiData) => {
    // Format data according to the requested format
    const exportData = `[${row.Notes || ''}]\nIMEI=${row.Imei || ''}\nImeiSign=${row.ImeiSign || ''}\nPubKey=${row.PubKey || ''}\nPubKeySign=${row.PubKeySign || ''}`;
    
    // Create file name using the format: {Model}_{IMEI}_{PhoneSN}.Cert
    const model = row.Model || 'Unknown';
    const imei = row.Imei || 'Unknown';
    const phoneSn = row.Phone_sn || 'Unknown';
    const fileName = `${model}_${imei}_${phoneSn}.Cert`;
    
    // Create a blob with the data
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success(t("exportSuccess") || "Data exported successfully");
  };

  if (isLoading) {
    return <Loading text={t("loadingData") || "Loading data..."} />;
  }

  if (error) {
    return (
      <ErrorAlert
        title={t("errorLoadingData") || "Error Loading Data"}
        description={t("pleaseRefreshPage") || "Please try refreshing the page."}
      />
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              <span>{t("serverApiData") || "Server API Data"}</span>
            </CardTitle>
            <CardDescription>
              {t("viewServerData") || "View and manage server API data"}
              {data && data.length > 0 && (
                <span className="ml-2 font-medium">
                  ({data.length} {t("totalRecords") || "total records"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search") || "Search..."}
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground border rounded-md">
              {t("noData") || "No data available"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">{t("email") || "Email"}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("hwid") || "HWID"}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("imei") || "IMEI"}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("model") || "Model"}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("phoneSn") || "Phone S/N"}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("notes") || "Notes"}</TableHead>
                    <TableHead className="text-right whitespace-nowrap">{t("actions") || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item) => (
                    <TableRow key={item.uid} className="text-xs sm:text-sm">
                      <TableCell className="max-w-[100px] truncate">{item.Email}</TableCell>
                      <TableCell className="max-w-[80px] truncate">{item.Hwid}</TableCell>
                      <TableCell className="max-w-[80px] truncate">{item.Imei}</TableCell>
                      <TableCell className="max-w-[80px] truncate">{item.Model}</TableCell>
                      <TableCell className="max-w-[80px] truncate">{item.Phone_sn}</TableCell>
                      <TableCell className="max-w-[80px] truncate">{item.Notes}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size={isMobile ? "sm" : "default"}
                          onClick={() => handleExportRow(item)}
                          className="hover:bg-accent"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t("export")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredData.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {t("showingResults") || "Showing"} {startIndex + 1} - {Math.min(endIndex, filteredData.length)} {t("of") || "of"} {filteredData.length}
              </div>
              <Pagination className="mt-0">
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
