import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Service for member operations (payments, profile, etc.)
 */
@Injectable({
    providedIn: 'root',
})
export class MemberService {
    private readonly apiUrl = `${environment.apiUrl}`;

    // Signals
    payments = signal<any[]>([]);
    paymentStats = signal<any>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    constructor(private http: HttpClient) { }

    /**
     * Get payment history for a user
     */
    getPaymentHistory(userId: number, filters?: { status?: string; page?: number; limit?: number }): Observable<any> {
        this.loading.set(true);

        let params = new HttpParams();
        if (filters?.status) {
            params = params.set('status', filters.status);
        }
        if (filters?.page) {
            params = params.set('page', filters.page.toString());
        }
        if (filters?.limit) {
            params = params.set('limit', filters.limit.toString());
        }

        return this.http.get<any>(`${this.apiUrl}/payments/history/${userId}`, { params }).pipe(
            tap({
                next: (response) => {
                    this.payments.set(response.data || []);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.error.set(err.message || 'Failed to load payment history');
                    this.loading.set(false);
                }
            })
        );
    }

    /**
     * Get payment statistics for a user
     */
    getPaymentStats(userId: number): Observable<any> {
        this.loading.set(true);
        return this.http.get<any>(`${this.apiUrl}/payments/stats/${userId}`).pipe(
            tap({
                next: (stats) => {
                    this.paymentStats.set(stats);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.error.set(err.message || 'Failed to load payment stats');
                    this.loading.set(false);
                }
            })
        );
    }

    clearError() {
        this.error.set(null);
    }
}
