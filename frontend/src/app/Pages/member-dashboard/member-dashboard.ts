import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MemberDashboardService } from '../../Core/services/member-dashboard.service';
import { DashboardMember, UpcomingEvent } from '../../Core/models/dashboard.model';
import { AuthService } from '../../Core/services/auth.service';
import { EventCardComponent } from '../../shared/components/event-card-component/event-card';
import { ClubComponent } from '../../features/clubs/club-component/club-component/club-component';
import { createPaginationClubs } from '../../shared/utils/pagination-clubs.util';
import { createFilterControlsClubs, createSortControlsClubs, handleSortChangeClubs, handleSearchClubs, sortItemsClubs } from '../../shared/utils/filter-sort-clubs.util';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, EventCardComponent, ClubComponent,ButtonComponent],
  templateUrl: './member-dashboard.html',
  styleUrls: ['./member-dashboard.css']
})
export class MemberDashboardComponent implements OnInit {
  private dashboardService = inject(MemberDashboardService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  dashboardData = signal<DashboardMember | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  private filterControls = createFilterControlsClubs({ hasPrice: true });
  private sortControls = createSortControlsClubs<'date' | 'title' | 'price'>('date');

  searchQuery = this.filterControls.searchQuery;
  priceFilter = this.filterControls.priceFilter!;
  sortBy = this.sortControls.sortBy;
  sortOrder = this.sortControls.sortOrder;

  stats = computed(() => this.dashboardData()?.stats || null);
  upcomingEvents = computed(() => this.dashboardData()?.upcomingEvents || []);
  upcomingEventsCount = computed(() => this.upcomingEvents().length);

  recommendedClubs = toSignal(
    this.dashboardService.getRecommendedClubs(), 
    { initialValue: [] }
  );

  welcomeMessage = computed(() => {
    const user = this.currentUser();
    return user ? `Bonjour ${user.name} ${user.lastName}` : 'Bonjour';
  });

  hasUpcomingEvents = computed(() => this.upcomingEvents().length > 0);

  filteredEvents = computed(() => {
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

  pagination = createPaginationClubs({
    items: this.filteredEvents,
    itemsPerPage: 9
  });

  private loadDashboardEffect = effect(() => {
    const user = this.currentUser();
    if (user?.id) {
      this.loadDashboardData();
    } else if (user === null) {
      this.error.set('Veuillez vous connecter pour accéder au tableau de bord');
      this.isLoading.set(false);
    }
  });

  async ngOnInit(): Promise<void> {
    if (this.currentUser()?.id) {
      await this.loadDashboardData();
    }
  }

  private async loadDashboardData(): Promise<void> {
    try {
      this.isLoading.set(true);
      const data = await firstValueFrom(this.dashboardService.getMemberDashboard());
      if (data) this.dashboardData.set(data);
    } catch (err: any) {
      this.error.set('Impossible de charger les données.');
    } finally {
      this.isLoading.set(false);
    }
  }

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