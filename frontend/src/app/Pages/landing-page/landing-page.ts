import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClubService } from '../../Core/services/club.service';
import { Club } from '../../Core/models/club.model';
import { ClubComponent } from '../../features/clubs/club-component/club-component/club-component';
import { LazyLoading } from '../../shared/directives/lazy-loading';
import { HeaderComponent } from '../../shared/components/header/header';
import { FooterComponent } from '../../shared/components/footer/footer';
import { ButtonComponent } from '../../shared/components/button/button';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    ClubComponent,
    LazyLoading,
    HeaderComponent,
    FooterComponent,
    ButtonComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent {
  private readonly router = inject(Router);
  private readonly clubService = inject(ClubService);
  readonly showAboutSection = signal(false);
  readonly showClubsSection = signal(false);
  readonly topClubsData = toSignal(
    this.clubService.getTopClubs().pipe(
      catchError(error => {
        console.error('Erreur lors du chargement des clubs:', error);
        return of([] as Club[]);
      })
    ),
    { initialValue: [] as Club[] }
  );

  onAboutVisible(): void {
    if (!this.showAboutSection()) {
      console.log('Section À propos visible - chargement...');
      this.showAboutSection.set(true);
    }
  }

  onClubsVisible(): void {
    if (!this.showClubsSection()) {
      console.log('Section Clubs visible - chargement...');
      this.showClubsSection.set(true);
    }
  }

  onViewDetails(club: Club): void {
    this.router.navigate(['/clubs', club.id]);
  }

  navigateToClubs(): void {
    this.router.navigate(['/clubs']);
  }
}