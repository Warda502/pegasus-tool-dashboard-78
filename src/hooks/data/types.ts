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

import type { Database } from "@/integrations/supabase/types";

type UserRow = Database['public']['Tables']['users']['Row'];
type OperationRow = Database['public']['Tables']['operations']['Row'];

export interface User extends UserRow {
  Name: string;
  Email: string;
  Password: string;
  Phone: string;
  Country: string;
  Activate: string;
  Block: string;
  Credits: string;
  User_Type: string;
  Email_Type: string;
  Expiry_Time: string;
  Start_Date: string;
  Hwid: string;
  UID: string;
  [key: string]: any;
}

export interface Operation {
  operation_id?: string;
  OprationID?: string;
  OprationTypes?: string;
  Phone_SN?: string;
  Brand?: string;
  Model?: string;
  Imei?: string;
  UserName?: string;
  Credit?: string;
  Time?: string;
  Status?: string;
  Android?: string;
  Baseband?: string;
  Carrier?: string;
  Security_Patch?: string;
  UID?: string;
  Hwid?: string;
  LogOpration?: string;
  [key: string]: any;
}

export interface SharedDataContextType {
  users: User[];
  operations: Operation[];
  isLoading: boolean;
  isError?: boolean;
  refreshData: () => void;
  addCreditToUser: (userId: string, creditsToAdd: number) => Promise<boolean>;
  refundOperation: (operation: Operation) => Promise<boolean>;
}
