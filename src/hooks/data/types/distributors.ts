
export interface Distributor {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  commission_rate: number;
  credits_balance: number;
  max_credit_limit: number;
  status: 'active' | 'inactive';
  created_at: string;
  created_by?: string | null;
}

export interface DistributorTransaction {
  id: string;
  distributor_id: string;
  admin_id: string;
  amount: number;
  previous_balance: number;
  new_balance: number;
  notes?: string | null;
  created_at: string;
}

export interface DistributorUser {
  id: string;
  distributor_id: string;
  user_id: string;
  created_at: string;
  user?: {
    name?: string;
    email: string;
    credits?: string;
    user_type?: string;
  };
}

export interface CreateDistributorInput {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  commission_rate: number;
  max_credit_limit: number;
  initial_credits?: number;
}

export interface UpdateDistributorInput {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  commission_rate?: number;
  max_credit_limit?: number;
  status?: 'active' | 'inactive';
}

export interface AddCreditsInput {
  amount: number;
  notes?: string;
}
