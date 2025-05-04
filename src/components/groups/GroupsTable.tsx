
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { EditGroupDialog } from "./EditGroupDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface Group {
  key: string;
  value: string | null;
  inserted_at: string | null;
}

interface GroupsTableProps {
  data: Group[];
  onDeleteSuccess: () => void;
}

export const GroupsTable: React.FC<GroupsTableProps> = ({ data, onDeleteSuccess }) => {
  const { t, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  const handleDeleteClick = (group: Group) => {
    setSelectedGroup(group);
    setDeleteConfirmOpen(true);
  };
  
  const handleEditClick = (group: Group) => {
    setSelectedGroup(group);
    setIsEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGroup) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('key', selectedGroup.key);
      
      if (error) throw error;
      
      toast.success(t("groupValueDeletedSuccess") || "Group value deleted successfully");
      onDeleteSuccess();
    } catch (error) {
      console.error('Error deleting group value:', error);
      toast.error(t("errorDeletingGroupValue") || "Error deleting group value");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "yyyy/MM/dd hh:mm a");
    } catch {
      return dateString;
    }
  };

  const renderPagination = () => {
    // Only show pagination if we have items and more than one page
    if (data.length === 0 || totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => paginate(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {totalPages <= 7 ? (
            // If fewer than 7 pages, show all
            [...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => paginate(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))
          ) : (
            // If more than 7 pages, show smart pagination
            <>
              {/* Always show first page */}
              <PaginationItem>
                <PaginationLink
                  onClick={() => paginate(1)}
                  isActive={currentPage === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>

              {/* Show ellipsis if current page is more than 3 */}
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Show current page and surrounding pages */}
              {[...Array(5)].map((_, i) => {
                const pageNum = currentPage - 2 + i;
                if (pageNum > 1 && pageNum < totalPages) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => paginate(pageNum)}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              {/* Show ellipsis if current page is less than totalPages - 2 */}
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Always show last page */}
              <PaginationItem>
                <PaginationLink
                  onClick={() => paginate(totalPages)}
                  isActive={currentPage === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => paginate(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground border rounded-md">
        {t("noGroupsFound") || "No group values found"}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table dir={isRTL ? "rtl" : "ltr"}>
          <TableHeader>
            <TableRow>
              <TableHead>{t("key") || "Key"}</TableHead>
              <TableHead>{t("value") || "Value"}</TableHead>
              <TableHead>{t("insertedAt") || "Inserted At"}</TableHead>
              <TableHead className="text-right">{t("actions") || "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((group) => (
              <TableRow key={group.key}>
                <TableCell className="font-medium">{group.key}</TableCell>
                <TableCell>{group.value || "-"}</TableCell>
                <TableCell>{formatDate(group.inserted_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size={isMobile ? "icon" : "sm"}
                      onClick={() => handleEditClick(group)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                      <span className="sr-only">{t("edit") || "Edit"}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size={isMobile ? "icon" : "sm"}
                      onClick={() => handleDeleteClick(group)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">{t("delete") || "Delete"}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {renderPagination()}
      
      <div className="text-sm text-muted-foreground mt-2">
        {data.length > 0 && (
          <>{t("showing") || "Showing"} {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, data.length)} {t("of") || "of"} {data.length} {t("records") || "records"}</>
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete") || "Confirm Delete"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteGroupValueConfirmation") || "Are you sure you want to delete this group value? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("cancel") || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? t("deleting") || "Deleting..." : t("delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {selectedGroup && (
        <EditGroupDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSuccess={onDeleteSuccess} // Use the same callback to refresh data
          group={selectedGroup}
        />
      )}
    </>
  );
};
