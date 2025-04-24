
import { useState } from "react";
import { UserSearch } from "./UserSearch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";

export interface UserFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  licenseTypeFilter: string;
  onLicenseTypeFilterChange: (value: string) => void;
  isAdmin: boolean;
}

export function UserFilters({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  licenseTypeFilter,
  onLicenseTypeFilterChange,
  isAdmin
}: UserFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
      <div className="flex-grow max-w-sm">
        <UserSearch value={searchValue} onChange={onSearchChange} />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isAdmin && (
          <>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filterByStatus") || "Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses") || "All Statuses"}</SelectItem>
                  <SelectItem value="Not Blocked">{t("active") || "Active"}</SelectItem>
                  <SelectItem value="Blocked">{t("blocked") || "Blocked"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={licenseTypeFilter} onValueChange={onLicenseTypeFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("filterByLicenseType") || "License Type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allLicenseTypes") || "All License Types"}</SelectItem>
                  <SelectItem value="Monthly License">{t("monthlyLicense") || "Monthly License"}</SelectItem>
                  <SelectItem value="Credits License">{t("creditsLicense") || "Credits License"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
