export interface User {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  sexe: 'M' | 'F';
  birthday: string;
  country: string;
  city: string;
  email: string;
  number_phone: string;
  id_device: string;
  status: 'active' | 'inactive';
  to_be_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
}

export interface UserBalance {
  user_id: string;
  balance: number;
  last_updated: string;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  per_page: number;
}

export interface UserResponse {
  data: User;
  status: 'success' | 'failure';
  message?: string;
}

export interface TransactionHistoryResponse {
  data: UserTransaction[];
  total: number;
  page: number;
  per_page: number;
}

export interface BalanceResponse {
  data: UserBalance;
  status: 'success' | 'failure';
  message?: string;
}