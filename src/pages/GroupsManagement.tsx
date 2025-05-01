
import { useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import { useLanguage } from "@/hooks/useLanguage";
import { Loading } from "@/components/ui/loading";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings, Search } from "lucide-react";
import { AddGroupDialog } from "@/components/groups/AddGroupDialog";
import { GroupsTable } from "@/components/groups/GroupsTable";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";

export default function GroupsManagement() {
  const { t, isRTL } = useLanguage();
  const { data: groups, isLoading, error } = useGroups();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['groups'] });
  };

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['groups'] });
  };

  // Filter groups based on search query
  const filteredGroups = groups?.filter(group => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      group.key?.toLowerCase().includes(query) ||
      (group.value && group.value.toLowerCase().includes(query))
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
              <Settings className="h-5 w-5" />
              <span>{t("groupsManagement") || "Groups Management"}</span>
            </CardTitle>
            <CardDescription>
              {t("manageGroupValues") || "Manage group values"}
              {groups && groups.length > 0 && (
                <span className="ml-2 font-medium">
                  ({groups.length} {t("totalRecords") || "total records"})
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              {t("addNewValue") || "Add New Value"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="relative w-full">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchGroups") || "Search groups..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8"
              />
            </div>
          </div>
          
          <GroupsTable data={filteredGroups} onDeleteSuccess={handleDeleteSuccess} />
        </CardContent>
      </Card>
      
      <AddGroupDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
