import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Event,
  CreateEventDto,
  EventFilters,
  PaginatedResponse,
  EventStats,
  EventStatus, UpdateEventDto,
  EventType, RegistrationStatus, EventWithUserRegistration
} from '../models/event.model';
import { environment } from '../../../environments/environment';
import { PaginatedResult } from '../models/paginated-result.model';
import { UserEventDto } from '../dtos/user-event.dto';

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
   * Créer un événement avec upload d'image
   */
  createEventWithFile(formData: FormData): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, formData);
  }

  /**
   * Mettre à jour un événement avec upload d'image
   */
  updateEventWithFile(id: number, formData: FormData): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/update-with-file`, formData);
  }


  /**
   * Récupérer les inscriptions d'un événement
   */
  getEventRegistrations(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${eventId}/registrations`);
  }

  /**
   * Récupérer les événements d'un utilisateur
   */
  getUserEvents(
    userId: number,
    page = 1,
    limit = 10,
    search?: string,
    status?: EventStatus | '',
    type?: EventType | '',
    sortBy: 'date' | 'title' | 'registrations' = 'date',
    order: 'asc' | 'desc' = 'asc',
  ): Observable<PaginatedResult<UserEventDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('order', order);

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (type) params = params.set('type', type);

    return this.http.get<PaginatedResult<UserEventDto>>(
      `${this.apiUrl}/user-events/${userId}`,
      { params },
    );
  }





  cancelRegistration(eventId: number) {
    return this.http.post(`${this.apiUrl}/${eventId}/cancel`, {});
  }

  downloadReceipt(eventId: number) {
    return this.http.get(`${this.apiUrl}/${eventId}/receipt`, { responseType: 'blob' });
  }

  getEventDetails(userId: () => number, eventId: () => number) {
    return httpResource<UserEventDto>(() => {
      const u = userId();
      const e = eventId();
      if (!u || !e) return undefined;
      return `${this.apiUrl}/user-event-details/${u}?eventId=${e}`;
    });
  }

  /**
   * Discovery: Récupérer tous les événements avec le statut pour un utilisateur
   */
  getEventsDiscovery(
    userId: number,
    filters: EventFilters = {}
  ): Observable<PaginatedResult<UserEventDto>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.append(key, String(value));
      }
    });

    return this.http.get<PaginatedResult<UserEventDto>>(
      `${this.apiUrl}/discovery/${userId}`,
      { params }
    );
  }
}

