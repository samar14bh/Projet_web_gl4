import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
  isLogout?: boolean;
  showWhenAuthenticated?: boolean; // Nouvelle propriété
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Nouvelle propriété pour vérifier si l'utilisateur est connecté
  isLoggedIn = computed(() => this.authService.isAuthenticated());

  onMenuItemClick(item: MenuItem): void {
    if (item.isLogout) {
      this.onLogout();
    }
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