import { supabase } from '../supabase';
import type { 
  User, 
  UserListResponse, 
  UserResponse, 
  TransactionHistoryResponse,
  BalanceResponse 
} from '../../types/User';

export async function getUsers(
  maxItemPerPage: number = 10,
  page: number = 1,
  search?: string,
  optionFilter?: string[]
): Promise<UserListResponse> {
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' });

  // Apply search if provided
  if (search) {
    query = query.or(`
      first_name.ilike.%${search}%,
      last_name.ilike.%${search}%,
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
    throw new Error(`Error fetching users: ${error.message}`);
  }

  return {
    data: data as User[],
    total: count || 0,
    page,
    per_page: maxItemPerPage
  };
}

export async function addUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<UserResponse> {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error creating user: ${error.message}`
    };
  }

  return {
    data: data as User,
    status: 'success'
  };
}

export async function updateUser(id: string, userData: Partial<User>): Promise<UserResponse> {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...userData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      status: 'failure',
      message: `Error updating user: ${error.message}`
    };
  }

  return {
    data: data as User,
    status: 'success'
  };
}

export async function deleteUser(id: string): Promise<UserResponse> {
  const { data, error } = await supabase
    .from('users')
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
      message: `Error deleting user: ${error.message}`
    };
  }

  return {
    data: data as User,
    status: 'success'
  };
}

export async function getUserTransactionHistory(
  userId: string,
  maxItemPerPage: number = 10,
  page: number = 1
): Promise<TransactionHistoryResponse> {
  const start = (page - 1) * maxItemPerPage;
  
  const { data, error, count } = await supabase
    .from('user_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
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

export async function creditUserAccount(
  userId: string,
  amount: number,
  description: string
): Promise<BalanceResponse> {
  // Start a transaction
  const { data: balance, error: balanceError } = await supabase
    .rpc('credit_user_account', {
      p_user_id: userId,
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

export async function getUserBalance(userId: string): Promise<BalanceResponse> {
  const { data, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
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