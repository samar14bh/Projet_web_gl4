import { Component, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MemberDashboardService } from '../../Core/services/member-dashboard.service';
import { UpcomingEvent } from '../../Core/models/dashboard.model';
import { AuthService } from '../../Core/services/auth.service';
import { ClubService } from '../../Core/services/club.service'; 
import { EventCardComponent } from '../../shared/components/event-card-component/event-card';
import { ClubComponent } from '../../features/clubs/club-component/club-component/club-component';
import { ButtonComponent } from '../../shared/components/button/button';
import { createResource } from '../../shared/utils/resource-loader.util';
import { createFilterSortState, handleSearch, handleSortChange, sortItems, filterBySearch, filterByPrice } from '../../shared/utils/filter-sort-clubs.util';
import { createPagination } from '../../shared/utils/pagination-clubs.util';
import { createClubStatusManager } from '../../shared/utils/club-status.util';

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
  private clubService = inject(ClubService); 
  private router = inject(Router);
  
  readonly dashboardRes = createResource({
    loader: () => this.dashboardService.getMemberDashboard()
  });

  readonly currentUser = this.authService.currentUser;
  readonly isLoading = this.dashboardRes.isLoading;
  readonly error = this.dashboardRes.error;
  private statusManager = createClubStatusManager(
    computed(() => this.authService.currentUser()?.id)
  );

  private filterSortState = createFilterSortState<'date' | 'title' | 'price'>(
    'date',
    { hasPrice: true }
  );

  readonly searchQuery = this.filterSortState.filters.searchQuery;
  readonly priceFilter = this.filterSortState.filters.priceFilter!;
  readonly sortBy = this.filterSortState.sort.sortBy;
  readonly sortOrder = this.filterSortState.sort.sortOrder;
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
  
  readonly filteredEvents = computed(() => {
    let events = this.upcomingEvents();
    events = filterBySearch(
      events,
      this.searchQuery(),
      [
        (e: UpcomingEvent) => e.title,
        (e: UpcomingEvent) => e.clubName
      ]
    );
    events = filterByPrice(
      events,
      this.priceFilter(),
      (e: UpcomingEvent) => e.subscriptionFees
    );
    return sortItems(events, this.sortBy(), this.sortOrder(), {
      date: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      title: (a, b) => a.title.localeCompare(b.title),
      price: (a, b) => a.subscriptionFees - b.subscriptionFees
    });
  });

  readonly upcomingEventsCount = computed(() => this.filteredEvents().length);
  
  readonly pagination = createPagination({
    items: this.filteredEvents,
    itemsPerPage: 9
  });

  constructor() {
    effect(() => {
      const clubs = this.recommendedClubs();
      const ids = clubs.map(c => Number(c.id));
      if (ids.length > 0 && this.authService.isAuthenticated()) {
        this.statusManager.refresh(ids);
      }
    });
  }

  onSearch(event: Event | string): void {
    handleSearch(this.searchQuery, event, () => this.pagination.goToPage(1));
  }

  changeSort(field: 'date' | 'title' | 'price'): void {
    handleSortChange(this.filterSortState.sort, field, () => this.pagination.goToPage(1));
  }

  resetFilters(): void {
    this.filterSortState.reset();
    this.pagination.reset();
  }

  getUserFullName(): string {
    return this.authService.userFullName();
  }

  getClubMeta(clubId: number) {
    return this.statusManager.getMeta(clubId);
  }
}