
import { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  sessionChecked: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  checkSession: () => Promise<boolean>;
  handleSessionExpired: () => void;
}

export type AuthContextType = AuthState & AuthActions;
