
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
import { Download } from "lucide-react";
import { toast } from "@/components/ui/sonner";

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

interface ApiDataTableProps {
  data: ApiData[];
}

export function ApiDataTable({ data }: ApiDataTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => 
    Object.entries(item).some(([key, value]) => {
      if (key === 'ImeiSign' || key === 'PubKey' || key === 'PubKeySign') return false;
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  const handleExportRow = (row: ApiData) => {
    const exportData = {
      Email: row.Email,
      Hwid: row.Hwid,
      Imei: row.Imei,
      Model: row.Model,
      Notes: row.Notes,
      Phone_sn: row.Phone_sn,
      uid: row.uid,
      ImeiSign: row.ImeiSign,
      PubKey: row.PubKey,
      PubKeySign: row.PubKeySign
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_${row.Imei}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success(t("exportSuccess") || "Data exported successfully");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder={t("search") || "Search..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("email") || "Email"}</TableHead>
                <TableHead>{t("hwid") || "HWID"}</TableHead>
                <TableHead>{t("imei") || "IMEI"}</TableHead>
                <TableHead>{t("model") || "Model"}</TableHead>
                <TableHead>{t("phoneSn") || "Phone S/N"}</TableHead>
                <TableHead>{t("notes") || "Notes"}</TableHead>
                <TableHead className="text-right">{t("actions") || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.uid}>
                  <TableCell>{item.Email}</TableCell>
                  <TableCell>{item.Hwid}</TableCell>
                  <TableCell>{item.Imei}</TableCell>
                  <TableCell>{item.Model}</TableCell>
                  <TableCell>{item.Phone_sn}</TableCell>
                  <TableCell>{item.Notes}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExportRow(item)}
                      className="hover:bg-accent"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("export") || "Export"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
