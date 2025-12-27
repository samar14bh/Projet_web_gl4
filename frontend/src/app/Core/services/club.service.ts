import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Club,
  Category,
  ClubFilters,
  PaginatedClubs,
  ClubsStats,
  CreateClubDto,
  UpdateClubDto,
} from '../models/club.model';
import { environment } from '../../../environments/environment';

/**
 * Service pour gérer les clubs (Admin)
 */
@Injectable({
  providedIn: 'root',
})
export class ClubService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clubs`;

  /**
   * Récupérer tous les clubs avec filtres et pagination
   */
  getClubs(filters: ClubFilters): Observable<PaginatedClubs> {
    let params = new HttpParams();

    if (filters.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }

    if (filters.categoryId && filters.categoryId !== 'all') {
      params = params.set('categoryId', filters.categoryId.toString());
    }

    if (filters.search) {
      params = params.set('search', filters.search);
    }

    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }

    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }

    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }

    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedClubs>(this.apiUrl, { params });
  }

  /**
   * Récupérer les clubs d'un utilisateur (ceux dont il est membre)
   */
  getUserClubs(userId: number, filters: ClubFilters = {}): Observable<PaginatedClubs> {
    let params = new HttpParams();

    if (filters.categoryId && filters.categoryId !== 'all') {
      params = params.set('categoryId', filters.categoryId.toString());
    }

    if (filters.search) {
      params = params.set('search', filters.search);
    }

    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }

    if (filters.sortOrder) {
      params = params.set('sortOrder', filters.sortOrder);
    }

    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }

    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedClubs>(`${this.apiUrl}/user-clubs/${userId}`, { params });
  }

  /**
   * Récupérer un club par son ID
   */
  getClubById(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les statistiques des clubs
   */
  getClubsStats(): Observable<ClubsStats> {
    return this.http.get<ClubsStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Récupérer toutes les catégories
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }

  /**
   * Créer un nouveau club
   */
  createClub(dto: CreateClubDto): Observable<Club> {
    return this.http.post<Club>(this.apiUrl, dto);
  }

  /**
   * Mettre à jour un club
   */
  updateClub(id: number, dto: UpdateClubDto): Observable<Club> {
    return this.http.patch<Club>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Activer/Désactiver un club
   */
  toggleClubStatus(id: number, isActive: boolean): Observable<Club> {
    return this.http.patch<Club>(`${this.apiUrl}/${id}/status`, { isActive });
  }

  /**
   * Supprimer un club
   */
  deleteClub(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  /**
   * Récupérer les détails d'adhésion d'un utilisateur à un club
   */
  getClubMembershipDetails(clubId: number, userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${clubId}/membership/${userId}`);
  }

  /**
   * Quitter un club
   */
  leaveClub(clubId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${clubId}/leave/${userId}`);
  }


  getTopClubs(): Observable<Club[]> {
  return this.http.get<Club[]>(`${this.apiUrl}/top`);
}
getUserClubStatus(clubId: number, userId: number): Observable<string> {
  return this.http.get<string>(`${this.apiUrl}/${clubId}/user/${userId}/status`, {
    responseType: 'text' as 'json'
  });
}

}
