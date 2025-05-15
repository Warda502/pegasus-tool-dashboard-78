
import { useIsMobile } from "@/hooks/use-mobile";

// This is a simple re-export to maintain backward compatibility
// while using the correct hook name
export function useMobile() {
  const isMobile = useIsMobile();
  return { isMobile };
}
