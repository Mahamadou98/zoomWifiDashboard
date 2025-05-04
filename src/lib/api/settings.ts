import { supabase } from '../supabase';
import type { CountryBillingConfig, BillingConfigResponse } from '../../types/Settings';

export async function getCountryBillingConfig(country: string): Promise<BillingConfigResponse> {
  const { data, error } = await supabase
    .from('country_billing_config')
    .select('*')
    .eq('country', country)
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error fetching billing config: ${error.message}`
    };
  }

  return {
    data,
    status: 'success'
  };
}

export async function updateCountryBillingConfig(
  config: CountryBillingConfig
): Promise<BillingConfigResponse> {
  const { data, error } = await supabase
    .from('country_billing_config')
    .upsert({
      country: config.country,
      fiber: config.fiber,
      data: config.data,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error updating billing config: ${error.message}`
    };
  }

  return {
    data,
    status: 'success'
  };
}