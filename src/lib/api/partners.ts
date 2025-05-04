import { supabase } from '../supabase';
import type { 
  Partner, 
  PartnerListResponse, 
  PartnerResponse, 
  TransactionHistoryResponse,
  BalanceResponse,
  WithdrawalCode
} from '../../types/Partner';

export async function getPartners(
  maxItemPerPage: number = 10,
  page: number = 1,
  search?: string,
  optionFilter?: string[]
): Promise<PartnerListResponse> {
  let query = supabase
    .from('partners')
    .select('*', { count: 'exact' });

  // Apply search if provided
  if (search) {
    query = query.or(`
      first_name.ilike.%${search}%,
      last_name.ilike.%${search}%,
      name_company.ilike.%${search}%,
      email.ilike.%${search}%,
      number_phone.ilike.%${search}%
    `);
  }

  // Apply filters if provided
  if (optionFilter?.length) {
    optionFilter.forEach(filter => {
      const [field, value] = filter.split(':');
      query = query.eq(field, value);
    });
  }

  // Apply pagination
  const start = (page - 1) * maxItemPerPage;
  query = query
    .range(start, start + maxItemPerPage - 1)
    .order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Error fetching partners: ${error.message}`);
  }

  return {
    data: data as Partner[],
    total: count || 0,
    page,
    per_page: maxItemPerPage
  };
}

export async function addPartner(partnerData: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<PartnerResponse> {
  const { data, error } = await supabase
    .from('partners')
    .insert([{
      ...partnerData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error creating partner: ${error.message}`
    };
  }

  return {
    data: data as Partner,
    status: 'success'
  };
}

export async function updatePartner(id: string, partnerData: Partial<Partner>): Promise<PartnerResponse> {
  const { data, error } = await supabase
    .from('partners')
    .update({
      ...partnerData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error updating partner: ${error.message}`
    };
  }

  return {
    data: data as Partner,
    status: 'success'
  };
}

export async function deletePartner(id: string): Promise<PartnerResponse> {
  const { data, error } = await supabase
    .from('partners')
    .update({
      status: 'inactive',
      to_be_deleted: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error deleting partner: ${error.message}`
    };
  }

  return {
    data: data as Partner,
    status: 'success'
  };
}

export async function getPartnerTransactionHistory(
  partnerId: string,
  maxItemPerPage: number = 10,
  page: number = 1
): Promise<TransactionHistoryResponse> {
  const start = (page - 1) * maxItemPerPage;
  
  const { data, error, count } = await supabase
    .from('partner_transactions')
    .select('*', { count: 'exact' })
    .eq('partner_id', partnerId)
    .range(start, start + maxItemPerPage - 1)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching transaction history: ${error.message}`);
  }

  return {
    data: data,
    total: count || 0,
    page,
    per_page: maxItemPerPage
  };
}

export async function creditPartnerAccount(
  partnerId: string,
  amount: number,
  description: string
): Promise<BalanceResponse> {
  const { data: balance, error: balanceError } = await supabase
    .rpc('credit_partner_account', {
      p_partner_id: partnerId,
      p_amount: amount,
      p_description: description
    });

  if (balanceError) {
    return {
      data: null,
      status: 'failure',
      message: `Error crediting account: ${balanceError.message}`
    };
  }

  return {
    data: balance,
    status: 'success'
  };
}

export async function getPartnerBalance(partnerId: string): Promise<BalanceResponse> {
  const { data, error } = await supabase
    .from('partner_balances')
    .select('*')
    .eq('partner_id', partnerId)
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error fetching balance: ${error.message}`
    };
  }

  return {
    data,
    status: 'success'
  };
}

export async function generateWithdrawalCode(
  partnerId: string,
  amount: number
): Promise<WithdrawalCode> {
  const { data, error } = await supabase
    .rpc('generate_withdrawal_code', {
      p_partner_id: partnerId,
      p_amount: amount
    });

  if (error) {
    throw new Error(`Error generating withdrawal code: ${error.message}`);
  }

  return data as WithdrawalCode;
}

export async function getCoin(partnerId: string): Promise<BalanceResponse> {
  return getPartnerBalance(partnerId);
}