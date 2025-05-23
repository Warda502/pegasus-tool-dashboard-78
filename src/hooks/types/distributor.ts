export interface Distributor {
  id: string;
  uid: string;
  commissionRate: string;
  website?: string;
  facebook?: string;
  permissions?: string;
  creditLimit?: number;
  currentBalance?: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  userName?: string; // اسم المستخدم المرتبط بالموزع
  userEmail?: string; // بريد المستخدم المرتبط بالموزع
}

export interface DistributorCredit {
  id: string;
  distributorId: string;
  amount: number;
  operationType: 'add' | 'subtract' | 'commission';
  description?: string;
  createdAt: string;
  adminId?: string;
}

export interface DistributorUser {
  id: string;
  name: string;
  email: string;
  credits: string;
  expiryTime?: string;
  createdAt: string;
  distributorId: string;
}
