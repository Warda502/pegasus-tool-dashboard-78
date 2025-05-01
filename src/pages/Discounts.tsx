
import { useState } from "react";
import { useDiscounts } from "@/hooks/useDiscounts";
import { useLanguage } from "@/hooks/useLanguage";
import { useSharedData } from "@/hooks/useSharedData";
import { Loading } from "@/components/ui/loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Tags, FileDown, RefreshCw } from "lucide-react";
import { AddDiscountDialog } from "@/components/discounts/AddDiscountDialog";
import { DiscountsTable } from "@/components/discounts/DiscountsTable";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";

export default function Discounts() {
  const { t, isRTL } = useLanguage();
  const { data: discounts, isLoading, error } = useDiscounts();
  const { users } = useSharedData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['discounts'] });
  };

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['discounts'] });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['discounts'] });
    toast(t("refreshingData") || "Refreshing data...");
  };

  const exportToCSV = () => {
    if (!discounts || discounts.length === 0) {
      toast(t("noDataToExport") || "No data to export");
      return;
    }
    
    // Create CSV content
    const headers = [
      t("email") || "Email",
      t("model") || "Model",
      t("refundAmount") || "Refund Amount",
      t("remainingDiscounts") || "Remaining Discounts"
    ];

    const csvRows = [
      headers.join(','),
      ...discounts.map(discount => [
        discount.email,
        discount.model,
        discount.count_refund,
        discount.number_discounts
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `discounts_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast(t("exported") || "Exported", {
      description: t("exportSuccess") || "Data exported successfully"
    });
  };

  // Filter discounts based on search query
  const filteredDiscounts = discounts?.filter(discount => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      discount.email?.toLowerCase().includes(query) ||
      discount.model?.toLowerCase().includes(query)
    );
  }) || [];

  if (isLoading) {
    return <Loading text={t("loadingData") || "Loading data..."} />;
  }

  if (error) {
    return (
      <ErrorAlert
        title={t("errorLoadingData") || "Error Loading Data"}
        description={(error as Error).message || (t("pleaseRefreshPage") || "Please try refreshing the page.")}
      />
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Tags className="h-5 w-5" />
              <span>{t("discounts") || "Discounts"}</span>
            </CardTitle>
            <CardDescription>
              {t("manageDiscounts") || "Manage user discounts"}
              {discounts && discounts.length > 0 && (
                <span className="ml-2 font-medium">
                  ({discounts.length} {t("totalRecords") || "total records"})
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("refresh") || "Refresh"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <FileDown className="h-4 w-4 mr-2" />
              {t("export") || "Export"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <div className="relative flex-1">
              <Input
                placeholder={t("searchDiscounts") || "Search discounts..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:max-w-xs"
              />
            </div>
            
            <Button onClick={() => setIsAddDialogOpen(true)} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              {t("addNewDiscount") || "Add New Discount"}
            </Button>
          </div>
          
          <DiscountsTable data={filteredDiscounts} onDeleteSuccess={handleDeleteSuccess} />
        </CardContent>
      </Card>
      
      <AddDiscountDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        users={users || []}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
