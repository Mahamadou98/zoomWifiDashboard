import { supabase } from '../supabase';
import type { AdminRole, AdminPermission } from '../types/Admin';

export async function getRoleWithPermissions(roleId: string) {
  const { data, error } = await supabase
    .from('admin_roles')
    .select(`
      *,
      role_permissions (
        permission:admin_permissions(*)
      )
    `)
    .eq('id', roleId)
    .single();

  if (error) {
    throw new Error(`Error fetching role: ${error.message}`);
  }

  return data;
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  // First, remove all existing permissions
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);

  if (deleteError) {
    throw new Error(`Error updating permissions: ${deleteError.message}`);
  }

  // Then add new permissions
  const { error: insertError } = await supabase
    .from('role_permissions')
    .insert(
      permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }))
    );

  if (insertError) {
    throw new Error(`Error updating permissions: ${insertError.message}`);
  }

  return getRoleWithPermissions(roleId);
}

export async function createRole(name: string, description: string, permissionIds: string[]) {
  // Create the role
  const { data: roleData, error: roleError } = await supabase
    .from('admin_roles')
    .insert({ name, description })
    .select()
    .single();

  if (roleError) {
    throw new Error(`Error creating role: ${roleError.message}`);
  }

  // Add permissions
  await updateRolePermissions(roleData.id, permissionIds);

  return getRoleWithPermissions(roleData.id);
}

export async function getAllRoles() {
  const { data, error } = await supabase
    .from('admin_roles')
    .select(`
      *,
      role_permissions (
        permission:admin_permissions(*)
      )
    `)
    .order('name');

  if (error) {
    throw new Error(`Error fetching roles: ${error.message}`);
  }

  return data;
}