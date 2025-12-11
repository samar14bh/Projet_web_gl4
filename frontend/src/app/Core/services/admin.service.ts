import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GlobalStats,
  TopClub,
  RecentActivity,
  MembershipTrendData,
  EventsTrendData,
  RevenueTrendData,
  Alert,
  ClubCategoryDistribution,
  AdminDashboardData,
} from '../models/admin.model';

/**
 * Service pour la gestion du dashboard administrateur
 */
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  /**
   * Récupérer toutes les données du dashboard
   */
  getDashboardData(period: string): Observable<AdminDashboardData> {
    const params = new HttpParams().set('period', period);
    return this.http.get<AdminDashboardData>(`${this.apiUrl}/dashboard`, { params });
  }

  /**
   * Récupérer les statistiques globales
   */
  getGlobalStats(period: string): Observable<GlobalStats> {
    const params = new HttpParams().set('period', period);
    return this.http.get<GlobalStats>(`${this.apiUrl}/stats`, { params });
  }

  /**
   * Récupérer les clubs les plus actifs
   */
  getTopClubs(period: string, limit: number = 4): Observable<TopClub[]> {
    const params = new HttpParams()
      .set('period', period)
      .set('limit', limit.toString());
    return this.http.get<TopClub[]>(`${this.apiUrl}/top-clubs`, { params });
  }

  /**
   * Récupérer les activités récentes
   */
  getRecentActivities(limit: number = 5): Observable<RecentActivity[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/activities`, { params });
  }

  /**
   * Récupérer les données de tendance des membres
   */
  getMembershipTrend(months: number = 6): Observable<MembershipTrendData[]> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<MembershipTrendData[]>(`${this.apiUrl}/membership-trend`, { params });
  }

  /**
   * Récupérer les données de tendance des événements
   */
  getEventsTrend(months: number = 6): Observable<EventsTrendData[]> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<EventsTrendData[]>(`${this.apiUrl}/events-trend`, { params });
  }

  /**
   * Récupérer les données de tendance des revenus
   */
  getRevenueTrend(months: number = 6): Observable<RevenueTrendData[]> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<RevenueTrendData[]>(`${this.apiUrl}/revenue-trend`, { params });
  }

  /**
   * Récupérer les alertes
   */
  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}/alerts`);
  }

  /**
   * Récupérer la distribution des clubs par catégorie
   */
  getClubsByCategory(): Observable<ClubCategoryDistribution[]> {
    return this.http.get<ClubCategoryDistribution[]>(`${this.apiUrl}/clubs-by-category`);
  }

  /**
   * Exporter le rapport en PDF
   */
  exportReportPDF(period: string): Observable<Blob> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/export/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  /**
   * Exporter le rapport en Excel
   */
  exportReportExcel(period: string): Observable<Blob> {
    const params = new HttpParams().set('period', period);
    return this.http.get(`${this.apiUrl}/export/excel`, {
      params,
      responseType: 'blob',
    });
  }
}
