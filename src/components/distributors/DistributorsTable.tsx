
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useDistributors } from "@/hooks/useDistributors";
import type { Distributor } from "@/hooks/data/types/distributors";
import { Edit, Wallet, Users, History, MoreHorizontal, Eye } from "lucide-react";

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
} from "@/components/ui";

import { EditDistributorDialog } from "./EditDistributorDialog";
import { AddCreditsDialog } from "./AddCreditsDialog";
import { ManageUsersDialog } from "./ManageUsersDialog";
import { TransactionsDialog } from "./TransactionsDialog";
import { ViewDistributorDialog } from "./ViewDistributorDialog";

export function DistributorsTable() {
  const { t } = useLanguage();
  const { distributors, isLoadingDistributors, refetchDistributors } = useDistributors();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredDistributors = distributors.filter((distributor) => {
    const matchesSearch =
      distributor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      distributor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (distributor.phone && distributor.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || distributor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoadingDistributors) {
    return (
      <Card className="p-6">
        <div className="text-center">{t("loading")}...</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder={t("searchDistributors")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {t("status")}: {t(statusFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                {t("all")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                {t("active")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                {t("inactive")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("credits")}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("commission")}
              </TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="w-[80px] text-right">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDistributors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  {t("noDistributorsFound")}
                </TableCell>
              </TableRow>
            ) : (
              filteredDistributors.map((distributor) => (
                <TableRow key={distributor.id}>
                  <TableCell>
                    <div className="font-medium">{distributor.name}</div>
                    <div className="text-sm text-muted-foreground hidden sm:block">
                      {distributor.country || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate">{distributor.email}</div>
                    <div className="text-sm text-muted-foreground hidden sm:block">
                      {distributor.phone || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{distributor.credits_balance.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">
                      {t("maxLimit")}: {distributor.max_credit_limit.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {distributor.commission_rate}%
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        distributor.status === "active" ? "outline" : "secondary"
                      }
                      className={
                        distributor.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-400 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900 dark:border-green-700"
                          : "bg-red-100 text-red-800 hover:bg-red-100 border-red-400 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-900 dark:border-red-700"
                      }
                    >
                      {distributor.status === "active" ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">{t("actions")}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <ViewDistributorDialog distributor={distributor}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Eye className="mr-2 h-4 w-4" />
                              {t("view")}
                            </DropdownMenuItem>
                          </ViewDistributorDialog>

                          <DropdownMenuSeparator />

                          <EditDistributorDialog 
                            distributor={distributor} 
                            onEditSuccess={refetchDistributors}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("edit")}
                            </DropdownMenuItem>
                          </EditDistributorDialog>

                          <AddCreditsDialog 
                            distributor={distributor} 
                            onSuccess={refetchDistributors}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Wallet className="mr-2 h-4 w-4" />
                              {t("manageCredits")}
                            </DropdownMenuItem>
                          </AddCreditsDialog>

                          <ManageUsersDialog 
                            distributor={distributor} 
                            onSuccess={refetchDistributors}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Users className="mr-2 h-4 w-4" />
                              {t("manageUsers")}
                            </DropdownMenuItem>
                          </ManageUsersDialog>

                          <TransactionsDialog distributor={distributor}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <History className="mr-2 h-4 w-4" />
                              {t("transactions")}
                            </DropdownMenuItem>
                          </TransactionsDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
