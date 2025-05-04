
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";

interface UserFiltersProps {
  onSearch: (query: string) => void;
}

export function UserFilters({ onSearch }: UserFiltersProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative flex-1 w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={t("search")}
        className="w-full pl-8"
        value={searchQuery}
        onChange={handleSearchChange}
      />
    </div>
  );
}
