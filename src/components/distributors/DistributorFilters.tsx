
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

interface DistributorFiltersProps {
  onSearch: (query: string) => void;
}

export function DistributorFilters({ onSearch }: DistributorFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder={t("searchDistributors") || "Search distributors..."}
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full rounded-l-none"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t("clear") || "Clear"}</span>
          </Button>
        )}
      </div>
      <Button onClick={handleSearch}>{t("search") || "Search"}</Button>
    </div>
  );
}
