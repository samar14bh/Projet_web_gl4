import {Component, computed, effect, EventEmitter, inject, output, Output, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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


  toggleSidebar = output<void>();

  showNotifications = signal(false);
  showUserMenu = signal(false);
  authService = inject(AuthService);
  user = this.authService.currentUser;
  admin = computed(() => this.authService.isAdmin());
  private router = inject(Router);




  toggleUserMenu(): void {
    this.showUserMenu.update(s => !s);
    this.showNotifications.set(false);
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
