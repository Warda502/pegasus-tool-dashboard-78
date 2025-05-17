
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Pencil, 
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { Distributor } from "@/hooks/data/types";
import { Skeleton } from "@/components/ui/skeleton";

interface DistributorsTableProps {
  distributors: Distributor[];
  isLoading: boolean;
  onViewDistributor: (distributor: Distributor) => void;
  onEditDistributor: (distributor: Distributor) => void;
  onDeleteDistributor: (id: string, uid?: string) => void;
}

export function DistributorsTable({
  distributors,
  isLoading,
  onViewDistributor,
  onEditDistributor,
  onDeleteDistributor
}: DistributorsTableProps) {
  const { t, isRTL } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  if (distributors.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-muted/30">
        <p className="text-muted-foreground">
          {t("noDistributorsFound") || "No distributors found"}
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table dir={isRTL ? "rtl" : "ltr"}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{t("id") || "ID"}</TableHead>
            <TableHead>{t("name") || "Name"}</TableHead>
            <TableHead>{t("email") || "Email"}</TableHead>
            <TableHead>{t("phone") || "Phone"}</TableHead>
            <TableHead>{t("country") || "Country"}</TableHead>
            <TableHead>{t("website") || "Website"}</TableHead>
            <TableHead>{t("commission") || "Commission Rate"}</TableHead>
            <TableHead className="text-right">{t("actions") || "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {distributors.map((distributor) => (
            <TableRow key={distributor.id}>
              <TableCell className="font-medium">{distributor.id.substring(0, 8)}</TableCell>
              <TableCell>{distributor.user?.name || "-"}</TableCell>
              <TableCell>{distributor.user?.email || "-"}</TableCell>
              <TableCell>{distributor.user?.phone || "-"}</TableCell>
              <TableCell>{distributor.user?.country || "-"}</TableCell>
              <TableCell>{distributor.website || "-"}</TableCell>
              <TableCell>{distributor.commission_rate || "0"}%</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDistributor(distributor)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">{t("view") || "View"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditDistributor(distributor)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">{t("edit") || "Edit"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDeleteDistributor(distributor.id, distributor.uid)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{t("delete") || "Delete"}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
