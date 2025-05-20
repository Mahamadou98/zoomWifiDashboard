export type Admin = {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  active?: boolean;
  role?: string;
  lastSeen?: string;
};

export type AdminResponse = {
  status: string;
  token: string;
  data: {
    user: Admin;
  };
};

export type AdminResponseArr = {
  status: string;
  token: string;
  data: {
    admins: Admin[];
  };
};

export type DashboardData = {
  totalUsers: number;
  totalPartners: number;
  totalTransactions: number;
  totalRechargeAmount: number;
};

export type DashboardDataResponse = {
  status: string;
  data: {
    totalUsers: number;
    totalPartners: number;
    totalTransactions: number;
    totalRechargeAmount: number;
  };
};

interface DateRange {
  startDate: string;
  endDate: string;
}

export default class AdminAuthService {
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

  // Login client
  static async login(email: string, password: string): Promise<AdminResponse> {
    const admin = await this.request('admin/login', 'POST', {
      email,
      password,
    });

    if (admin.token) {
      localStorage.setItem('auth_token', admin.token);
      // localStorage.setItem('admin_id', admin.data.user._id);
    }

    return admin;
  }

  // Register a new admin
  static async register(admin: Admin): Promise<AdminResponse> {
    const response = await this.request('admin/signup', 'POST', admin);
    return response;
  }

  // Logout
  static async logout(): Promise<void> {
    const id = localStorage.getItem('admin_id');
    try {
      await this.request('admin/logout', 'POST', { id }, true);
    } catch (err) {
      console.warn('Logout failed, proceeding to clear storage anyway.');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_id');
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // get all admins
  static async getAllAdmins(): Promise<AdminResponseArr> {
    const response = await this.request('admin', 'GET', undefined, true);

    return response;
  }

  // delete admin
  static async deleteAdmin(id: string): Promise<AdminResponse> {
    const response = await this.request(
      `admin/deleteMe/${id}`,
      'DELETE',
      undefined,
      true
    );
    return response;
  }

  // activate admin
  static async activateAdmin(
    id: string,
    active: boolean
  ): Promise<AdminResponse> {
    const response = await this.request(
      `admin/activateAdmin/${id}`,
      'PATCH',
      { active },
      true
    );
    return response;
  }

  // static async getDashboardData(): Promise<DashboardDataResponse> {
  //   const response = await this.request(
  //     'admin/dashboard',
  //     'GET',
  //     undefined,
  //     true
  //   );

  //   return response;
  // }

  // Update the getDashboardData method

  static async getDashboardData(
    dateRange: DateRange
  ): Promise<DashboardDataResponse> {
    const queryParams = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }).toString();

    const response = await this.request(
      `admin/dashboard?${queryParams}`,
      'GET',
      undefined,
      true
    );

    return response;
  }
}
