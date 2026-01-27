import { Component, signal, computed, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { ClubContextService } from '../../../Core/services/club-context.service';

interface Member {
  id: number;
  name: string;
  lastName: string;
  email: string;
  joinDate: string;
  status?: string;
  image?: string;
}

interface Event {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

@Component({
  selector: 'app-club-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class ClubManagerDashboardComponent implements OnInit {
  // SERVICES
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clubContext = inject(ClubContextService);
  private clubManagerService = inject(ClubManagerService);

  // SIGNAUX - ÉTAT DE LA PAGE
  clubId = signal<number | null>(null);

  // SIGNAUX - DONNÉES DU CLUB (pour le header)
  clubName = signal('Mon Club');
  clubLogo = signal('');
  clubCoverImage = signal('');
  categoryId = signal<number | null>(null);
  categoryName = signal('');
  categoryIcon = signal('');

  // SIGNAUX - STATISTIQUES QUICK (pour le header)
  totalMembers = signal(0);
  totalEvents = signal(0);
  pendingRequests = signal(0);

  // CATEGORY COLOR MAPPING
  categoryColorMap: Record<string, string> = {
    'Sports': '#EF4444',
    'Culture': '#F59E0B',
    'Éducation': '#3B82F6',
    'Social': '#10B981',
    'Loisir': '#8B5CF6',
    'Professionnel': '#06B6D4',
  };

  // SIGNAUX CALCULÉS
  stats = computed(() => this.clubManagerService.clubStats());
  pendingMembers = computed(() => this.mapMembers(this.clubManagerService.pendingMembers()));
  displayedPendingMembers = computed(() => this.pendingMembers().slice(0, 5));
  recentMembers = computed(() => this.mapMembers(this.clubManagerService.activeMembers()));
  displayedRecentMembers = computed(() => this.recentMembers().slice(0, 5));
  upcomingEvents = computed(() => this.clubManagerService.upcomingEvents());
  displayedEvents = computed(() => this.upcomingEvents().slice(0, 5));
  loading = computed(() => this.clubManagerService.loading());

  constructor() {
    effect(() => {
      const id = this.clubId();
      if (id) this.loadDashboardData();
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['clubId'];
      if (id) {
        this.clubId.set(+id);
        this.clubContext.setCurrentClub(+id);
      } else {
        this.router.navigate(['/club-manager/select']);
      }
    });
  }

  // UTILITAIRES
  private mapDashboardMemberToMember(m: any): Member {
    return {
      id: m.id,
      name: m.name || m.user?.name || '',
      lastName: m.lastName || m.user?.lastName || '',
      email: m.email || m.user?.email || '',
      joinDate: m.joinDate || m.createdAt,
      status: m.status,
      image: m.image || m.user?.image || '',
    };
  }

  private mapMembers(members: any[]): Member[] {
    return (members || [])
      .map(m => this.mapDashboardMemberToMember(m))
      .sort(
        (a, b) =>
          new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
      );
  }

  // CHARGEMENT DES DONNÉES
  loadDashboardData() {
    const clubId = this.clubId();
    if (!clubId) return;

    // Charger les détails du club pour le header
    this.clubManagerService.getClubDetails(clubId).subscribe({
      next: (club: any) => {
        if (club.logo) this.clubLogo.set(club.logo);
        if (club.coverImage) this.clubCoverImage.set(club.coverImage);
        if (club.name) this.clubName.set(club.name);

        // Récupérer les données de la catégorie
        if (club.category) {
          this.categoryId.set(club.category.id);
          this.categoryName.set(club.category.name);
          this.categoryIcon.set(club.category.icon);
        }
      },
      error: (err) => {
        console.error('Erreur chargement détails club:', err);
      },
    });

    // Charger les statistiques pour le header
    this.clubManagerService.getClubDetailedStats(clubId).subscribe({
      next: (stats) => {
        this.totalMembers.set(stats.totalMembers || 0);
        this.totalEvents.set(stats.totalEvents || 0);
        this.pendingRequests.set(stats.pendingRequests || 0);
      },
      error: (err) => {
        console.error('Erreur chargement statistiques:', err);
      },
    });

    // Charger le tableau de bord complet
    this.clubManagerService.loadDashboard(clubId);
  }

  // GET CATEGORY INFO
  getCategoryInfo() {
    const color = this.categoryColorMap[this.categoryName()] || '#6B7280';
    const icon = this.categoryIcon() || 'bi-question-circle';
    return {
      name: this.categoryName(),
      color: color,
      icon: `bi ${icon}`,
    };
  }

  // ACTIONS MEMBRES
  approveMember(membershipId: number) {
    this.clubManagerService.updateMemberStatus(membershipId, 'APPROVED').subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Erreur approbation:', err);
        alert('Erreur lors de l\'approbation du membre');
      },
    });
  }

  rejectMember(membershipId: number) {
    this.clubManagerService.updateMemberStatus(membershipId, 'REJECTED').subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Erreur rejet:', err);
        alert('Erreur lors du rejet du membre');
      },
    });
  }

  // NAVIGATION
  navigateToMembers() {
    const clubId = this.clubId();
    if (clubId) this.router.navigate([`/club-manager/${clubId}/manage-members`]);
  }

  navigateToAllMembers() {
    this.navigateToMembers();
  }

  navigateToAllEvents() {
    this.router.navigate(['/events'], { queryParams: { clubId: this.clubId() } });
  }

  navigateToCreateEvent() {
    const clubId = this.clubId();
    if (clubId)
      this.router.navigate(['/events/create'], { queryParams: { clubId } });
  }

  navigateToManageMembers() {
    this.navigateToMembers();
  }

  navigateToManageClub() {
    const clubId = this.clubId();
    if (clubId)
      this.router.navigate([`/club-manager/${clubId}/manage-club`]);
  }

  navigateToFinances() {
    this.router.navigate(['/finances'], { queryParams: { clubId: this.clubId() } });
  }

  // FORMATAGE
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
