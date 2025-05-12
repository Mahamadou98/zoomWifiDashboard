export type Company = {
  _id?: string;
  name: string;
  contact: string;
  country: string;
  city: string;
  email: string;
  address: string;
  commissionPercent: number;
  partnerCommissionPercent: number;
  createAdAt: string;
};

export type CompanyResponse = {
  status: string;
  totals: number;
  data: {
    company: Company;
  };
};

export type CompanyResponseArr = {
  status: string;
  totals: number;
  data: {
    companies: Company[];
  };
};

export default class CompanyService {
  // private static baseUrl = import.meta.env.VITE_BASEURL;
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

  // get one company
  static async getAllCompany(): Promise<CompanyResponse> {
    const response = await this.request('company', 'GET', undefined, true);

    return response;
  }

  static async updateCompanyInfos(
    company: Company,
    id: string
  ): Promise<CompanyResponse> {
    const response = await this.request(
      `company/${id}`,
      'PATCH',
      { company },
      true
    );
    return response;
  }
}
