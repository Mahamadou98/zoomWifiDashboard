export type CreateTransaction = {
  amount: number;
  senderId: string;
  receiverId: string;
  type: string;
  description: string;
  isPartner: boolean;
};
export type AdminRetrait = {
  senderId: string;
  amount: number;
  type: string;
  description: string;
};

type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  establishmentName?: string;
};

export type TransactionResponse = {
  _id?: string;
  type: string;
  amount: number;
  balance?: number;
  commission: number;
  partnerShare: number;
  status: string;
  userId: string;
  description: string;
  createdAt: string;
  user?: User;
  partner?: User;
};
export type TransactionResponseArr = {
  status: string;
  totals: number;
  data: { transactions: TransactionResponse[] };
};

export default class UserAuthService {
  private static baseUrl = import.meta.env.VITE_BASEURL;
  private static devBaseUrl = import.meta.env.VITE_DEV_BASEURL;

  // Helper function to handle requests
  private static async request(
    endpoint: string,
    method: string,
    body?: object,
    requiresAuth: boolean = false
  ) {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };

      if (requiresAuth) {
        const token = localStorage.getItem('auth_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.devBaseUrl}/${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    } catch (error: any) {
      console.error(`Error in ${endpoint}:`, error.message);
      throw new Error(error.message);
    }
  }

  // Recharger User account
  static async rechargeUser(
    transaction: CreateTransaction
  ): Promise<TransactionResponse> {
    const response = await this.request(
      'transaction/rechargeUser',
      'POST',
      transaction
    );
    return response;
  }

  static async adminRetrait(retrait: AdminRetrait): Promise<AdminRetrait> {
    return await this.request('transaction/adminRetrait', 'POST', retrait);
  }

  // Get all transactions
  static async getAllTransaction(
    queryParams: URLSearchParams
  ): Promise<TransactionResponseArr> {
    try {
      const response = await this.request(
        `transaction?${queryParams.toString()}`,
        'GET',
        undefined,
        true // This ensures the auth token is included
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async updateTransactionStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<TransactionResponse> {
    if (status === 'rejete') {
      const response = await this.request(
        `transaction/updateStatus/${id}`,
        'PATCH',
        { status, reason },
        true
      );
      return response;
    } else {
      const response = await this.request(
        `transaction/updateStatus/${id}`,
        'PATCH',
        { status },
        true
      );
      return response;
    }
  }
}
