import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAlerts, subscribeToAlerts, markAlertAsRead } from '../lib/api/alerts';
import type { Alert } from '../types/Alert';

interface AlertContextType {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  error: string | null;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    let cleanup: (() => void) | undefined;

    const initializeAlerts = async () => {
      try {
        if (!isSubscribed) return;
        
        setLoading(true);
        const response = await getAlerts(50, 1, 'unread');
        if (!isSubscribed) return;
        
        setAlerts(response.data);
        
        // Set up realtime subscription
        cleanup = subscribeToAlerts((newAlert) => {
          if (isSubscribed) {
            setAlerts(prev => [newAlert, ...prev]);
          }
        });
      } catch (err) {
        if (!isSubscribed) return;
        setError(err instanceof Error ? err.message : 'Error fetching alerts');
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    initializeAlerts();

    return () => {
      isSubscribed = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await markAlertAsRead(id);
      setAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, status: 'read' } : alert
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking alert as read');
    }
  };

  const unreadCount = alerts.filter(alert => alert.status === 'unread').length;

  return (
    <AlertContext.Provider value={{ alerts, unreadCount, loading, markAsRead, error }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}