import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAlerts, markAlertAsRead, subscribeToAlerts } from '../alerts';
import { supabase } from '../../supabase';

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn()
  }
}));

describe('Alerts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAlerts', () => {
    it('should fetch alerts with correct parameters', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        data: [{ id: '1', message: 'Test alert' }],
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

      const result = await getAlerts(10, 1, 'unread');

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.per_page).toBe(10);
    });

    it('should throw error when API call fails', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        data: null,
        error: new Error('API Error'),
        count: 0
      });

      const mockRange = vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(mockSelect) });
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          range: mockRange
        })
      });

      (supabase.from as any).mockReturnValue(mockFrom());

      await expect(getAlerts(10, 1)).rejects.toThrow('Error fetching alerts: API Error');
    });
  });

  describe('markAlertAsRead', () => {
    it('should mark alert as read successfully', async () => {
      const mockAlert = { id: '1', status: 'read' };
      const mockSingle = vi.fn().mockReturnValue({
        data: mockAlert,
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ select: mockSelect })
      });

      (supabase.from as any).mockReturnValue({ update: mockUpdate });

      const result = await markAlertAsRead('1');

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockAlert);
    });

    it('should return failure when update fails', async () => {
      const mockSingle = vi.fn().mockReturnValue({
        data: null,
        error: new Error('Update failed')
      });

      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ select: mockSelect })
      });

      (supabase.from as any).mockReturnValue({ update: mockUpdate });

      const result = await markAlertAsRead('1');

      expect(result.status).toBe('failure');
      expect(result.message).toBe('Error updating alert: Update failed');
    });
  });

  describe('subscribeToAlerts', () => {
    it('should set up subscription correctly', () => {
      const mockSubscribe = vi.fn();
      const mockOn = vi.fn().mockReturnValue({ subscribe: mockSubscribe });
      const mockChannel = vi.fn().mockReturnValue({ on: mockOn });

      (supabase.channel as any).mockReturnValue(mockChannel());

      const callback = vi.fn();
      subscribeToAlerts(callback);

      expect(supabase.channel).toHaveBeenCalledWith('system_alerts');
      expect(mockOn).toHaveBeenCalled();
      expect(mockSubscribe).toHaveBeenCalled();
    });
  });
});