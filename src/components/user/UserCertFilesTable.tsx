
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Download, Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";

interface CertFile {
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

interface UserCertFilesTableProps {
  data: CertFile[];
}

export function UserCertFilesTable({ data }: UserCertFilesTableProps) {
  const { t, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = data.filter(item => 
    Object.entries(item).some(([key, value]) => {
      if (key === 'ImeiSign' || key === 'PubKey' || key === 'PubKeySign') return false;
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const handleExportRow = (row: CertFile) => {
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

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  if (filteredData.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground border rounded-md">
        {searchTerm ? (t("noResultsFound") || "No results found") : (t("noData") || "No data available")}
      </div>
    );
  }

  const renderPagination = () => {
    // Only show pagination if we have items and more than one page
    if (filteredData.length === 0 || totalPages <= 1) return null;

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

  return (
    <div className="space-y-4">
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

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table dir={isRTL ? "rtl" : "ltr"}>
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
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <TableRow key={item.uid} className="text-xs sm:text-sm">
                    <TableCell className="font-medium max-w-[100px] truncate">{item.Email}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{item.Hwid}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{item.Imei}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{item.Model}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{item.Phone_sn}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{item.Notes}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size={isMobile ? "icon" : "sm"}
                        onClick={() => handleExportRow(item)}
                        className="hover:bg-accent h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4 text-blue-500" />
                        <span className="sr-only">{t("export") || "Export"}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {t("noData") || "No data available"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {renderPagination()}
      
      <div className="text-sm text-muted-foreground mt-2">
        {filteredData.length > 0 && (
          <>{t("showing") || "Showing"} {startIndex + 1} - {Math.min(endIndex, filteredData.length)} {t("of") || "of"} {filteredData.length} {t("records") || "records"}</>
        )}
      </div>
    </div>
  );
}
