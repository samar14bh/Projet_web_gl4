import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Transaction,
  FinancialStats,
  MonthlyFinancialData,
  TransactionFilters,
  PaginatedTransactions,
  CreateTransactionDto,
} from '../models/finance.model';

/**
 * Service pour la gestion des finances
 */
@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transactions`;

  /**
   * Récupérer les transactions avec filtres et pagination
   */
  getTransactions(filters: TransactionFilters): Observable<PaginatedTransactions> {
    let params = new HttpParams();

    if (filters.period) params = params.set('period', filters.period);
    if (filters.type && filters.type !== 'all') params = params.set('type', filters.type);
    if (filters.category && filters.category !== 'all') params = params.set('category', filters.category);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.clubId) params = params.set('clubId', filters.clubId.toString());

    return this.http.get<PaginatedTransactions>(this.apiUrl, { params });
  }

  /**
   * Récupérer une transaction par son ID
   */
  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les statistiques financières
   */
  getFinancialStats(clubId?: number, period?: string): Observable<FinancialStats> {
    let params = new HttpParams();
    if (clubId) params = params.set('clubId', clubId.toString());
    if (period) params = params.set('period', period);

    return this.http.get<FinancialStats>(`${this.apiUrl}/stats`, { params });
  }

  /**
   * Récupérer les données mensuelles pour le graphique
   */
  getMonthlyData(clubId?: number, months?: number): Observable<MonthlyFinancialData[]> {
    let params = new HttpParams();
    if (clubId) params = params.set('clubId', clubId.toString());
    if (months) params = params.set('months', months.toString());

    return this.http.get<MonthlyFinancialData[]>(`${this.apiUrl}/monthly`, { params });
  }

  /**
   * Créer une transaction (dépense manuelle)
   */
  createTransaction(dto: CreateTransactionDto): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, dto);
  }

  /**
   * Supprimer une transaction
   */
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
