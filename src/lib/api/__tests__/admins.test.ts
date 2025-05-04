import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../admins';
import { supabase } from '../../supabase';

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      admin: {
        createUser: vi.fn(),
        updateUserById: vi.fn()
      }
    }
  }
}));

describe('Admins API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAdmins', () => {
    it('should fetch admins with correct parameters', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        data: [{ id: '1', email: 'test@example.com' }],
        error: null,
        count: 1
      });

      const mockRange = vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(mockSelect) });
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          range: mockRange
        })
      });

      (supabase.from as any).mockReturnValue(mockFrom());

      const result = await getAdmins(10, 1);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.per_page).toBe(10);
    });

    it('should handle search parameter', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        data: [{ id: '1', email: 'test@example.com' }],
        error: null,
        count: 1
      });

      const mockRange = vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(mockSelect) });
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          range: mockRange
        })
      });

      (supabase.from as any).mockReturnValue(mockFrom());

      await getAdmins(10, 1, 'test');

      expect(mockFrom).toHaveBeenCalledWith('admins');
    });
  });

  describe('createAdmin', () => {
    it('should create admin successfully', async () => {
      const mockAuthResponse = {
        data: { user: { id: '1' } },
        error: null
      };

      const mockDbResponse = {
        data: { id: '1', email: 'test@example.com' },
        error: null
      };

      (supabase.auth.admin.createUser as any).mockResolvedValue(mockAuthResponse);
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockDbResponse)
          })
        })
      });

      const result = await createAdmin({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role_id: '1',
        status: 'active'
      });

      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
    });
  });

  describe('updateAdmin', () => {
    it('should update admin successfully', async () => {
      const mockResponse = {
        data: { id: '1', email: 'test@example.com' },
        error: null
      };

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockResponse)
            })
          })
        })
      });

      const result = await updateAdmin('1', { status: 'inactive' });

      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
    });
  });

  describe('deleteAdmin', () => {
    it('should delete admin successfully', async () => {
      const mockDbResponse = {
        data: { id: '1', status: 'inactive' },
        error: null
      };

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(mockDbResponse)
            })
          })
        })
      });

      (supabase.auth.admin.updateUserById as any).mockResolvedValue({ error: null });

      const result = await deleteAdmin('1');

      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
    });
  });
});