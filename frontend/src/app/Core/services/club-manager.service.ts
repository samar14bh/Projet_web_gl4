import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClubStats, Member } from '../interfaces/club-manager.interface';
import { Club } from '../models/club.model';

export interface Event {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

/**
 * Service pour les opérations du gestionnaire de club
 * CORRECTION: Basé sur les Applications (qui contiennent le status)
 * et non sur les Memberships
 */
@Injectable({
  providedIn: 'root',
})
export class ClubManagerService {
  private readonly apiUrl = `${environment.apiUrl}`;

  // ============================================
  // SIGNAUX
  // ============================================
  /** Détails du club actuel */
  clubDetails = signal<any>(null);

  /** Statistiques du club */
  clubStats = signal<ClubStats | null>(null);

  /** Demandes d'adhésion en attente (Application PENDING) */
  pendingMembers = signal<Member[]>([]);

  /** Membres actifs approuvés (Application APPROVED) */
  activeMembers = signal<Member[]>([]);

  /** Événements à venir */
  upcomingEventsList = signal<Event[]>([]);

  /** En attente du chargement */
  loading = signal(false);

  /** Message d'erreur */
  error = signal<string | null>(null);

  constructor(private http: HttpClient) { }

  // ============================================
  // CLUBS - Récupérer les clubs gérés
  // ============================================

  /**
   * Récupérer les clubs gérés par un utilisateur
   */
  getManagedClubs(userId: number): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.apiUrl}/clubs/managed/${userId}`);
  }

  // ============================================
  // STATISTIQUES - Récupérer les stats du club
  // ============================================

  /**
   * Récupérer les statistiques détaillées du club pour le tableau de bord
   */
  getClubDetailedStats(clubId: number): Observable<any> {
    this.loading.set(true);
    return this.http.get<any>(`${this.apiUrl}/clubs/${clubId}/stats`).pipe(
      tap({
        next: (stats) => {
          this.clubStats.set(stats);
          this.loading.set(false);
        },
        error: (err: any) => {
          this.error.set(err.message || 'Erreur lors du chargement des statistiques');
          this.loading.set(false);
        },
      })
    );
  }

  /**
   * Récupérer les détails du club
   */
  getClubDetails(clubId: number): Observable<any> {
    this.loading.set(true);
    return this.http.get<any>(`${this.apiUrl}/clubs/${clubId}`).pipe(
      tap({
        next: (club) => {
          this.clubDetails.set(club);
          this.loading.set(false);
        },
        error: (err: any) => {
          this.error.set(err.message || 'Erreur lors du chargement du club');
          this.loading.set(false);
        },
      })
    );
  }

  // ============================================
  // MEMBRES & APPLICATIONS - Récupérer les demandes
  // ============================================

  /**
   * ✅ CORRIGÉ: Récupérer les demandes d'adhésion par statut
   *
   * IMPORTANT: Basé sur l'entité Application (qui contient le status)
   *
   * Les statuts possibles:
   * - "PENDING" → Demandes en attente d'approbation
   * - "APPROVED" → Demandes approuvées (adhésions actives)
   * - "REJECTED" → Demandes rejetées
   *
   * Cette méthode récupère les applications (demandes) et non directement les memberships
   */
  getMembers(
    clubId: number,
    status?: string,
    page?: number,
    limit?: number
  ): Observable<any> {
    let params = new HttpParams();

    // Ajouter le clubId (toujours requis)
    params = params.set('clubId', clubId.toString());

    // Ajouter le statut (PENDING, APPROVED, REJECTED)
    if (status) {
      params = params.set('status', status);
    }

    // Pagination
    if (page) {
      params = params.set('page', page.toString());
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    // ✅ CORRECTION: Récupérer depuis /applications
    // Cet endpoint retourne les demandes avec leur status
    return this.http.get<any>(
      `${this.apiUrl}/applications`,
      { params }
    ).pipe(
      tap({
        next: (response) => {
          // Mettre à jour les signaux selon le statut
          if (status === 'PENDING') {
            // Demandes en attente
            this.pendingMembers.set(response.data || []);
          } else if (status === 'APPROVED') {
            // Demandes approuvées (membres actifs)
            this.activeMembers.set(response.data || []);
          }
        },
        error: (err: any) => {
          this.error.set(err.message || 'Erreur lors du chargement des membres');
        }
      })
    );
  }

  // ============================================
  // ÉVÉNEMENTS - Récupérer les événements
  // ============================================

  /**
   * Récupérer les événements à venir du club
   */
  getUpcomingEvents(clubId: number): Observable<Event[]> {
    return this.http.get<Event[]>(
      `${this.apiUrl}/clubs/${clubId}/events/upcoming`
    ).pipe(
      tap({
        next: (events: Event[]) => {
          this.upcomingEventsList.set(events);
        },
        error: (err: any) => {
          this.error.set(err.message || 'Erreur lors du chargement des événements');
        }
      })
    );
  }

  // ============================================
  // GESTION DES DEMANDES - Approuver/Rejeter
  // ============================================

  /**
   * ✅ CORRIGÉ: Mettre à jour le statut d'une application (demande d'adhésion)
   *
   * Les statuts possibles: 'APPROVED' | 'REJECTED' | 'PENDING'
   *
   * Cette action:
   * 1. Approuve ou rejette une demande d'adhésion
   * 2. Crée automatiquement une Membership si approuvée
   * 3. Met à jour le statut de l'Application
   */
  updateMemberStatus(
    applicationId: number,
    status: 'APPROVED' | 'REJECTED'
  ): Observable<any> {
    // ✅ CORRECTION: Utiliser l'endpoint /applications
    // Et non /memberships
    return this.http.patch(
      `${this.apiUrl}/applications/${applicationId}/status`,
      { status }
    );
  }

  // ============================================
  // GESTION DU CLUB - Mettre à jour les infos
  // ============================================

  /**
   * Mettre à jour les informations du club
   */
  updateClub(clubId: number, data: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/clubs/${clubId}`,
      data
    ).pipe(
      tap({
        next: (updatedClub) => {
          this.clubDetails.set(updatedClub);
        },
        error: (err: any) => {
          this.error.set(err.message || 'Erreur lors de la mise à jour');
        }
      })
    );
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  /**
   * Effacer le message d'erreur
   */
  clearError() {
    this.error.set(null);
  }
}
