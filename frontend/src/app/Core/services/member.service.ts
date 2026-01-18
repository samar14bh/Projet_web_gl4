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
     * Check if user is a member of a club
     */
    checkMembership(userId: number, clubId: number): Observable<{ exists: boolean; membership?: any }> {
        let params = new HttpParams()
            .set('userId', userId.toString())
            .set('clubId', clubId.toString());

        return this.http.get<{ exists: boolean; membership?: any }>(`${environment.apiUrl}/memberships/check/status`, { params });
    }

    clearError() {
        this.error.set(null);
    }
}
