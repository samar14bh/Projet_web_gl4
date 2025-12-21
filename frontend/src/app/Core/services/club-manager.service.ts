import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClubStats, Member } from '../interfaces/club-manager.interface';

/**
 * Service for club manager operations
 */
@Injectable({
    providedIn: 'root',
})
export class ClubManagerService {
    private readonly apiUrl = `${environment.apiUrl}`;

    // Signals
    clubDetails = signal<any>(null);
    clubStats = signal<ClubStats | null>(null);
    pendingMembers = signal<Member[]>([]);
    activeMembers = signal<Member[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    constructor(private http: HttpClient) { }

    /**
     * Get club detailed statistics for dashboard
     */
    getClubDetailedStats(clubId: number): Observable<any> {
        this.loading.set(true);
        return this.http.get<any>(`${this.apiUrl}/clubs/${clubId}/stats`).pipe(
            tap({
                next: (stats) => {
                    this.clubStats.set(stats);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.error.set(err.message || 'Failed to load club stats');
                    this.loading.set(false);
                },
            })
        );
    }

    /**
     * Get club details including statistics
     */
    getClubDetails(clubId: number): Observable<any> {
        this.loading.set(true);
        return this.http.get<any>(`${this.apiUrl}/clubs/${clubId}`).pipe(
            tap({
                next: (club) => {
                    this.clubDetails.set(club);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.error.set(err.message || 'Failed to load club details');
                    this.loading.set(false);
                },
            })
        );
    }

    /**
     * Get members with filtering - using club-specific endpoint
     */
    getMembers(clubId: number, status?: string, page?: number, limit?: number): Observable<any> {
        let params = new HttpParams();
        if (status) {
            params = params.set('status', status);
        }
        if (page) {
            params = params.set('page', page.toString());
        }
        if (limit) {
            params = params.set('limit', limit.toString());
        }

        return this.http.get<any>(`${this.apiUrl}/clubs/${clubId}/members`, { params }).pipe(
            tap({
                next: (response) => {
                    if (status === 'PENDING') {
                        this.pendingMembers.set(response.data || []);
                    } else if (status === 'APPROVED' || status === 'CONFIRMED') {
                        this.activeMembers.set(response.data || []);
                    }
                },
                error: (err) => {
                    this.error.set(err.message || 'Failed to load members');
                }
            })
        );
    }

    /**
     * Update membership status (Approve/Reject)
     */
    updateMemberStatus(membershipId: number, status: 'APPROVED' | 'REJECTED'): Observable<any> {
        return this.http.patch(
            `${this.apiUrl}/memberships/${membershipId}/status`,
            { status }
        );
    }

    /**
     * Update club information
     */
    updateClub(clubId: number, data: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/clubs/${clubId}`, data).pipe(
            tap({
                next: (updatedClub) => {
                    this.clubDetails.set(updatedClub);
                }
            })
        );
    }

    clearError() {
        this.error.set(null);
    }
}
