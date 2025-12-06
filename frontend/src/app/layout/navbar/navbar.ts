import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  showNotifications = false;
  showUserMenu = false;

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

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }
}
