import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApplicationResponse,
  Club,
  ClubSettings,
  ClubStats,
  MemberResponse,
  MemberRole,
  MembersStats
} from '../interfaces/club-manager.interface';
import { DashboardEvent, DashboardMember } from '../interfaces/club-dashboard.interface';


@Injectable({ providedIn: 'root' })
export class ClubManagerService {
  private api = `${environment.apiUrl}/club-manager`;

  // SIGNAUX
  clubStats = signal<ClubStats | null>(null);
  pendingMembers = signal<DashboardMember[]>([]);
  activeMembers = signal<DashboardMember[]>([]);
  upcomingEvents = signal<DashboardEvent[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient) {}

  // ========================
  // DASHBOARD
  // ========================
  loadDashboard(clubId: number) {
    this.loading.set(true);
    forkJoin({
      stats: this.http.get<ClubStats>(`${this.api}/${clubId}/dashboard/stats`),
      pending: this.http.get<DashboardMember[]>(`${this.api}/${clubId}/dashboard/pending-members`),
      members: this.http.get<DashboardMember[]>(`${this.api}/${clubId}/dashboard/recent-members`),
      events: this.http.get<DashboardEvent[]>(`${this.api}/${clubId}/dashboard/upcoming-events`),
    }).subscribe({
      next: res => {
        this.clubStats.set(res.stats);
        this.pendingMembers.set(res.pending);
        this.activeMembers.set(res.members);
        this.upcomingEvents.set(res.events);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ========================
  // CLUB DETAILS & STATS
  // ========================
  getClubDetails(clubId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/clubs/${clubId}`);
  }

  getClubDetailedStats(clubId: number): Observable<ClubStats> {
    return this.http.get<ClubStats>(`${this.api}/${clubId}/dashboard/stats`);
  }

  updateClubSettings(clubId: number, settings: ClubSettings): Observable<any> {
    return this.http.patch(
      `${this.api}/${clubId}/settings`,
      settings
    );
  }

  // ========================
  // APPLICATIONS MANAGEMENT
  // ========================
  updateMemberStatus(
    applicationId: number,
    status: 'APPROVED' | 'REJECTED'
  ): Observable<any> {
    return this.http.patch(`${this.api}/applications/${applicationId}/status`, {
      status,
    });
  }

  // ========================
  // CLUB UPDATE
  // ========================
  updateClub(clubId: number, payload: any): Observable<any> {
    return this.http.patch(`${this.api}/${clubId}`, payload);
  }

  // ========================
  // MEMBERS MANAGEMENT
  // ========================

  // ✅ OBTENIR TOUS LES MEMBRES
  getMembers(
    clubId: number,
    page?: number,
    limit?: number,
    role?: MemberRole,
    search?: string
  ): Observable<MemberResponse> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (role) params = params.set('role', role);
    if (search) params = params.set('search', search);

    return this.http.get<MemberResponse>(`${this.api}/${clubId}/members`, {
      params,
    });
  }

  // ✅ OBTENIR LES MEMBRES DU BUREAU - NOUVELLE MÉTHODE
  getBureauMembers(
    clubId: number,
    page?: number,
    limit?: number,
    search?: string
  ): Observable<MemberResponse> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (search) params = params.set('search', search);

    return this.http.get<MemberResponse>(
      `${this.api}/${clubId}/members/bureau`,
      { params }
    );
  }

  // ✅ OBTENIR LES STATISTIQUES DES MEMBRES
  getMembersStats(clubId: number): Observable<MembersStats> {
    return this.http.get<MembersStats>(`${this.api}/${clubId}/members/stats`);
  }

  // ✅ ASSIGNER UN RÔLE À UN MEMBRE
  assignRole(membershipId: number, role?: MemberRole): Observable<any> {
    return this.http.patch(`${this.api}/members/${membershipId}/role`, {
      role,
    });
  }

  // ✅ RETIRER UN MEMBRE
  removeMember(membershipId: number): Observable<any> {
    return this.http.delete(`${this.api}/members/${membershipId}`);
  }

  // ========================
  // APPLICATIONS MANAGEMENT
  // ========================

  // ✅ OBTENIR LES DEMANDES D'ADHÉSION
  getApplications(
    clubId: number,
    page?: number,
    limit?: number,
    status?: string
  ): Observable<ApplicationResponse> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());
    if (status) params = params.set('status', status);

    return this.http.get<ApplicationResponse>(
      `${this.api}/${clubId}/applications`,
      { params }
    );
  }

  // ✅ METTRE À JOUR LE STATUT D'UNE APPLICATION
  updateApplicationStatus(
    applicationId: number,
    status: 'APPROVED' | 'REJECTED'
  ): Observable<any> {
    return this.http.patch(`${this.api}/applications/${applicationId}/status`, {
      status,
    });
  }

  // ========================
  // EVENTS
  // ========================
  getUpcomingEvents(clubId: number): Observable<DashboardEvent[]> {
    return this.http.get<DashboardEvent[]>(
      `${this.api}/${clubId}/dashboard/upcoming-events`
    );
  }

  getTotalEventsByClub(clubId: number): Observable<number> {
    return this.http.get<number>(`${this.api}/${clubId}/dashboard/total-events`);
  }

  // ========================
  // UTILITIES
  // ========================
  getLoading() {
    return this.loading();
  }

  clubStatsValue() {
    return this.clubStats();
  }

  pendingMembersValue() {
    return this.pendingMembers();
  }
}
