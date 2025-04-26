
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
import { useLanguage } from "@/hooks/useLanguage";

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
    Object.values(item).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder={t("search") || "Search..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("email") || "Email"}</TableHead>
              <TableHead>{t("hwid") || "HWID"}</TableHead>
              <TableHead>{t("imei") || "IMEI"}</TableHead>
              <TableHead>{t("model") || "Model"}</TableHead>
              <TableHead>{t("phoneSn") || "Phone S/N"}</TableHead>
              <TableHead>{t("notes") || "Notes"}</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
