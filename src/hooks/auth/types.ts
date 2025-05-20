
import { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "user" | "distributor";

export interface AuthUser {
  id: string;
  uid?: string;
  email: string;
  name?: string;
  role: UserRole;
  credits?: string;
  expiryTime?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthState {
  loading: boolean;
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDistributor: boolean;
  sessionChecked: boolean;
  needsTwoFactor: boolean;
  twoFactorVerified: boolean;
  setTwoFactorComplete: () => void;
  clearTwoFactorVerification: () => void;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  checkSession: () => Promise<boolean>;
  handleSessionExpired: () => void;
  verifyTwoFactor: (userId: string, token: string) => Promise<boolean>;
}

export interface AuthContextType extends AuthState, AuthActions {
  initialized: boolean;
}
