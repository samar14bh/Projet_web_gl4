import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';
import { ClubService } from '../../Core/services/club.service';
import { MembershipClubDto } from '../../Core/dtos/membership-club.dto';
import { ClubResponsabilityService } from '../../Core/services/club-responsability.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
  isLogout?: boolean;
  showWhenAuthenticated?: boolean;
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
  private clubService = inject(ClubService);
  private router = inject(Router);
  private clubResponsabilityService = inject(ClubResponsabilityService);

  isLoggedIn = computed(() => !!this.authService.currentUser());
  isAdmin = computed(() => this.authService.isAdmin());
  specialClubs = this.clubService.getClubsWithSpecialMembershipsResource(() => this.authService.currentUser()?.id ?? 0);
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

  selectClub(club: MembershipClubDto): void {
    this.clubResponsabilityService.setClub(club);
    this.router.navigate(['/club-responsability', club.membershipId]);
  }


}
