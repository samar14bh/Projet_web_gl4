import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Core/services/auth.service';
import { NotificationService } from '../../Core/services/notification.service';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class NotificationComponent {
  public authService = inject(AuthService);
  public notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  isLoading = this.notificationService.isLoading;
  sseConnected = this.notificationService.connectedStatus;
  currentFilter = signal<'all' | 'unread' | 'read'>('unread');
  readCount = computed(() => {
    return this.notifications().filter(notif => notif.isRead).length;
  });
  filteredNotifications = computed(() => {
    const filter = this.currentFilter();
    const allNotifications = this.notifications();
    
    switch (filter) {
      case 'unread':
        return allNotifications.filter(notif => !notif.isRead);
      case 'read':
        return allNotifications.filter(notif => notif.isRead);
      case 'all':
      default:
        return allNotifications;
    }
  });
  userId = computed(() => this.authService.currentUser()?.id);

  loading = false;
  response: any = null;
  error: any = null;

  ngOnInit() {
    console.log('[NotificationComponent] Composant initialisé');
  }

  setFilter(filter: 'all' | 'unread' | 'read') {
    this.currentFilter.set(filter);
  }

  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'payment': 'bi bi-credit-card',
      'club': 'bi bi-person-circle',
      'event': 'bi bi-calendar-event',
      'custom': 'bi bi-chat-dots',
      'info': 'bi bi-info-circle',
      'warning': 'bi bi-exclamation-triangle',
      'success': 'bi bi-check-circle',
      'error': 'bi bi-x-circle',
      'default': 'bi bi-bell'
    };
    
    const cleanType = type?.toLowerCase().trim() || 'default';
    return iconMap[cleanType] || iconMap['default'];
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }
  
  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        console.log(`Notification ${id} marquée comme lue`);
      },
      error: (err) => console.error('Erreur lors du marquage comme lu:', err)
    });
  }

  markAsUnread(id: number) {
    this.notificationService.markAsUnread(id).subscribe({
      next: () => console.log(`Notification ${id} rétablie comme non lue`),
      error: (err) => console.error('Erreur lors du rétablissement non lu:', err)
    });
  }

  getNotificationTypeLabel(type: string): string {
    const labelMap: { [key: string]: string } = {
      'payment': 'Paiement',
      'club': 'Club',
      'event': 'Événement',
      'custom': 'Personnalisée',
      'info': 'Information',
      'warning': 'Avertissement',
      'success': 'Succès',
      'error': 'Erreur'
    };
    
    return labelMap[type.toLowerCase()] || type;
  }

  
}