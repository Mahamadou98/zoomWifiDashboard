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
  active?: boolean;
  role?: string;
  balance?: number;
  transactions?: any[];
  connections?: any[];
  createdAt?: string;
};

export type Countries = {
  _id?: string;
  name: string;
  tarifFibrePerMinute: 0;
  tarifDataPerMo: 0;
  cities: string[];
};

export type CountryResponse = {
  status: string;
  data: {
    countries: Countries[];
  };
};

export type ClientResponse = {
  status: string;
  token: string;
  data: {
    user: Client;
  };
};

export type ClientResponseArr = {
  status: string;
  token: string;
  totals: number;
  data: {
    clients: Client[];
  };
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

  // Register a new client
  static async register(client: Client): Promise<ClientResponse> {
    const response = await this.request('users/signup', 'POST', client);
    return response;
  }

  static async getAllClients(
    queryParams: URLSearchParams
  ): Promise<ClientResponseArr> {
    try {
      const response = await this.request(
        `users?${queryParams.toString()}`,
        'GET',
        undefined,
        true // This ensures the auth token is included
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async updateClientStatus(
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

  // activate admin
  static async activateUser(
    id: string,
    active: boolean
  ): Promise<ClientResponse> {
    const response = await this.request(
      `users/updateClientStatus/${id}`,
      'PATCH',
      { active },
      true
    );
    return response;
  }

  static async deleteUser(id: string) {
    const res = await fetch(`${UserAuthService.baseUrl}/users/deleteMe/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error(`Failed to delete user ${id}`);

    // Only try to parse JSON if there is content
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  static async getAllCountries(): Promise<CountryResponse> {
    try {
      const response = await this.request(
        `users/countries`,
        'GET',
        undefined,
        true // This ensures the auth token is included
      );

      return response;
    } catch (error) {
      throw error;
    }
  }
}
