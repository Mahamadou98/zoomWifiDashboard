export type Partner = {
  _id: string;
  establishmentName: string;
  managerFirstName: string;
  managerLastName: string;
  establishmentType: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  connectionType: string;
  password: string;
  passwordConfirm: string;
  active?: boolean;
  createdAt?: string;
  balance?: number;
  pendingWithdrawal?: number;
};

export type PartnerResponse = {
  status: string;
  totals: number;
  data: {
    partnes: Partner[];
  };
};

export default class PartnerService {
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

  // Register a new Partner
  static async register(partner: Partner): Promise<PartnerResponse> {
    const response = await this.request('partner/signup', 'POST', partner);
    return response;
  }

  static async getAllPartners(
    queryParams: URLSearchParams
  ): Promise<PartnerResponse> {
    try {
      const response = await this.request(
        `partner?${queryParams.toString()}`,
        'GET',
        undefined,
        true
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async updatePartnerStatus(
    partnerId: string,
    active: boolean
  ): Promise<Partner> {
    try {
      const response = await this.request(
        `partner/${partnerId}/status`,
        'PATCH',
        { active },
        true // requiresAuth = true since this is a protected endpoint
      );
      return response.data.partner;
    } catch (error) {
      throw error;
    }
  }

  static async sendAccountConfirmEmail(
    email: string
  ): Promise<PartnerResponse> {
    const response = await this.request(
      'partner/confirmEmail',
      'POST',
      { email },
      false
    );

    return response;
  }
}
