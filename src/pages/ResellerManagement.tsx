
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useFetchDistributors } from "@/hooks/data/useFetchDistributors";
import { useDistributorOperations } from "@/hooks/data/useDistributorOperations";
import { useDistributorDialogs } from "@/hooks/useDistributorDialogs";
import { ViewDistributorDialog } from "@/components/distributors/ViewDistributorDialog";
import { EditDistributorDialog } from "@/components/distributors/EditDistributorDialog";
import { AddDistributorDialog } from "@/components/distributors/AddDistributorDialog";
import { DistributorFilters } from "@/components/distributors/DistributorFilters";
import { DistributorHeaderActions } from "@/components/distributors/DistributorHeaderActions";
import { DistributorsTable } from "@/components/distributors/DistributorsTable";
import { Distributor } from "@/hooks/data/types";

export default function ResellerManagement() {
  const { distributors, isLoading, refetch } = useFetchDistributors();
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const {
    selectedDistributor,
    isViewDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    setIsViewDialogOpen,
    setIsEditDialogOpen,
    setIsAddDialogOpen,
    openViewDialog,
    openEditDialog,
    openAddDialog
  } = useDistributorDialogs();
  
  const { updateDistributor, addDistributor, deleteDistributor } = useDistributorOperations();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>(distributors);
  
  const handleRefresh = () => {
    refetch();
  };

  useEffect(() => {
    handleRefresh();
  }, []);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    const filtered = distributors.filter(distributor => {
      const matchesSearch = query.trim() === "" || 
        (distributor.user?.email?.toLowerCase().includes(query.toLowerCase())) ||
        (distributor.user?.name?.toLowerCase().includes(query.toLowerCase())) ||
        (distributor.user?.phone?.toLowerCase().includes(query.toLowerCase())) ||
        (distributor.user?.country?.toLowerCase().includes(query.toLowerCase())) ||
        (distributor.website?.toLowerCase().includes(query.toLowerCase()));
      
      return matchesSearch;
    });
    
    setFilteredDistributors(filtered);
  };

  const handleUpdateDistributor = async (distributor: Partial<Distributor>) => {
    try {
      const success = await updateDistributor(distributor);
      if (success) {
        toast(t("success") || "Success", {
          description: t("distributorUpdated") || "Distributor updated successfully"
        });
        refetch();
      }
      return success;
    } catch (error: any) {
      toast(t("error") || "Error", {
        description: error.message || t("failedToUpdateDistributor") || "Failed to update distributor"
      });
      return false;
    }
  };

  const handleAddDistributor = async (data: any) => {
    try {
      const success = await addDistributor(data);
      if (success) {
        toast(t("success") || "Success", {
          description: t("distributorAdded") || "Distributor added successfully"
        });
        refetch();
      }
      return success;
    } catch (error: any) {
      toast(t("error") || "Error", {
        description: error.message || t("failedToAddDistributor") || "Failed to add distributor"
      });
      return false;
    }
  };

  const handleDeleteDistributor = async (distributorId: string, uid?: string) => {
    if (confirm(t("confirmDelete") || "Are you sure you want to delete this distributor?")) {
      try {
        const success = await deleteDistributor(distributorId, uid);
        if (success) {
          toast(t("success") || "Success", {
            description: t("distributorDeleted") || "Distributor deleted successfully"
          });
          refetch();
        }
      } catch (error: any) {
        toast(t("error") || "Error", {
          description: error.message || t("failedToDeleteDistributor") || "Failed to delete distributor"
        });
      }
    }
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, [distributors, searchQuery]);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{t("distributors") || "Reseller Management"}</span>
            </CardTitle>
            <CardDescription>
              {t("distributorsDescription") || "Manage your distributors and resellers"}
              {distributors.length > 0 && (
                <span className="ml-2 font-medium">
                  ({distributors.length} {t("totalDistributors") || "total resellers"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <DistributorFilters onSearch={handleSearch} />
            
            <DistributorHeaderActions
              onRefresh={handleRefresh}
              onAddDistributor={openAddDialog}
            />
          </div>
          
          <DistributorsTable
            distributors={filteredDistributors}
            isLoading={isLoading}
            onViewDistributor={openViewDialog}
            onEditDistributor={openEditDialog}
            onDeleteDistributor={handleDeleteDistributor}
          />
        </CardContent>
      </Card>

      <ViewDistributorDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        distributor={selectedDistributor}
      />
      
      <EditDistributorDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        distributor={selectedDistributor}
        onSave={handleUpdateDistributor}
      />
      
      <AddDistributorDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddDistributor}
      />
    </div>
  );
}
