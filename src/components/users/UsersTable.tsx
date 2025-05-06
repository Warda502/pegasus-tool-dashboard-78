
import { User } from "@/hooks/useSharedData";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserActions } from "./UserActions";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ChevronFirst, ChevronLast } from "lucide-react";

interface UsersTableProps {
  users: User[];
  isAdmin: boolean;
  isLoading: boolean;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onRenewUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export function UsersTable({
  users,
  isAdmin,
  isLoading,
  onViewUser,
  onEditUser,
  onRenewUser,
  onDeleteUser,
}: UsersTableProps) {
  const { t, isRTL } = useLanguage();
  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, users.length);
  const currentUsers = users.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  if (isLoading) {
    return <Loading text={t("loadingUsers") || "Loading users..."} />;
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t("noUsersFound") || "No users found"}
      </div>
    );
  }

  const getLicenseExpiry = (user: User) => {
    if (!user.Expiry_Time) return t("notApplicable") || "N/A";
    
    // Check if expiry date has passed
    const expiryDate = new Date(user.Expiry_Time);
    const today = new Date();
    const isExpired = expiryDate < today;
    
    if (isExpired) {
      return (
        <span className="text-red-600 font-medium">
          {t("expired") || "Expired"} ({user.Expiry_Time})
        </span>
      );
    }
    
    // Calculate days remaining
    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 7) {
      return (
        <span className="text-amber-600 font-medium">
          {user.Expiry_Time} ({daysRemaining} {t("daysRemaining") || "days remaining"})
        </span>
      );
    }
    
    return user.Expiry_Time;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("userType")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("country")}</TableHead>
              <TableHead>{t("credit")}</TableHead>
              <TableHead>{t("startDate")}</TableHead>
              <TableHead>{t("expiryDate")}</TableHead>
              <TableHead className={isRTL ? "text-right" : "text-left"}>{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.Email}</TableCell>
                <TableCell>
                  <Badge variant={user.User_Type === "Monthly License" ? "outline" : "secondary"}>
                    {user.User_Type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.Block === "Not Blocked" ? "success" : "destructive"}>
                    {user.Block}
                  </Badge>
                </TableCell>
                <TableCell>{user.Country}</TableCell>
                <TableCell>{user.Credits}</TableCell>
                <TableCell>{user.Start_Date}</TableCell>
                <TableCell>{getLicenseExpiry(user)}</TableCell>
                <TableCell>
                  <UserActions
                    user={user}
                    isAdmin={isAdmin}
                    onView={onViewUser}
                    onEdit={onEditUser}
                    onRenew={onRenewUser}
                    onDelete={onDeleteUser}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {users.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {t("showingResults") || "Showing"} {startIndex + 1} - {endIndex} {t("of") || "of"} {users.length}
          </div>
          <Pagination className="mt-0">
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                <PaginationLink onClick={() => goToPage(1)} className="cursor-pointer">
                  <ChevronFirst className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Always show first page, current page, last page, and pages adjacent to current
                const shouldShow = 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1;
                
                // Show ellipsis where there are gaps
                const showLeftEllipsis = page === currentPage - 2 && currentPage > 3;
                const showRightEllipsis = page === currentPage + 2 && currentPage < totalPages - 2;
                
                if (showLeftEllipsis) {
                  return <PaginationEllipsis key={`ellipsis-left-${page}`} />;
                }
                
                if (showRightEllipsis) {
                  return <PaginationEllipsis key={`ellipsis-right-${page}`} />;
                }
                
                if (shouldShow) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        onClick={() => goToPage(page)} 
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink onClick={() => goToPage(totalPages)} className="cursor-pointer">
                  <ChevronLast className="h-4 w-4" />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
