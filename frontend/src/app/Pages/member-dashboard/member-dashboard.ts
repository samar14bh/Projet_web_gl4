import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MemberDashboardService } from '../../Core/services/member-dashboard.service';
import { DashboardMember, DashboardResponse, UpcomingEvent } from '../../Core/models/dashboard.model';
import { AuthService } from '../../Core/services/auth.service';
import { EventCardComponent } from '../../shared/components/event-card-component/event-card';
import { ClubComponent } from '../../features/clubs/club-component/club-component/club-component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    EventCardComponent,
    ClubComponent
  ],
  templateUrl: './member-dashboard.html',
  styleUrls: ['./member-dashboard.css']
})
export class MemberDashboardComponent implements OnInit {
  private dashboardService = inject(MemberDashboardService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  
  dashboardData = signal<DashboardMember| null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Filtres et Pagination
  searchQuery = signal('');
  priceFilter = signal<'all' | 'free' | 'paid'>('all');
  sortBy = signal<'date' | 'title' | 'price'>('date');
  sortOrder = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  itemsPerPage = 9;

  // Propriétés calculées
  stats = computed(() => this.dashboardData()?.stats || null);
  upcomingEvents = computed(() => this.dashboardData()?.upcomingEvents || []);
  
  // Correction de l'erreur TS2551
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

    const sortByValue = this.sortBy();
    const sortOrderValue = this.sortOrder();
    
    events = [...events].sort((a, b) => {
      let comparison = 0;
      if (sortByValue === 'date') {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (sortByValue === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortByValue === 'price') {
        comparison = a.subscriptionFees - b.subscriptionFees;
      }
      return sortOrderValue === 'asc' ? comparison : -comparison;
    });

    return events;
  });

  totalPages = computed(() => Math.ceil(this.filteredEvents().length / this.itemsPerPage));

  paginatedEvents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEvents().slice(start, end);
  });

  private loadDashboardEffect = effect(() => {
    const user = this.currentUser();
    if (user && user.id) {
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

  // Correction de l'erreur TS2345 (Event vs String)
  onSearch(event: Event | string): void {
    const value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  changeSort(field: 'date' | 'title' | 'price'): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1);
  }

  prevPage(): void { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage(): void { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page); }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
    return [1, -1, current, -1, total];
  }

  getUserFullName(): string { return this.authService.userFullName(); }
  navigateToClub(clubId: number): void { this.router.navigate(['/clubs', clubId]); }
}