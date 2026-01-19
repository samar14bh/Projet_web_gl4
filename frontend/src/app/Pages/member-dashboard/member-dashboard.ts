import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MemberDashboardService } from '../../Core/services/member-dashboard.service';
import { UpcomingEvent } from '../../Core/models/dashboard.model';
import { AuthService } from '../../Core/services/auth.service';
import { EventCardComponent } from '../../shared/components/event-card-component/event-card';
import { ClubComponent } from '../../features/clubs/club-component/club-component/club-component';
import { createPaginationClubs } from '../../shared/utils/pagination-clubs.util';
import { 
  createFilterControlsClubs, 
  createSortControlsClubs, 
  handleSortChangeClubs, 
  handleSearchClubs, 
  sortItemsClubs 
} from '../../shared/utils/filter-sort-clubs.util';
import { ButtonComponent } from '../../shared/components/button/button';
import { createResource } from '../../shared/utils/resource-loader.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, EventCardComponent, ClubComponent, ButtonComponent],
  templateUrl: './member-dashboard.html',
  styleUrls: ['./member-dashboard.css']
})
export class MemberDashboardComponent {
  private dashboardService = inject(MemberDashboardService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // --- Gestion des données (Refactorisé avec ResourceLoader) ---
  readonly dashboardRes = createResource({
    loader: () => this.dashboardService.getMemberDashboard()
  });

  readonly currentUser = this.authService.currentUser;
  readonly isLoading = this.dashboardRes.isLoading;
  readonly error = this.dashboardRes.error;

  // --- Filtres et Tri ---
  private filterControls = createFilterControlsClubs({ hasPrice: true });
  private sortControls = createSortControlsClubs<'date' | 'title' | 'price'>('date');

  readonly searchQuery = this.filterControls.searchQuery;
  readonly priceFilter = this.filterControls.priceFilter!;
  readonly sortBy = this.sortControls.sortBy;
  readonly sortOrder = this.sortControls.sortOrder;

  // --- Sélecteurs réactifs ---
  readonly stats = computed(() => this.dashboardRes.data()?.stats || null);
  readonly upcomingEvents = computed(() => this.dashboardRes.data()?.upcomingEvents || []);
  
  readonly recommendedClubs = toSignal(
    this.dashboardService.getRecommendedClubs(), 
    { initialValue: [] }
  );

  readonly welcomeMessage = computed(() => {
    const user = this.currentUser();
    return user ? `Bonjour ${user.name} ${user.lastName}` : 'Bonjour';
  });

  // Logique de filtrage et tri combinée
  readonly filteredEvents = computed(() => {
    let events = this.upcomingEvents();
    const query = this.searchQuery().toLowerCase();
    const priceMode = this.priceFilter();

    if (query) {
      events = events.filter((event: UpcomingEvent) => 
        event.title.toLowerCase().includes(query) ||
        event.clubName.toLowerCase().includes(query)
      );
    }

    if (priceMode === 'free') {
      events = events.filter(e => e.subscriptionFees === 0);
    } else if (priceMode === 'paid') {
      events = events.filter(e => e.subscriptionFees > 0);
    }

    return sortItemsClubs(events, this.sortBy(), this.sortOrder(), {
      date: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      title: (a, b) => a.title.localeCompare(b.title),
      price: (a, b) => a.subscriptionFees - b.subscriptionFees
    });
  });

  readonly upcomingEventsCount = computed(() => this.filteredEvents().length);

  // --- Pagination (Refactorisé avec l'utilitaire) ---
  readonly pagination = createPaginationClubs({
    items: this.filteredEvents,
    itemsPerPage: 9
  });

  // --- Actions ---
  onSearch(event: Event | string): void {
    handleSearchClubs(this.searchQuery, event, () => this.pagination.goToPage(1));
  }

  changeSort(field: 'date' | 'title' | 'price'): void {
    handleSortChangeClubs(this.sortControls, field, () => this.pagination.goToPage(1));
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.priceFilter.set('all');
    this.sortBy.set('date');
    this.sortOrder.set('asc');
    this.pagination.goToPage(1);
  }

  getUserFullName(): string {
    return this.authService.userFullName();
  }

  navigateToClub(clubId: number): void {
    this.router.navigate(['/clubs', clubId]);
  }
}