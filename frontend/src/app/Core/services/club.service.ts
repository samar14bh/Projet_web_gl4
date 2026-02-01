import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
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
import { MembershipClubDto } from '../dtos/application/membership-club.dto';

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
    const params = this.createParams(filters);
    return this.http.get<PaginatedClubs>(this.apiUrl, { params });
  }

  /**
   * Récupérer les clubs d'un utilisateur (ceux dont il est membre)
   */
  getUserClubs(userId: number, filters: ClubFilters = {}): Observable<PaginatedClubs> {
    const params = this.createParams(filters);
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
   * Créer un club avec upload de logo (FormData)
   */
  createClubWithLogo(formData: FormData): Observable<Club> {
    return this.http.post<Club>(this.apiUrl, formData);
  }
  /**
   * Mettre à jour un club avec upload de fichiers
   */
  updateClubWithLogo(clubId: number, formData: FormData): Observable<Club> {
    return this.http.patch<Club>(`${this.apiUrl}/${clubId}/update-with-files`, formData);
  }

  /**
   * Upload du logo d'un club
   */
  uploadLogo(clubId: number, formData: FormData): Observable<Club> {
    return this.http.patch<Club>(`${this.apiUrl}/${clubId}/logo`, formData);
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
    return this.http.get<string>(`${this.apiUrl}/status/${clubId}/${userId}`, {
      responseType: 'text' as 'json'
    });
  }
  getUserClubMembershipStatus(clubId: number, userId: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/status/${clubId}/user/${userId}`, {
      responseType: 'text' as 'json'
    });
  }
  /**
   * Récupérer le président d'un club
   */
  getClubPresident(clubId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${clubId}/president`);
  }

  /**
   * Assigner un nouveau président
   */
  assignPresident(clubId: number, userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${clubId}/president`, { userId });
  }

  /**
   * Supprimer le président actuel
   */
  removePresident(clubId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${clubId}/president`);
  }

  /**
   * Récupérer tous les utilisateurs (pour la liste déroulante)
   */
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users`);
  }


  private createParams(filters: any): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
