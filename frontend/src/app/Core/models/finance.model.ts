/**
 * Modèles pour le module Finances
 */

export enum TransactionType {
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum TransactionCategory {
  MEMBERSHIP = 'MEMBERSHIP',
  EVENT = 'EVENT',
  DONATION = 'DONATION',
  EXPENSE = 'EXPENSE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface Transaction {
  id: number;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: Date;
  status: TransactionStatus;
  reference: string;
  userId?: number;
  eventId?: number;
  clubId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  membershipRevenue: number;
  eventRevenue: number;
  donationRevenue: number;
  pendingPayments: number;
}

export interface MonthlyFinancialData {
  month: string;
  revenue: number;
  expense: number;
}

export interface TransactionFilters {
  period?: 'month' | 'quarter' | 'year' | 'all';
  type?: TransactionType | 'all';
  category?: TransactionCategory | 'all';
  search?: string;
  page?: number;
  limit?: number;
  clubId?: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTransactionDto {
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  clubId: number;
  userId?: number;
  eventId?: number;
}
