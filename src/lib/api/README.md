# API Documentation

## Overview
This documentation covers the API integration for the ZOOM Wi-Fi Admin Dashboard, including user management, partner management, and system administration.

## Authentication
Authentication is handled through Supabase Auth with email/password authentication.

## Admin Management

### `getAdmins(maxItemPerPage?: number, page?: number, search?: string)`
Fetches paginated list of administrators.

Parameters:
- `maxItemPerPage`: Number of items per page (default: 10)
- `page`: Page number (default: 1)
- `search`: Search term for filtering admins

Returns: `Promise<AdminListResponse>`

### `createAdmin(adminData: Omit<Admin, 'id' | 'created_at' | 'updated_at'>)`
Creates a new administrator.

Parameters:
- `adminData`: Admin data object

Returns: `Promise<AdminResponse>`

### `updateAdmin(id: string, adminData: Partial<Admin>)`
Updates an existing administrator.

Parameters:
- `id`: Admin ID
- `adminData`: Partial admin data to update

Returns: `Promise<AdminResponse>`

### `deleteAdmin(id: string)`
Deactivates an administrator.

Parameters:
- `id`: Admin ID

Returns: `Promise<AdminResponse>`

## Role Management

### `getRoleWithPermissions(roleId: string)`
Fetches a role with its associated permissions.

Parameters:
- `roleId`: Role ID

Returns: `Promise<RoleWithPermissions>`

### `updateRolePermissions(roleId: string, permissionIds: string[])`
Updates permissions for a role.

Parameters:
- `roleId`: Role ID
- `permissionIds`: Array of permission IDs

Returns: `Promise<RoleWithPermissions>`

### `createRole(name: string, description: string, permissionIds: string[])`
Creates a new role with permissions.

Parameters:
- `name`: Role name
- `description`: Role description
- `permissionIds`: Array of permission IDs

Returns: `Promise<RoleWithPermissions>`

### `getAllRoles()`
Fetches all roles with their permissions.

Returns: `Promise<RoleWithPermissions[]>`

## Error Handling
All API functions follow a consistent error handling pattern:
- API errors are caught and transformed into typed responses
- Network errors include appropriate error messages
- Type safety is maintained throughout

## Testing
Run tests using:
```bash
npm run test
```

For coverage report:
```bash
npm run test:coverage
```