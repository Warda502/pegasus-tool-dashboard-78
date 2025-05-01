
import { useState } from "react";
import { useDiscounts } from "@/hooks/useDiscounts";
import { useLanguage } from "@/hooks/useLanguage";
import { useSharedData } from "@/hooks/useSharedData";
import { Loading } from "@/components/ui/loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Tags } from "lucide-react";
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
          <div className="relative flex-1 w-full sm:max-w-xs">
            <div className="relative">
              <Input
                placeholder={t("searchDiscounts") || "Search discounts..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
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
