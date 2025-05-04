export type AlertType = 'partner_pending' | 'withdrawal' | 'long_session' | 'usage_peak' | 'system';
export type AlertPriority = 'low' | 'normal' | 'high';
export type AlertStatus = 'unread' | 'read';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  priority: AlertPriority;
  status: AlertStatus;
  created_at: string;
}

export interface AlertListResponse {
  data: Alert[];
  total: number;
  page: number;
  per_page: number;
}

export interface AlertResponse {
  data: Alert | null;
  status: 'success' | 'failure';
  message?: string;
}