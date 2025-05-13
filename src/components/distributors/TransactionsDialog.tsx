
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useDistributors } from "@/hooks/useDistributors";
import { format } from "date-fns";
import type { Distributor } from "@/hooks/data/types/distributors";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "@/components/ui";

interface TransactionsDialogProps {
  distributor: Distributor;
  children?: React.ReactNode;
}

export function TransactionsDialog({
  distributor,
  children,
}: TransactionsDialogProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { useDistributorTransactions } = useDistributors();
  
  const { data: transactions = [], isLoading } = useDistributorTransactions(distributor.id);

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy/MM/dd HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{t('transactionHistory')}</DialogTitle>
          <DialogDescription>
            {t('transactionHistoryDescription', { name: distributor.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('amount')}</TableHead>
                <TableHead>{t('balance')}</TableHead>
                <TableHead>{t('notes')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    {t('loading')}...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    {t('noTransactions')}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {formatDateTime(transaction.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {transaction.amount >= 0 ? (
                          <ArrowUpCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <Badge variant={transaction.amount >= 0 ? "success" : "destructive"}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.new_balance.toFixed(1)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)} type="button">
            {t('close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
