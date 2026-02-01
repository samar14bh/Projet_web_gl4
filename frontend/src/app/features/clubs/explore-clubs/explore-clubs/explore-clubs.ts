import { Component, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ClubService } from '../../../../Core/services/club.service';
import { AuthService } from '../../../../Core/services/auth.service';
import { ClubFilters, ClubsStats } from '../../../../Core/models/club.model';
import { ClubComponent } from '../../club-component/club-component/club-component';
import { createClubStatusManager } from '../../../../shared/utils/club-status.util';
import { createResource, createParameterizedResource } from '../../../../shared/utils/resource-loader.util';
import { createServerPagination } from '../../../../shared/utils/server-pagination.util';
import { createFilterSortState, handleSearch, handleSortChange } from '../../../../shared/utils/filter-sort-clubs.util';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-explore-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ClubComponent,PaginationComponent],
  templateUrl: './explore-clubs.html',
  styleUrl: './explore-clubs.css',
})
export class ExploreClubsComponent {
  private readonly clubService = inject(ClubService);
  private readonly authService = inject(AuthService);
  readonly router = inject(Router);
  
  private filterSortState = createFilterSortState<'name' | 'members' | 'events' | 'createdAt'>(
    'name',
    { hasCategory: true }
  );

  readonly searchQuery = this.filterSortState.filters.searchQuery;
  readonly selectedCategory = this.filterSortState.filters.categoryFilter!;
  readonly sortBy = this.filterSortState.sort.sortBy;
  readonly sortOrder = this.filterSortState.sort.sortOrder;
  
  private serverPagination = createServerPagination({ 
    pageSize: 12,
    initialPage: 1 
  });

  readonly currentPage = this.serverPagination.currentPage;
  readonly pageSize = this.serverPagination.pageSize;
  
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
    this.serverPagination.getPageNumbers(this.totalPages())
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
    handleSearch(this.searchQuery, event, () => this.serverPagination.reset());
  }

  changeSortBy(field: any): void {
    handleSortChange(this.filterSortState.sort, field, () => this.serverPagination.reset());
  }

  changeCategory(categoryId: number | 'all'): void {
    this.selectedCategory.set(categoryId);
    this.serverPagination.reset();
  }

  goToPage(page: number): void {
    this.serverPagination.goToPage(page, this.totalPages());
  }


  resetFilters(): void {
    this.filterSortState.reset();
    this.serverPagination.reset();
  }

  getClubMeta(clubId: number) {
    return this.statusManager.getMeta(clubId);
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }
  getUserClubStatus(clubId: number): string {
    return this.statusManager.getMeta(clubId).status;
  }

  

 
}
