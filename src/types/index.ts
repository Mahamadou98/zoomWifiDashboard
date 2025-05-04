export interface User {
  id: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  gender?: string;
  created_at: string;
}

export interface Partner {
  id: string;
  businessName: string;
  email: string;
  managerFirstName: string;
  managerLastName: string;
  establishmentType: string;
  address: string;
  phone: string;
  connectionTypes: ('fiber' | 'data')[];
  isApproved: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  userId: string;
  partnerId: string;
  connectionType: 'fiber' | 'data';
  startTime: string;
  endTime?: string;
  dataUsed?: number;
  cost: number;
  status: 'active' | 'completed' | 'terminated';
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}