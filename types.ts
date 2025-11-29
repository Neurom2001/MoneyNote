
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export type Language = 'my' | 'en' | 'ja';

export type Theme = 'light' | 'dark';

export interface Transaction {
  id: string;
  amount: number;
  label: string;
  date: string; // ISO String YYYY-MM-DD
  type: TransactionType;
  created_at?: string; // Optional because it comes from DB
  user_id?: string; // Optional for client side
}

export interface User {
  username: string;
  password: string; // In a real app, this should be hashed. Storing plain for demo/local usage only.
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface BudgetSettings {
  id?: string;
  user_id?: string;
  limit_amount: number;
  warning_percent: number;
  danger_percent: number;
  updated_at?: string;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  language: Language;
  theme: Theme;
  updated_at?: string;
}
