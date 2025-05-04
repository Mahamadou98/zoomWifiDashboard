import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AlertProvider, useAlerts } from '../AlertContext';
import * as alertsApi from '../../lib/api/alerts';

vi.mock('../../lib/api/alerts', () => ({
  getAlerts: vi.fn(),
  subscribeToAlerts: vi.fn(),
  markAlertAsRead: vi.fn()
}));

const TestComponent = () => {
  const { alerts, unreadCount, loading, error } = useAlerts();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="alerts-count">{alerts.length}</div>
      {error && <div data-testid="error">{error}</div>}
    </div>
  );
};

describe('AlertContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    (alertsApi.getAlerts as any).mockResolvedValue({ data: [], total: 0 });
    (alertsApi.subscribeToAlerts as any).mockReturnValue(() => {});

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  it('should load alerts successfully', async () => {
    const mockAlerts = [
      { id: '1', status: 'unread', message: 'Test 1' },
      { id: '2', status: 'read', message: 'Test 2' }
    ];

    (alertsApi.getAlerts as any).mockResolvedValue({ data: mockAlerts, total: 2 });
    (alertsApi.subscribeToAlerts as any).mockReturnValue(() => {});

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('alerts-count')).toHaveTextContent('2');
      expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    });
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch alerts');
    (alertsApi.getAlerts as any).mockRejectedValue(error);
    (alertsApi.subscribeToAlerts as any).mockReturnValue(() => {});

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch alerts');
    });
  });
});