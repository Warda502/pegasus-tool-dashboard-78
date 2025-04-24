
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function UserSearch({ value, onChange }: UserSearchProps) {
  const { t, isRTL } = useLanguage();

  return (
    <div className="relative flex-1 max-w-xs">
      <Search 
        className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 text-gray-400`} 
      />
      <Input
        placeholder={t("searchUsers")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={isRTL ? "pl-3 pr-10 w-full" : "pl-10 pr-3 w-full"}
      />
    </div>
  );
}
