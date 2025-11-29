import { Transaction, TransactionType } from '../types';
import { supabase } from './supabaseClient';

// Helper to convert username to a valid fake email for Supabase Auth
// We strip spaces and special characters to ensure Supabase accepts the format.
const getEmail = (username: string) => {
  // 1. Trim whitespace
  // 2. Remove all spaces (Mg Mg -> MgMg)
  // 3. Convert to lowercase
  const cleanName = username.trim().replace(/\s+/g, '').toLowerCase();
  
  // Use a dummy domain. This email won't be real, so Email Verification MUST be disabled in Supabase.
  return `${cleanName}@moneytracker.local`;
};

export const registerUser = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
  const { data, error } = await supabase.auth.signUp({
    email: getEmail(username),
    password: password,
    options: {
      // Store the real display name in metadata
      data: {
        display_name: username,
      }
    }
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: getEmail(username),
    password: password,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, user: data.user };
};

export const logoutUser = async () => {
  await supabase.auth.signOut();
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data as Transaction[];
};

export const saveTransaction = async (transaction: Transaction): Promise<{ data: Transaction | null; error: string | null }> => {
  // We don't send ID, created_at, or user_id (Supabase handles these)
  // We need to get the current user first to ensure session is active, though RLS handles it
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "User session not found. Please login again." };

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: user.id,
        amount: transaction.amount,
        label: transaction.label,
        date: transaction.date,
        type: transaction.type
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving transaction:', error);
    return { data: null, error: error.message };
  }
  return { data, error: null };
};

export const updateTransaction = async (transaction: Transaction): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from('transactions')
    .update({
      amount: transaction.amount,
      label: transaction.label,
      date: transaction.date,
      type: transaction.type
    })
    .eq('id', transaction.id);

  if (error) {
    console.error('Error updating transaction:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const deleteTransaction = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}