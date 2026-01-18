import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Event,
  CreateEventDto,
  EventFilters,
  PaginatedResponse,
  EventStats,
  EventStatus, UpdateEventDto,
} from '../models/event.model';
import { environment } from '../../../environments/environment';

/**
 * Service de gestion des événements
 * Utilise les nouvelles fonctionnalités Angular 20 (inject function)
 */
@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/events`;

  /**
   * Récupérer tous les événements avec filtres et pagination
   */
  getEvents(filters: EventFilters = {}): Observable<PaginatedResponse<Event>> {
    let params = new HttpParams();

    // Ajouter les filtres aux query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.append(key, String(value));
      }
    });

    return this.http.get<PaginatedResponse<Event>>(this.apiUrl, { params });
  }

  /**
   * Récupérer un événement par son ID
   */
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les statistiques d'un événement
   */
  getEventStats(id: number): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.apiUrl}/${id}/stats`);
  }

  /**
   * Créer un nouvel événement
   */
  createEvent(dto: CreateEventDto): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, dto);
  }

  /**
   * Mettre à jour un événement
   */
  updateEvent(id: number, dto: UpdateEventDto): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Changer le statut d'un événement
   */
  updateEventStatus(id: number, status: EventStatus): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Supprimer un événement
   */
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  /**
   * Dupliquer un événement
   */
  duplicateEvent(id: number): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/${id}/duplicate`, {});
  }
  /**
   * Récupérer les inscriptions d'un événement
   */
  getEventRegistrations(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${eventId}/registrations`);
  }
}
