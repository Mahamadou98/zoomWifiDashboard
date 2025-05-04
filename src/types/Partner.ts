export interface Partner {
  id: string;
  first_name: string;
  last_name: string;
  name_company: string;
  type_partner: string;
  hostpot: string;
  type_id: string;
  address: string;
  sexe?: 'M' | 'F';
  birthday?: string;
  country: string;
  city: string;
  email: string;
  number_phone: string;
  id_device: string;
  status: 'active' | 'inactive' | 'pending';
  to_be_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerTransaction {
  id: string;
  partner_id: string;
  type: 'credit' | 'withdrawal';
  amount: number;
  description: string;
  created_at: string;
}

export interface PartnerBalance {
  partner_id: string;
  balance: number;
  last_updated: string;
}

export interface PartnerListResponse {
  data: Partner[];
  total: number;
  page: number;
  per_page: number;
}

export interface PartnerResponse {
  data: Partner;
  status: 'success' | 'failure';
  message?: string;
}

export interface TransactionHistoryResponse {
  data: PartnerTransaction[];
  total: number;
  page: number;
  per_page: number;
}

export interface BalanceResponse {
  data: PartnerBalance;
  status: 'success' | 'failure';
  message?: string;
}

export interface WithdrawalCode {
  code: string;
  partner_id: string;
  amount: number;
  expires_at: string;
  status: 'pending' | 'used' | 'expired';
  created_at: string;
}