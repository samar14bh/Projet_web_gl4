import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ClubService } from '../../../../Core/services/club.service';
import { AuthService } from '../../../../Core/services/auth.service';
import { Club, ClubFilters, ClubsStats } from '../../../../Core/models/club.model';
import { ClubComponent } from '../../club-component/club-component/club-component';
import { createClubStatusManager } from '../../../../shared/utils/club-status.util';
import { 
  createFilterControlsClubs, 
  createSortControlsClubs, 
  handleSearchClubs, 
  handleSortChangeClubs 
} from '../../../../shared/utils/filter-sort-clubs.util';
import { createResource, createParameterizedResource } from '../../../../shared/utils/resource-loader.util';
import { getPaginationSequence } from '../../../../shared/utils/pagination-clubs.util';

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
  
  readonly searchQuery = this.filterControls.searchQuery;
  readonly selectedCategory = this.filterControls.categoryFilter!;
  readonly sortBy = this.sortControls.sortBy;
  readonly sortOrder = this.sortControls.sortOrder;
  
  readonly currentPage = signal(1);
  readonly pageSize = signal(12);

  private statusManager = createClubStatusManager(
    computed(() => this.authService.currentUser()?.id)
  );

  readonly filters = computed<ClubFilters>(() => ({
    status: 'active',
    categoryId: this.selectedCategory(),
    search: this.searchQuery(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    page: this.currentPage(),
    limit: this.pageSize(),
  }));

  readonly clubsRes = createParameterizedResource({
    loader: (p) => this.clubService.getClubs(p!),
    params: this.filters
  });

  readonly categoriesRes = createResource({
    loader: () => this.clubService.getCategories()
  });

  readonly statsRes = createResource({
    loader: () => this.clubService.getClubsStats()
  });

  readonly clubs = computed(() => this.clubsRes.data()?.data || []);
  readonly totalClubs = computed(() => this.clubsRes.data()?.total || 0);
  readonly totalPages = computed(() => this.clubsRes.data()?.totalPages || 0);
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  readonly stats = computed(() => this.statsRes.data() || {
    total: 0, active: 0, inactive: 0, totalMembers: 0, totalEvents: 0, totalRevenue: 0,
  } as ClubsStats);
  readonly pageNumbers = computed(() => 
    getPaginationSequence(this.currentPage(), this.totalPages())
  );

  constructor() {
    effect(() => {
      const ids = this.clubs().map(c => Number(c.id));
      if (this.isAuthenticated() && ids.length > 0) {
        this.statusManager.refresh(ids);
      }
    });
  }
  onSearch(event: Event | string): void {
    handleSearchClubs(this.searchQuery, event, () => this.currentPage.set(1));
  }

  changeSortBy(field: any): void {
    handleSortChangeClubs(this.sortControls, field, () => this.currentPage.set(1));
  }

  changeCategory(categoryId: number | 'all'): void {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== -1) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  handleClubAction(club: Club): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const meta = this.statusManager.getMeta(club.id);
    if (meta.status.includes('non membre') || meta.status.includes('rejetée')) {
      this.router.navigate(['/clubs', club.id, 'apply']);
    } else if (meta.status.includes('ancien membre')) {
      this.router.navigate(['/clubs', club.id, 'renew']);
    } else {
      this.router.navigate(['/clubs', club.id]);
    }
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.sortBy.set('name');
    this.sortOrder.set('asc');
    this.currentPage.set(1);
  }

  getClubMeta(clubId: number) {
    return this.statusManager.getMeta(clubId);
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }
}