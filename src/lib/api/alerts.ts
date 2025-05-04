import { supabase } from '../supabase';
import type { Alert, AlertType, AlertResponse, AlertListResponse } from '../types/Alert';

export async function getAlerts(
  maxItemPerPage: number = 10,
  page: number = 1,
  status?: 'unread' | 'read'
): Promise<AlertListResponse> {
  let query = supabase
    .from('system_alerts')
    .select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  const start = (page - 1) * maxItemPerPage;
  query = query
    .range(start, start + maxItemPerPage - 1)
    .order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Error fetching alerts: ${error.message}`);
  }

  return {
    data: data as Alert[],
    total: count || 0,
    page,
    per_page: maxItemPerPage
  };
}

export async function markAlertAsRead(id: string): Promise<AlertResponse> {
  const { data, error } = await supabase
    .from('system_alerts')
    .update({ status: 'read' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error updating alert: ${error.message}`
    };
  }

  return {
    data: data as Alert,
    status: 'success'
  };
}

export async function subscribeToAlerts(callback: (alert: Alert) => void) {
  const channel = supabase
    .channel('system_alerts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'system_alerts'
      },
      (payload) => {
        callback(payload.new as Alert);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}