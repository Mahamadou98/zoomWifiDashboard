export interface AdminRole {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions?: AdminPermission[];
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  role?: AdminRole;
  status: 'active' | 'inactive';
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminListResponse {
  data: Admin[];
  total: number;
  page: number;
  per_page: number;
}

export interface AdminResponse {
  data: Admin | null;
  status: 'success' | 'failure';
  message?: string;
}

export interface RoleWithPermissions extends AdminRole {
  role_permissions: {
    permission: AdminPermission;
  }[];
}