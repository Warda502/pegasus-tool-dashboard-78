
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: {
    accessorKey?: string;
    id?: string;
    header?: string | React.ReactNode;
    cell?: ({ row }: { row: any }) => React.ReactNode;
  }[];
  data: TData[];
  emptyMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "No data available",
}: DataTableProps<TData, TValue>) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={column.id || column.accessorKey || index}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, colIndex) => (
                <TableCell key={column.id || column.accessorKey || colIndex}>
                  {column.cell 
                    ? column.cell({ row }) 
                    : column.accessorKey 
                      ? (row as any)[column.accessorKey] 
                      : null}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
