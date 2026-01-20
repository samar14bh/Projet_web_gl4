
import { Component, inject, computed, signal, ChangeDetectionStrategy} from '@angular/core';
import { CommonModule,  } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClubService } from '../../Core/services/club.service';
import { Club } from '../../Core/models/club.model';
import { ClubComponent } from '../../features/clubs/club-component/club-component/club-component';
import { LazyLoading } from '../../shared/directives/lazy-loading';
import { HeaderComponent } from '../../shared/components/header/header';
import { FooterComponent } from '../../shared/components/footer/footer';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ClubComponent, LazyLoading,HeaderComponent,FooterComponent,ButtonComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent {
  private router = inject(Router);
  private clubService = inject(ClubService);

  
  showAboutSection = signal(false);
  showClubsSection = signal(false);

  topClubsData = toSignal(this.clubService.getTopClubs(), {
    initialValue: [] as Club[]
  });

 


  onAboutVisible() {
    console.log('Section À propos visible - chargement...');
    this.showAboutSection.set(true);
  }

  onClubsVisible() {
    console.log('Section Clubs visible - chargement...');
    this.showClubsSection.set(true);
  }

  isLoading = computed(() => this.topClubsData().length === 0);

  onViewDetails(club: Club) {
    this.router.navigate(['/clubs', club.id]);
  }

  onJoin(club: Club) {
    console.log('Rejoindre le club:', club.name);
  }

  navigateToClubs() {
    this.router.navigate(['/clubs']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
