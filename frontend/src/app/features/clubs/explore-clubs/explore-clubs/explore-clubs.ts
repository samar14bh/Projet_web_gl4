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

  // --- Configuration des Filtres et Tri ---
  private filterControls = createFilterControlsClubs({ hasCategory: true });
  private sortControls = createSortControlsClubs<'name' | 'members' | 'events' | 'createdAt'>('name');
  
  readonly searchQuery = this.filterControls.searchQuery;
  readonly selectedCategory = this.filterControls.categoryFilter!;
  readonly sortBy = this.sortControls.sortBy;
  readonly sortOrder = this.sortControls.sortOrder;
  
  readonly currentPage = signal(1);
  readonly pageSize = signal(12);

  // --- Gestion du Statut des Clubs ---
  private clubStatusManager = createClubStatusManager({
    clubService: this.clubService,
    userId: computed(() => this.authService.currentUser()?.id)
  });

  // --- Ressources (Data Fetching) ---
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

  // --- Sélecteurs réactifs ---
  readonly clubs = computed(() => this.clubsRes.data()?.data || []);
  readonly totalClubs = computed(() => this.clubsRes.data()?.total || 0);
  readonly totalPages = computed(() => this.clubsRes.data()?.totalPages || 0);
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  readonly stats = computed(() => this.statsRes.data() || {
    total: 0, active: 0, inactive: 0, totalMembers: 0, totalEvents: 0, totalRevenue: 0,
  } as ClubsStats);

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    // Logique d'affichage des ellipses (adaptée de pagination-clubs.util)
    if (current <= 3) return [1, 2, 3, 4, -1, total];
    if (current >= total - 2) return [1, -1, total - 3, total - 2, total - 1, total];
    return [1, -1, current - 1, current, current + 1, -1, total];
  });

  constructor() {
    effect(() => {
      const clubsList = this.clubs();
      const isAuth = this.isAuthenticated();

      if (isAuth && clubsList.length > 0) {
        this.clubStatusManager.loadAllStatuses(clubsList.map(c => Number(c.id)));
      } else if (!isAuth) {
        this.clubStatusManager.reset();
      }
    });
  }

  // --- Actions ---
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

    const status = this.clubStatusManager.getStatus(club.id).toLowerCase();
    if (status.includes('non membre') || status.includes('rejetée')) {
      this.router.navigate(['/clubs', club.id, 'apply']);
    } else if (status.includes('ancien membre')) {
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

  // Helper pour le template
  getClubMeta(clubId: number) {
    return {
      text: this.clubStatusManager.getButtonText(clubId),
      variant: this.clubStatusManager.getButtonVariant(clubId),
      disabled: this.clubStatusManager.isButtonDisabled(clubId)
    };
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }
}