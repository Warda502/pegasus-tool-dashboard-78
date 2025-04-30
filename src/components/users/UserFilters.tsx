
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";

interface UserFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  licenseTypeFilter: string;
  onLicenseTypeFilterChange: (value: string) => void;
  isAdmin: boolean;
}

export function UserFilters({
  statusFilter,
  onStatusFilterChange,
  licenseTypeFilter,
  onLicenseTypeFilterChange,
  isAdmin
}: UserFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={t("filterByStatus")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allStatuses")}</SelectItem>
          <SelectItem value="Not Blocked">{t("active")}</SelectItem>
          <SelectItem value="Blocked">{t("blocked")}</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={licenseTypeFilter} onValueChange={onLicenseTypeFilterChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={t("filterByLicense")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allLicenses")}</SelectItem>
          <SelectItem value="Monthly License">{t("monthlyLicense")}</SelectItem>
          <SelectItem value="Lifetime License">{t("lifetimeLicense")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
