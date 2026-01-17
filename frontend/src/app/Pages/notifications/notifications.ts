import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../Core/services/auth.service';
import { NotificationService } from '../../Core/services/notification.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class NotificationComponent {
  private http = inject(HttpClient);
  public authService = inject(AuthService);
  public notificationService = inject(NotificationService);

  // Signaux pour l'UI
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  isLoading = this.notificationService.isLoading;
  sseConnected = this.notificationService.connectedStatus;
  
  // Signal pour le filtre d'affichage avec trois options
  currentFilter = signal<'all' | 'unread' | 'read'>('unread');

  // Signal calculé pour le nombre de notifications lues
  readCount = computed(() => {
    return this.notifications().filter(notif => notif.isRead).length;
  });

  // Signal calculé pour les notifications filtrées
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

  // Signal calculé pour l'ID utilisateur
  userId = computed(() => this.authService.currentUser()?.id);

  loading = false;
  response: any = null;
  error: any = null;

  ngOnInit() {
    console.log('[NotificationComponent] Composant initialisé');
    console.log('[NotificationComponent] SSE connecté:', this.sseConnected());
    console.log('[NotificationComponent] Nombre de notifications:', this.notifications().length);
    console.log('[NotificationComponent] Nombre non lues:', this.unreadCount());
    console.log('[NotificationComponent] Nombre lues:', this.readCount());
  }

  // Méthode pour changer le filtre
  setFilter(filter: 'all' | 'unread' | 'read') {
    this.currentFilter.set(filter);
  }

  // Méthode pour obtenir l'icône en fonction du type de notification
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

  // --- Actions sur les notifications ---
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

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('Toutes les notifications marquées comme lues');
      },
      error: (err) => console.error('Erreur lors du marquage global:', err)
    });
  }

  // Nouvelle méthode pour marquer toutes les notifications comme non lues
  markAllAsUnread() {
    const readNotifications = this.notifications().filter(notif => notif.isRead);
    
    // Marquer chaque notification lue comme non lue
    readNotifications.forEach(notif => {
      this.notificationService.markAsUnread(notif.id).subscribe({
        error: (err) => console.error(`Erreur avec la notification ${notif.id}:`, err)
      });
    });
    
    console.log(`Toutes les ${readNotifications.length} notifications rétablies comme non lues`);
  }

  // --- Logique de Test (Console) ---
  private async sendTestNotification(type: string, data: any) {
    if (!this.isAuthenticated()) {
      this.error = 'Vous devez être authentifié';
      return;
    }

    const payload = { 
      ...data,
      icon: this.getNotificationIcon(type)
    };

    this.loading = true;
    this.response = null;
    this.error = null;

    try {
      console.log(`[TEST] Envoi notification type: ${type}`, payload);
      
      this.response = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/notifications/test/${type}`, payload)
      );
      
      console.log('[TEST] Réponse reçue:', this.response);
      
    } catch (err: any) {
      console.error('[TEST] Erreur:', err);
      this.error = err.error?.message || err.message;
    } finally {
      this.loading = false;
    }
  }

  sendPaymentNotification() {
    this.sendTestNotification('payment', { 
      amount: 49.99, 
      item: 'Cotisation Club',
      description: 'Paiement de votre cotisation club effectué avec succès'
    });
  }

  sendClubNotification() {
    this.sendTestNotification('club', { 
      clubName: 'Club Photo', 
      action: 'acceptée',
      description: 'Votre demande d\'adhésion au Club Photo a été acceptée'
    });
  }

  sendEventNotification() {
    this.sendTestNotification('event', { 
      eventName: 'Conférence Angular', 
      description: 'Nouvel événement: Conférence Angular - Les bonnes pratiques'
    });
  }

  sendCustomNotification() {
    this.sendTestNotification('custom', { 
      message: 'Ceci est une notification personnalisée en temps réel !',
      description: 'Notification personnalisée créée depuis la console de test'
    });
  }

  // Nouvelle méthode pour ouvrir un modal de notification personnalisée
  openCustomNotificationModal() {
    // Pour l'instant, on utilise la méthode existante
    this.sendCustomNotification();
  }

  // Méthode utilitaire pour convertir le type de notification en libellé français
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
  // Dans notifications.ts

sendTestToUser4() {
  this.loading = true;
  this.response = null;
  this.error = null;

  const testDto = {
    type: 'info',
    description: 'Ceci est une notification de test envoyée spécifiquement à l\'utilisateur 4',
    priority: 'medium' as const,
    iconName: 'bell',
    actionLabel: 'Voir le profil'
  };

  this.notificationService.sendToUser(4, testDto).subscribe({
    next: (res) => {
      this.response = res;
      this.loading = false;
      console.log('Succès : Notification envoyée à l\'utilisateur 4', res);
    },
    error: (err) => {
      this.error = err.error?.message || err.message;
      this.loading = false;
      console.error('Erreur lors de l\'envoi à l\'utilisateur 4', err);
    }
  });
}
}