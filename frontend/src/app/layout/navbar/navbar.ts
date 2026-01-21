import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';
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
  private readonly authService = inject(AuthService);
  user = this.authService.currentUser;


  notifications: Notification[] = [
    {
      id: 1,
      title: 'New message',
      message: 'You have a new message from John',
      time: '2m ago',
      read: false,
      icon: 'bi-chat-dots',
      type: 'info'
    },
    {
      id: 2,
      title: 'Task completed',
      message: 'Your report has been generated',
      time: '1h ago',
      read: false,
      icon: 'bi-check-circle',
      type: 'success'
    },
    {
      id: 3,
      title: 'System update',
      message: 'System maintenance scheduled',
      time: '3h ago',
      read: true,
      icon: 'bi-exclamation-triangle',
      type: 'warning'
    }
  ];

  unreadCount = computed(() => this.notifications.filter(n => !n.read).length);

  toggleNotifications(): void {
    this.showNotifications.update(s => !s);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(s => !s);
    this.showNotifications.set(false);
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }
}
