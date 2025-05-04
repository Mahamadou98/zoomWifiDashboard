import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRoleWithPermissions, updateRolePermissions, createRole, getAllRoles } from '../roles';
import { supabase } from '../../supabase';

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('Roles API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRoleWithPermissions', () => {
    it('should fetch role with permissions', async () => {
      const mockResponse = {
        data: {
          id: '1',
          name: 'admin',
          role_permissions: [
            { permission: { id: '1', name: 'view_dashboard' } }
          ]
        },
        error: null
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      });

      const result = await getRoleWithPermissions('1');

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateRolePermissions', () => {
    it('should update role permissions successfully', async () => {
      const mockDeleteResponse = { error: null };
      const mockInsertResponse = { error: null };
      const mockGetResponse = {
        data: { id: '1', name: 'admin' },
        error: null
      };

      (supabase.from as any)
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockDeleteResponse)
          })
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockResolvedValue(mockInsertResponse)
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockGetResponse)
            })
          })
        });

      const result = await updateRolePermissions('1', ['1', '2']);

      expect(result).toEqual(mockGetResponse.data);
    });
  });

  describe('createRole', () => {
    it('should create role with permissions', async () => {
      const mockRoleResponse = {
        data: { id: '1', name: 'new_role' },
        error: null
      };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockRoleResponse)
          })
        })
      });

      const result = await createRole('new_role', 'description', ['1', '2']);

      expect(result).toBeDefined();
    });
  });

  describe('getAllRoles', () => {
    it('should fetch all roles with permissions', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            name: 'admin',
            role_permissions: [
              { permission: { id: '1', name: 'view_dashboard' } }
            ]
          }
        ],
        error: null
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockResponse)
        })
      });

      const result = await getAllRoles();

      expect(result).toEqual(mockResponse.data);
    });
  });
});