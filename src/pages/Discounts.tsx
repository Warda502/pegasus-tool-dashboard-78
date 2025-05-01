
import { useState } from "react";
import { useDiscounts } from "@/hooks/useDiscounts";
import { useLanguage } from "@/hooks/useLanguage";
import { useSharedData } from "@/hooks/useSharedData";
import { Loading } from "@/components/ui/loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Tags, Search } from "lucide-react";
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
            <Button onClick={() => setIsAddDialogOpen(true)} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              {t("addNewDiscount") || "Add New Discount"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="relative w-full">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchDiscounts") || "Search discounts..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8"
              />
            </div>
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
