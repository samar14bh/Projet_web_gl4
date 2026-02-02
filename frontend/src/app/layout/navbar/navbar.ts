import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';
import { NotificationService } from '../../Core/services/notification.service';
import { DefaultImagePipe } from '../../shared/pipes/default-image.pipe';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  type: 'info' | 'success' | 'warning';
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, DefaultImagePipe, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  showNotifications = signal(false);
  showUserMenu = signal(false);
  authService = inject(AuthService);
  notificationService = inject(NotificationService);

  user = this.authService.currentUser;
  admin = computed(() => this.authService.isAdmin());
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  private router = inject(Router);



  toggleNotifications(): void {
    this.showNotifications.update(s => !s);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(s => !s);
    this.showNotifications.set(false);
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  getIconClass(type: string): string {
    return this.notificationService.getIconClass(type);
  }
  onLogout(): void {

    if (this.authService.logout) {
      this.authService.logout().subscribe({
        next: (response) => {
          console.log('Logout réussi:', response);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Erreur logout:', err);
          this.router.navigate(['/login']);
        },
        complete: () => {
          console.log('Observable terminé');
        }
      });
    } else {

      this.router.navigate(['/login']);
    }
  }
}
