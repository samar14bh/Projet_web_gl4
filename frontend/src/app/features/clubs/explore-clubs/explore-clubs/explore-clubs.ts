import {
  Component,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ClubService } from '../../../../Core/services/club.service';
import { Club, ClubFilters } from '../../../../Core/models/club.model';
import { ClubComponent } from '../../club-component/club-component/club-component';


@Component({
  selector: 'app-explore-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ClubComponent], 
  templateUrl: './explore-clubs.component.html',
  styleUrl: './explore-clubs.component.css',
})
export class ExploreClubsComponent {
 
  private readonly clubService = inject(ClubService);
  private readonly router = inject(Router); 

  selectedCategory = signal<number | 'all'>('all');
  searchQuery = signal('');
  sortBy = signal<'name' | 'members' | 'events' | 'createdAt'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  pageSize = signal(12);

  filters = computed<ClubFilters>(() => ({
    status: 'active',
    categoryId: this.selectedCategory(),
    search: this.searchQuery(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    page: this.currentPage(),
    limit: this.pageSize(),
  }));

  clubsResource = rxResource({
    params: this.filters,
    stream: ({ params }) => this.clubService.getClubs(params),
  });

  categoriesResource = rxResource({
    stream: () => this.clubService.getCategories(),
  });

  publicStatsResource = rxResource({
    stream: () => this.clubService.getClubsStats(),
  });

  clubs = computed(() => this.clubsResource.value()?.data || []);
  totalClubs = computed(() => this.clubsResource.value()?.total || 0);
  totalPages = computed(() => this.clubsResource.value()?.totalPages || 0);

  isLoading = computed(() => this.clubsResource.isLoading());
  hasError = computed(() => this.clubsResource.error() != null);

  stats = computed(() => this.publicStatsResource.value() || {
    total: 0,
    totalMembers: 0,
    totalEvents: 0,
    categoriesCount: 0,
  });

  categories = computed(() => this.categoriesResource.value() || []);

  changeCategory(categoryId: number | 'all') {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1);
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  changeSortBy(field: 'name' | 'members' | 'events' | 'createdAt') {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  
  viewClubDetails(club: Club) {
    this.router.navigate(['/clubs', club.id]); 
  }

  refreshData() {
    this.clubsResource.reload();
    this.publicStatsResource.reload();
  }

  joinClub(club: Club) {
    console.log(`Rejoindre le club: ${club.name}`);
   
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }

 
}