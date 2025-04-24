
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

interface UsersTableProps {
  users: User[];
  isAdmin: boolean;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onRenewUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export function UsersTable({
  users,
  isAdmin,
  onViewUser,
  onEditUser,
  onRenewUser,
  onDeleteUser,
}: UsersTableProps) {
  const { t, isRTL } = useLanguage();

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
              <TableCell>{user.User_Type}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${user.Block === "Not Blocked" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {user.Block}
                </span>
              </TableCell>
              <TableCell>{user.Country}</TableCell>
              <TableCell>{user.Credits}</TableCell>
              <TableCell>{user.Start_Date}</TableCell>
              <TableCell>{user.Expiry_Time}</TableCell>
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
