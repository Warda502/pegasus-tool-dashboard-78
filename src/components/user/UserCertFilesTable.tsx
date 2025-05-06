
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
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Card } from "@/components/ui/card";

// Interface for CertFile
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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
    
    const model = row.Model || 'Unknown';
    const imei = row.Imei || 'Unknown';
    const phoneSn = row.Phone_sn || 'Unknown';
    const fileName = `${model}_${imei}_${phoneSn}.Cert`;
    
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success(t("exportSuccess") || "Data exported successfully");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-4">
      <div className="relative flex-1">
        <Search className={`absolute ${isRTL ? 'right-2.5' : 'left-2.5'} top-2.5 h-4 w-4 text-muted-foreground`} />
        <Input
          type="search"
          placeholder={t("search") || "Search..."}
          className={`w-full ${isRTL ? 'pr-8' : 'pl-8'}`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>

      <Card className="border">
        <div className="overflow-hidden">
          <ScrollArea className="h-[calc(100vh-450px)] sm:h-[calc(100vh-420px)]">
            <div className="overflow-x-auto min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">{t("email") || "Email"}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("hwid") || "HWID"}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("imei") || "IMEI"}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("model") || "Model"}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("phoneSn") || "Phone S/N"}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("notes") || "Notes"}</TableHead>
                    <TableHead className={`${isRTL ? 'text-left' : 'text-right'} whitespace-nowrap`}>{t("actions") || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <TableRow 
                        key={item.uid} 
                        className="text-xs sm:text-sm hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="max-w-[100px] truncate">{item.Email}</TableCell>
                        <TableCell className="max-w-[80px] truncate">{item.Hwid}</TableCell>
                        <TableCell className="max-w-[80px] truncate">{item.Imei}</TableCell>
                        <TableCell className="max-w-[80px] truncate">{item.Model}</TableCell>
                        <TableCell className="max-w-[80px] truncate">{item.Phone_sn}</TableCell>
                        <TableCell className="max-w-[80px] truncate">{item.Notes}</TableCell>
                        <TableCell className={`${isRTL ? 'text-left' : 'text-right'}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportRow(item)}
                            className="hover:bg-accent h-7 px-2 text-xs"
                          >
                            <Download className={`h-3 w-3 sm:h-4 sm:w-4 ${isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2'}`} />
                            {t("export") || "Export"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        {searchTerm 
                          ? t("noData") || "No matching data found" 
                          : t("noData") || "No data available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </Card>

      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {t("showingResults") || "Showing"} {startIndex + 1} - {Math.min(endIndex, filteredData.length)} {t("of") || "of"} {filteredData.length}
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>
            
            <div className="flex items-center justify-center text-sm font-medium min-w-[4rem]">
              {currentPage} / {totalPages || 1}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
