export interface CountryBillingConfig {
  country: string;
  fiber: {
    ratePerMinute: number;
    minimumBalance: number;
  };
  data: {
    ratePerMB: number;
    hourlyDataLimit: number;
    hourlyCostLimit: number;
    minimumBalance: number;
  };
}

export interface BillingConfigResponse {
  data: CountryBillingConfig;
  status: 'success' | 'failure';
  message?: string;
}