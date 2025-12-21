import {
  Component,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ClubService } from '../../../../Core/services/club.service';
import { AuthService } from '../../../../Core/services/auth.service';
import { Club, ClubFilters, ClubsStats } from '../../../../Core/models/club.model';
import { ClubComponent } from '../../club-component/club-component/club-component';

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

  readonly selectedCategory = signal<number | 'all'>('all');
  readonly searchQuery = signal('');
  readonly sortBy = signal<'name' | 'members' | 'events' | 'createdAt'>('name');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(1);
  readonly pageSize = signal(12);
  readonly userClubStatuses = signal<Map<number, string>>(new Map());
  readonly isLoadingStatuses = signal(false);

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
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  constructor() {
    effect(() => {
      const user = this.currentUser();
      const clubsList = this.clubs();
      
      if (user && clubsList.length > 0) {
        this.loadAllUserStatuses();
      } else if (!user) {
        this.userClubStatuses.set(new Map());
      }
    });
  }

  private loadAllUserStatuses(): void {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    this.isLoadingStatuses.set(true);
    const currentMap = new Map<number, string>();

    const statusPromises = this.clubs().map(club => 
      new Promise<void>((resolve) => {
        this.clubService.getUserClubStatus(Number(club.id), Number(userId)).subscribe({
          next: (response) => {
            currentMap.set(Number(club.id), response);
            resolve();
          },
          error: () => {
            currentMap.set(Number(club.id), 'Non membre');
            resolve();
          }
        });
      })
    );

    Promise.all(statusPromises).then(() => {
      this.userClubStatuses.set(new Map(currentMap));
      this.isLoadingStatuses.set(false);
    });
  }

  getUserClubStatus(clubId: number): string {
    return this.userClubStatuses().get(clubId) || 'Non membre';
  }

  getButtonText(clubId: number): string {
    const status = this.getUserClubStatus(clubId);
    
    if (status.toLowerCase().startsWith('membre')) {
      if (status.toLowerCase() === 'membre member') {
        return 'Membre';
      }
      return status;
    }
    
    if (status.toLowerCase().includes('candidature')) {
      return status;
    }
    
    if (status === 'Ancien membre') {
      return 'Renouveler adhésion';
    }
    
    return 'Rejoindre';
  }

  getButtonVariant(clubId: number): 'primary' | 'secondary' | 'danger' | 'ghost' {
    const status = this.getUserClubStatus(clubId).toLowerCase();
    
    if (status.startsWith('membre')) {
      return 'primary';
    }
    
    if (status.includes('candidature')) {
      return 'ghost';
    }
    
    if (status === 'ancien membre') {
      return 'secondary';
    }
    
    return 'primary';
  }

  isButtonDisabled(clubId: number): boolean {
    const status = this.getUserClubStatus(clubId).toLowerCase();
    return status.startsWith('membre') || status.includes('candidature en attente');
  }

  handleClubAction(club: Club): void {
    const userId = this.currentUser()?.id;
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    const status = this.getUserClubStatus(club.id).toLowerCase();
    
    if (status === 'non membre') {
      this.joinClub(club);
    } else if (status === 'ancien membre') {
      this.renewMembership(club);
    } else if (status.includes('candidature rejetée') || status.includes('candidature confirmée')) {
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
      this.loadAllUserStatuses();
    }
  }

  joinClub(club: Club): void {
    this.router.navigate(['/clubs', club.id, 'apply']);
  }

  renewMembership(club: Club): void {
    this.router.navigate(['/clubs', club.id, 'renew']);
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }
}