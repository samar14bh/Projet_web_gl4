import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ClubService } from '../../../../Core/services/club.service';
import { AuthService } from '../../../../Core/services/auth.service';
import { Club, ClubFilters, ClubsStats } from '../../../../Core/models/club.model';
import { ClubComponent } from '../../club-component/club-component/club-component';
import { createClubStatusManager } from '../../../../shared/utils/club-status.util';
import { createFilterControlsClubs, createSortControlsClubs } from '../../../../shared/utils/filter-sort-clubs.util';

@Component({
  selector: 'app-explore-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ClubComponent],
  templateUrl: './explore-clubs.html',
  styleUrl: './explore-clubs.css',
})
export class ExploreClubsComponent {
  private readonly clubService = inject(ClubService);
  private readonly authService = inject(AuthService);
  readonly router = inject(Router);

  private filterControls = createFilterControlsClubs({ hasCategory: true });
  private sortControls = createSortControlsClubs<'name' | 'members' | 'events' | 'createdAt'>('name');

  readonly selectedCategory = this.filterControls.categoryFilter!;
  readonly searchQuery = this.filterControls.searchQuery;
  readonly sortBy = this.sortControls.sortBy;
  readonly sortOrder = this.sortControls.sortOrder;
  readonly currentPage = signal(1);
  readonly pageSize = signal(12);

  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  private clubStatusManager = createClubStatusManager({
    clubService: this.clubService,
    userId: computed(() => this.currentUser()?.id)
  });

  readonly userClubStatuses = this.clubStatusManager.userClubStatuses;
  readonly isLoadingStatuses = this.clubStatusManager.isLoadingStatuses;

  readonly filters = computed<ClubFilters>(() => ({
    status: 'active',
    categoryId: this.selectedCategory(),
    search: this.searchQuery(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    page: this.currentPage(),
    limit: this.pageSize(),
  }));

  readonly clubsResource = rxResource({
    params: this.filters,
    stream: ({ params }) => this.clubService.getClubs(params),
  });

  readonly categoriesResource = rxResource({
    stream: () => this.clubService.getCategories(),
  });

  readonly publicStatsResource = rxResource({
    stream: () => this.clubService.getClubsStats(),
  });

  readonly clubs = computed(() => this.clubsResource.value()?.data || []);
  readonly totalClubs = computed(() => this.clubsResource.value()?.total || 0);
  readonly totalPages = computed(() => this.clubsResource.value()?.totalPages || 0);
  readonly isLoading = computed(() => this.clubsResource.isLoading());
  readonly hasError = computed(() => this.clubsResource.error() != null);

  readonly stats = computed(() => this.publicStatsResource.value() || {
    total: 0,
    active: 0,
    inactive: 0,
    totalMembers: 0,
    totalEvents: 0,
    totalRevenue: 0,
  } as ClubsStats);

  readonly categories = computed(() => this.categoriesResource.value() || []);

  constructor() {
    effect(() => {
      const user = this.currentUser();
      const clubsList = this.clubs();

      if (user && clubsList.length > 0) {
        const clubIds = clubsList.map(club => Number(club.id));
        this.clubStatusManager.loadAllStatuses(clubIds);
      } else if (!user) {
        this.clubStatusManager.reset();
      }
    });
  }

  getUserClubStatus(clubId: number): string {
    return this.clubStatusManager.getStatus(clubId);
  }

  getButtonText(clubId: number): string {
    return this.clubStatusManager.getButtonText(clubId);
  }

  getButtonVariant(clubId: number): 'primary' | 'secondary' | 'danger' | 'ghost' {
    return this.clubStatusManager.getButtonVariant(clubId);
  }

  isButtonDisabled(clubId: number): boolean {
    return this.clubStatusManager.isButtonDisabled(clubId);
  }

  handleClubAction(club: Club): void {
    if (!this.currentUser()?.id) {
      this.router.navigate(['/login']);
      return;
    }

    const statusLower = this.getUserClubStatus(club.id).toLowerCase();

    if (statusLower === 'non membre') {
      this.joinClub(club);
    } else if (statusLower === 'ancien membre') {
      this.renewMembership(club);
    } else if (statusLower.includes('candidature rejetée') || statusLower.includes('candidature confirmée')) {
      this.joinClub(club);
    } else {
      this.viewClubDetails(club);
    }
  }

  changeCategory(categoryId: number | 'all'): void {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  changeSortBy(field: 'name' | 'members' | 'events' | 'createdAt'): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  viewClubDetails(club: Club): void {
    this.router.navigate(['/clubs', club.id]);
  }

  refreshData(): void {
    this.clubsResource.reload();
    this.publicStatsResource.reload();

    if (this.isAuthenticated()) {
      const clubIds = this.clubs().map(club => Number(club.id));
      this.clubStatusManager.loadAllStatuses(clubIds);
    }
  }

  joinClub(club: Club): void {
    this.router.navigate(['/clubs', club.id, 'apply']);
  }

  renewMembership(club: Club): void {
    this.router.navigate(['/clubs', club.id, 'renew']);
  }

  resetFilters(): void {
    this.changeCategory('all');
    this.onSearch('');
    this.sortBy.set('name');
    this.sortOrder.set('asc');
    this.currentPage.set(1);
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }
}