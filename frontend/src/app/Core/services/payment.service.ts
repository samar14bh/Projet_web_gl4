import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Payment,
    PaymentStats,
    PaymentHistoryResponse
} from '../interfaces/payment.interface';

/**
 * Service for payment operations with signal-based state management
 */
@Injectable({
    providedIn: 'root',
})
export class PaymentService {
    private readonly apiUrl = `${environment.apiUrl}/payments`;

    // Signals for reactive state
    payments = signal<Payment[]>([]);
    stats = signal<PaymentStats | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    // Computed signals
    totalSpentThisMonth = computed(() => this.stats()?.totalSpentThisMonth ?? 0);
    totalSpentThisYear = computed(() => this.stats()?.totalSpentThisYear ?? 0);
    activeMemberships = computed(() => this.stats()?.activeMemberships ?? 0);

    constructor(private http: HttpClient) { }

    /**
     * Process club membership payment
     */
    processMembershipPayment(data: {
        membershipId: number;
        clubId: number;
        userId: number;
    }): Observable<Payment> {
        this.loading.set(true);
        this.error.set(null);

        return this.http.post<Payment>(`${this.apiUrl}/membership`, data).pipe(
            tap({
                next: () => {
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.error.set(err.message || 'Payment failed');
                },
            })
        );
    }

    /**
     * Process event payment
     */
    processEventPayment(data: {
        eventId: number;
        userId: number;
    }): Observable<{ payment: Payment; registration: any }> {
        this.loading.set(true);
        this.error.set(null);

        return this.http.post<{ payment: Payment; registration: any }>(
            `${this.apiUrl}/event`,
            data
        ).pipe(
            tap({
                next: () => {
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.error.set(err.message || 'Payment failed');
                },
            })
        );
    }

    /**
     * Get payment history with filters
     */
    getPaymentHistory(
        userId: number,
        filters?: {
            type?: 'membership' | 'event';
            status?: string;
            startDate?: string;
            endDate?: string;
            page?: number;
            limit?: number;
        }
    ): Observable<PaymentHistoryResponse> {
        this.loading.set(true);
        this.error.set(null);

        let params = new HttpParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params = params.set(key, value.toString());
                }
            });
        }

        return this.http
            .get<PaymentHistoryResponse>(`${this.apiUrl}/history/${userId}`, { params })
            .pipe(
                tap({
                    next: (response) => {
                        this.payments.set(response.data);
                        this.loading.set(false);
                    },
                    error: (err) => {
                        this.loading.set(false);
                        this.error.set(err.message || 'Failed to load payments');
                    },
                })
            );
    }

    /**
     * Get payment statistics
     */
    getPaymentStats(userId: number): Observable<PaymentStats> {
        return this.http.get<PaymentStats>(`${this.apiUrl}/stats/${userId}`).pipe(
            tap({
                next: (stats) => {
                    this.stats.set(stats);
                },
                error: (err) => {
                    this.error.set(err.message || 'Failed to load statistics');
                },
            })
        );
    }

    /**
     * Clear error state
     */
    clearError() {
        this.error.set(null);
    }
}
