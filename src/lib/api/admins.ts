import { supabase } from '../supabase';
import type { Admin, AdminListResponse, AdminResponse } from '../../types/Admin';

export async function getAdmins(
  maxItemPerPage: number = 10,
  page: number = 1,
  search?: string
): Promise<AdminListResponse> {
  let query = supabase
    .from('admins')
    .select(`
      *,
      role:admin_roles(*)
    `, { count: 'exact' });

  if (search) {
    query = query.or(`
      first_name.ilike.%${search}%,
      last_name.ilike.%${search}%,
      email.ilike.%${search}%
    `);
  }

  const start = (page - 1) * maxItemPerPage;
  query = query
    .range(start, start + maxItemPerPage - 1)
    .order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Error fetching admins: ${error.message}`);
  }

  return {
    data: data as Admin[],
    total: count || 0,
    page,
    per_page: maxItemPerPage
  };
}

export async function createAdmin(adminData: Omit<Admin, 'id' | 'created_at' | 'updated_at'>): Promise<AdminResponse> {
  // First, create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminData.email,
    email_confirm: true,
    user_metadata: {
      first_name: adminData.first_name,
      last_name: adminData.last_name,
      role_id: adminData.role_id
    }
  });

  if (authError) {
    return {
      data: null,
      status: 'failure',
      message: `Error creating auth user: ${authError.message}`
    };
  }

  // Then create admin record
  const { data, error } = await supabase
    .from('admins')
    .insert([{
      ...adminData,
      id: authData.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select(`
      *,
      role:admin_roles(*)
    `)
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error creating admin: ${error.message}`
    };
  }

  return {
    data: data as Admin,
    status: 'success'
  };
}

export async function updateAdmin(id: string, adminData: Partial<Admin>): Promise<AdminResponse> {
  const { data, error } = await supabase
    .from('admins')
    .update({
      ...adminData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      role:admin_roles(*)
    `)
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error updating admin: ${error.message}`
    };
  }

  return {
    data: data as Admin,
    status: 'success'
  };
}

export async function deleteAdmin(id: string): Promise<AdminResponse> {
  // First deactivate the admin
  const { data, error } = await supabase
    .from('admins')
    .update({
      status: 'inactive',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      role:admin_roles(*)
    `)
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error deactivating admin: ${error.message}`
    };
  }

  // Then disable auth user
  const { error: authError } = await supabase.auth.admin.updateUserById(
    id,
    { ban_duration: '999999h' }
  );

  if (authError) {
    return {
      data: null,
      status: 'failure',
      message: `Error disabling auth user: ${authError.message}`
    };
  }

  return {
    data: data as Admin,
    status: 'success'
  };
}

export async function getRoles() {
  const { data, error } = await supabase
    .from('admin_roles')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Error fetching roles: ${error.message}`);
  }

  return data;
}

export async function getPermissions() {
  const { data, error } = await supabase
    .from('admin_permissions')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Error fetching permissions: ${error.message}`);
  }

  return data;
}