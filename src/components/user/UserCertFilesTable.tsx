
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
  const { t } = useLanguage();
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
        <ScrollArea className="h-[calc(100vh-420px)] sm:h-[calc(100vh-400px)]">
          <div className="overflow-x-auto">
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
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportRow(item)}
                          className="hover:bg-accent h-7 px-2 text-xs"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {t("export")}
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
        </ScrollArea>
      </div>

      {filteredData.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {t("showingResults") || "Showing"} {startIndex + 1} - {Math.min(endIndex, filteredData.length)} {t("of") || "of"} {filteredData.length}
          </div>
          <Pagination className="mt-0">
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => paginate(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} className={totalPages > 5 && (page > 2 && page < totalPages - 1 && page !== currentPage) ? "hidden sm:flex" : ""}>
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
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
