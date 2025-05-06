
import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = data.filter((item) =>
    Object.entries(item).some(([key, value]) => {
      if (key === "ImeiSign" || key === "PubKey" || key === "PubKeySign")
        return false;
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const handleExportRow = (row: CertFile) => {
    // Format data according to the requested format
    const exportData = `[${row.Notes || ""}]\nIMEI=${row.Imei || ""}\nImeiSign=${
      row.ImeiSign || ""
    }\nPubKey=${row.PubKey || ""}\nPubKeySign=${row.PubKeySign || ""}`;

    const model = row.Model || "Unknown";
    const imei = row.Imei || "Unknown";
    const phoneSn = row.Phone_sn || "Unknown";
    const fileName = `${model}_${imei}_${phoneSn}.Cert`;

    const blob = new Blob([exportData], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
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

  // Enhanced design to match DiscountsTable
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 px-6">
        <div className="relative">
          <Search className={`absolute top-2.5 ${isRTL ? 'right-2.5' : 'left-2.5'} h-4 w-4 text-muted-foreground`} />
          <Input
            type="search"
            placeholder={t("search") || "Search..."}
            className={`w-full ${isRTL ? 'pr-8' : 'pl-8'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-330px)] sm:h-[calc(100vh-320px)]">
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
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <TableRow key={item.uid} className="text-xs sm:text-sm">
                    <TableCell className="max-w-[100px] truncate">{item.Email}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{item.Hwid}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{item.Imei}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{item.Model}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{item.Phone_sn}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{item.Notes}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportRow(item)}
                        className="h-8 px-2 text-xs"
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        {t("export") || "Export"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    {searchTerm
                      ? t("noSearchResults") || "No matching results found"
                      : t("noData") || "No data available"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {filteredData.length > itemsPerPage && (
          <div className="border-t p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {t("showingResults") || "Showing"} {startIndex + 1} -{" "}
                {Math.min(endIndex, filteredData.length)} {t("of") || "of"}{" "}
                {filteredData.length}
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => paginate(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 || 
                        page === totalPages || 
                        page === currentPage ||
                        page === currentPage - 1 ||
                        page === currentPage + 1
                      );
                    })
                    .map((page, index, array) => (
                      <PaginationItem key={page}>
                        {/* Add ellipsis if there's a gap */}
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <PaginationItem>
                            <PaginationLink
                              aria-disabled="true"
                              className="pointer-events-none"
                            >
                              ...
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        <PaginationLink
                          onClick={() => paginate(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => paginate(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
