import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../Core/services/auth.service';
import { SseService } from '../../Core/services/sse.service';
import { NotificationResponse, UnreadCountResponse, Notification as AppNotification } from '../../Core/models/notification.model';

export interface CreateNotificationDto {
  type: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  iconName?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface SendToUserDto extends CreateNotificationDto {
  targetUserId: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly sseClient = inject(SseService);
  
  private readonly API_URL = `${environment.apiUrl}/notifications`;

  notifications = signal<AppNotification[]>([]);
  unreadCount = signal<number>(0);
  connectedStatus = this.sseClient.isConnected;
  isLoading = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        console.log('[NotificationService] Utilisateur authentifié, connexion SSE...');
        this.connectSSE();
        
        this.loadNotifications().subscribe({
          next: (notifs) => console.log('[NotificationService] Notifications chargées:', notifs.length),
          error: (err) => console.error('[NotificationService] Erreur chargement notifications:', err)
        });
        
        this.loadUnreadCount().subscribe({
          next: (response) => console.log('[NotificationService] Count non lus:', response.count),
          error: (err) => console.error('[NotificationService] Erreur chargement count:', err)
        });
      } else {
        console.log('[NotificationService] Utilisateur non authentifié, déconnexion SSE...');
        this.disconnectSSE();
        this.notifications.set([]);
        this.unreadCount.set(0);
      }
    });
  }

  createNotification(dto: CreateNotificationDto): Observable<AppNotification> {
    return this.http.post<AppNotification>(`${this.API_URL}/create`, dto).pipe(
      tap(notification => {
        console.log('[NotificationService] Notification créée pour utilisateur connecté:', notification);
      }),
      catchError(error => {
        console.error('[NotificationService] Erreur création notification:', error);
        return throwError(() => error);
      })
    );
  }

  sendToUser(userId: number, dto: CreateNotificationDto): Observable<AppNotification> {
    const payload: SendToUserDto = { ...dto, targetUserId: userId };
    return this.http.post<AppNotification>(`${this.API_URL}/send-to-user`, payload).pipe(
      tap(notification => {
        console.log(`[NotificationService] Notification envoyée à l'utilisateur ${userId}:`, notification);
      }),
      catchError(error => {
        console.error('[NotificationService] Erreur envoi notification:', error);
        return throwError(() => error);
      })
    );
  }

  sendToUsers(userIds: number[], dto: CreateNotificationDto): Observable<AppNotification[]> {
    const payload = { ...dto, targetUserIds: userIds };
    return this.http.post<AppNotification[]>(`${this.API_URL}/send-to-users`, payload).pipe(
      tap(notifications => {
        console.log(`[NotificationService] Notifications envoyées à ${userIds.length} utilisateurs`);
      }),
      catchError(error => {
        console.error('[NotificationService] Erreur envoi notifications multiples:', error);
        return throwError(() => error);
      })
    );
  }

  success(message: string, actionUrl?: string, actionLabel?: string): Observable<AppNotification> {
    return this.createNotification({
      type: 'SUCCESS',
      description: message,
      priority: 'low',
      iconName: 'check-circle',
      actionUrl,
      actionLabel
    });
  }

  info(message: string, actionUrl?: string, actionLabel?: string): Observable<AppNotification> {
    return this.createNotification({
      type: 'INFO',
      description: message,
      priority: 'medium',
      iconName: 'bell',
      actionUrl,
      actionLabel
    });
  }

  warning(message: string, actionUrl?: string, actionLabel?: string): Observable<AppNotification> {
    return this.createNotification({
      type: 'WARNING',
      description: message,
      priority: 'high',
      iconName: 'alert-circle',
      actionUrl,
      actionLabel
    });
  }

  error(message: string, actionUrl?: string, actionLabel?: string): Observable<AppNotification> {
    return this.createNotification({
      type: 'ERROR',
      description: message,
      priority: 'high',
      iconName: 'alert-circle',
      actionUrl,
      actionLabel
    });
  }

  payment(data: { amount: number; item: string; status?: 'success' | 'failed' }): Observable<AppNotification> {
    return this.createNotification({
      type: 'PAYMENT',
      description: data.status === 'failed' 
        ? `Échec du paiement de ${data.amount}€ pour ${data.item}`
        : `Paiement de ${data.amount}€ effectué pour ${data.item}`,
      priority: data.status === 'failed' ? 'high' : 'medium',
      iconName: 'credit-card'
    });
  }

  event(data: { name: string; date?: Date; url?: string }): Observable<AppNotification> {
    const dateStr = data.date ? ` le ${data.date.toLocaleDateString('fr-FR')}` : '';
    return this.createNotification({
      type: 'EVENT',
      description: `Nouvel événement: ${data.name}${dateStr}`,
      priority: 'medium',
      iconName: 'calendar',
      actionUrl: data.url,
      actionLabel: 'Voir l\'événement'
    });
  }

  club(data: { clubName: string; action: string; url?: string }): Observable<AppNotification> {
    return this.createNotification({
      type: 'CLUB',
      description: `${data.clubName}: ${data.action}`,
      priority: 'medium',
      iconName: 'users',
      actionUrl: data.url,
      actionLabel: 'Voir le club'
    });
  }

  message(data: { from: string; preview?: string; url?: string }): Observable<AppNotification> {
    const description = data.preview 
      ? `Nouveau message de ${data.from}: ${data.preview}`
      : `Nouveau message de ${data.from}`;
    
    return this.createNotification({
      type: 'MESSAGE',
      description,
      priority: 'medium',
      iconName: 'message-circle',
      actionUrl: data.url,
      actionLabel: 'Lire le message'
    });
  }

  getByType(type: string): AppNotification[] {
    return this.notifications().filter(n => n.type === type);
  }

  getByPriority(priority: 'low' | 'medium' | 'high'): AppNotification[] {
    return this.notifications().filter(n => n.priority === priority);
  }

  getUnread(): AppNotification[] {
    return this.notifications().filter(n => !n.isRead);
  }

  getRead(): AppNotification[] {
    return this.notifications().filter(n => n.isRead);
  }

  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${notificationId}`).pipe(
      tap(() => {
        this.notifications.update(list => list.filter(n => n.id !== notificationId));
        console.log(`[NotificationService] Notification ${notificationId} supprimée`);
      }),
      catchError(error => {
        console.error('[NotificationService] Erreur suppression notification:', error);
        return throwError(() => error);
      })
    );
  }

  deleteAllRead(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/delete-all-read`).pipe(
      tap(() => {
        this.notifications.update(list => list.filter(n => !n.isRead));
        console.log('[NotificationService] Toutes les notifications lues supprimées');
      }),
      catchError(error => {
        console.error('[NotificationService] Erreur suppression notifications lues:', error);
        return throwError(() => error);
      })
    );
  }

  connectSSE(): void {
    this.sseClient.connect(
      (data) => this.handleSSEMessage(data),
      (error) => console.error('[NotificationService][SSE] Erreur:', error)
    );
  }

  disconnectSSE(): void {
    this.sseClient.disconnect();
  }

  private handleSSEMessage(data: any): void {
    if (data.type === 'notification' && data.data) {
      const payload: NotificationResponse = data.data;

      switch (payload.type) {
        case 'NEW_NOTIFICATION':
          if (payload.notification && !this.notifications().some(n => n.id === payload.notification?.id)) {
            this.notifications.update(list => [payload.notification!, ...list]);
            this.unreadCount.update(c => c + 1);
          }
          break;

        case 'NOTIFICATION_READ':
          if (payload.notificationId) {
            this.updateNotificationReadStatus(payload.notificationId, true);
            this.unreadCount.update(c => Math.max(0, c - 1));
          }
          break;

        case 'NOTIFICATION_UNREAD':
          if (payload.notificationId) {
            this.updateNotificationReadStatus(payload.notificationId, false);
            this.unreadCount.update(c => c + 1);
          }
          break;

        case 'ALL_NOTIFICATIONS_READ':
          this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
          this.unreadCount.set(0);
          break;
      }
    }
  }

  private updateNotificationReadStatus(id: number, isRead: boolean) {
    this.notifications.update(list => 
      list.map(n => n.id === id ? { ...n, isRead } : n)
    );
  }

  loadNotifications(): Observable<AppNotification[]> {
    this.isLoading.set(true);
    return this.http.get<AppNotification[]>(this.API_URL).pipe(
      tap(notifications => {
        this.notifications.set(notifications);
        this.isLoading.set(false);
      }),
      catchError(error => {
        console.error('[NotificationService] Erreur chargement notifications:', error);
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  loadUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.API_URL}/unread/count`).pipe(
      tap(response => this.unreadCount.set(response.count)),
      catchError(error => {
        console.error('[NotificationService] Erreur chargement count:', error);
        return throwError(() => error);
      })
    );
  }

  markAsRead(notificationId: number): Observable<AppNotification> {
    return this.http.post<AppNotification>(`${this.API_URL}/mark-read/${notificationId}`, {}).pipe(
      tap(() => {
        this.updateNotificationReadStatus(notificationId, true);
        this.unreadCount.update(count => Math.max(0, count - 1));
      }),
      catchError(error => {
        console.error('[NotificationService] Erreur mark as read:', error);
        return throwError(() => error);
      })
    );
  }

  markAsUnread(id: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/mark-unread/${id}`, {}).pipe(
      tap(() => {
        this.updateNotificationReadStatus(id, false);
        this.unreadCount.update(c => c + 1);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/mark-all-read`, {}).pipe(
      tap(() => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      }),
      catchError(error => {
        console.error('[NotificationService] Erreur mark all as read:', error);
        return throwError(() => error);
      })
    );
  }

  getIconClass(iconName: string): string {
    const iconMap: Record<string, string> = {
      'credit-card': 'bi bi-credit-card',
      'users': 'bi bi-person-circle',
      'calendar': 'bi bi-calendar-event',
      'message-circle': 'bi bi-chat-dots',
      'alert-circle': 'bi bi-exclamation-triangle',
      'award': 'bi bi-award',
      'bell': 'bi bi-bell',
      'check-circle': 'bi bi-check-circle',
      'info': 'bi bi-info-circle',
      'person-badge': 'bi bi-person-badge'
    };
    return iconMap[iconName] || 'bi bi-bell';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: Record<string, string> = {
      'high': 'bg-red-100 text-red-800 border-red-200',
      'medium': 'bg-blue-100 text-blue-800 border-blue-200',
      'low': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return priorityMap[priority] || priorityMap['medium'];
  }
}