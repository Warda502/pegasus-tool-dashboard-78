
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
    <div className="overflow-x-auto">
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
          {users.map((user) => (
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
  );
}
