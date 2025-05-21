
// This file is now the main entry point for authentication
// It simply re-exports from AuthContext to maintain backward compatibility
// while fixing circular dependencies

import { useAuth as useAuthFromContext } from "./auth/AuthContext";

// Re-export the hook directly to maintain backward compatibility
export const useAuth = useAuthFromContext;
