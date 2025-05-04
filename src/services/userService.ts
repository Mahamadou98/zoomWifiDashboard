export type Client = {
  _id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  gender: string;
  password: string;
  passwordConfirm: string;
  active?: string;
  role?: string;
};

export type ClientResponse = {
  status: string;
  token: string;
  data: {
    user: Client;
  };
};

export default class AdminAuthService {
  private static baseUrl = import.meta.env.VITE_BASEURL;

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

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
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

  static async getAllPartners(): Promise<ClientResponse> {
    try {
      const response = await this.request(
        'partner',
        'GET',
        undefined,
        true // This ensures the auth token is included
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async updatePartnerStatus(
    partnerId: string,
    active: boolean
  ): Promise<Client> {
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

  static async sendAccountConfirmEmail(email: string): Promise<ClientResponse> {
    const response = await this.request(
      'partner/confirmEmail',
      'POST',
      { email },
      false
    );

    return response;
  }
}
