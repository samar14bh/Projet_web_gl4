import { Component, signal, computed, OnInit, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { ClubContextService } from '../../../Core/services/club-context.service';

// Import Core interfaces
import { DashboardState, ClubHeaderState, ClubStats } from '../../../Core/interfaces/club-dashboard.interface';
import { Member } from '../../../shared/interfaces/dashboard-models.interface';

// Import dumb components
import { DashboardHeroComponent } from '../../../shared/components/dashboard-hero/dashboard-hero';
import { DashboardStatsGridComponent } from '../../../shared/components/dashboard-stats-grid/dashboard-stats-grid';
import { PendingMembersListComponent } from '../../../shared/components/pending-members-list/pending-members-list';
import { RecentMembersListComponent } from '../../../shared/components/recent-members-list/recent-members-list';
import { UpcomingEventsListComponent } from '../../../shared/components/upcoming-events-list/upcoming-events-list';
import { QuickActionsGridComponent } from '../../../shared/components/quick-actions-grid/quick-actions-grid';

@Component({
  selector: 'app-club-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashboardHeroComponent,
    DashboardStatsGridComponent,
    PendingMembersListComponent,
    RecentMembersListComponent,
    UpcomingEventsListComponent,
    QuickActionsGridComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubManagerDashboardComponent implements OnInit {
  // SERVICES
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clubContext = inject(ClubContextService);
  private clubManagerService = inject(ClubManagerService);

  // CONSOLIDATED STATE SIGNALS
  state = signal<DashboardState>({
    clubId: null,
    loading: false
  });

  clubHeaderState = signal<ClubHeaderState>({
    clubName: 'Mon Club',
    clubLogo: '',
    clubCoverImage: '',
    categoryId: null,
    categoryName: '',
    categoryIcon: '',
    totalMembers: 0,
    totalEvents: 0,
    pendingRequests: 0
  });

  internalRole = signal<string>('MEMBER');

  // PERMISSION SIGNALS
  userRole = computed(() => this.internalRole().toUpperCase());

  canManageApplications = computed(() =>
    this.userRole() === 'PRESIDENT' || this.userRole() === 'RH'
  );

  canCreateEvents = computed(() =>
    this.userRole() === 'PRESIDENT' || this.userRole() === 'RH'
  );

  canManageClub = computed(() =>
    this.userRole() === 'PRESIDENT'
  );

  canViewFinances = computed(() =>
    this.userRole() === 'PRESIDENT' || this.userRole() === 'RH' || this.userRole() === 'TREASURER'
  );

  // COMPUTED SIGNALS FOR CHILD COMPONENTS
  stats = computed(() => this.clubManagerService.clubStats());
  pendingMembers = computed(() => this.mapMembers(this.clubManagerService.pendingMembers()));
  recentMembers = computed(() => this.mapMembers(this.clubManagerService.activeMembers()));
  upcomingEvents = computed(() => this.clubManagerService.upcomingEvents());
  loading = computed(() => this.clubManagerService.loading());

  constructor() {
    effect(() => {
      const id = this.state().clubId;
      if (id) this.loadDashboardData();
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['clubId'];
      if (id) {
        this.state.update(s => ({ ...s, clubId: +id }));
        this.clubContext.setCurrentClub(+id);
        this.loadInternalRole(+id);
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
    const clubId = this.state().clubId;
    if (!clubId) return;

    // Charger les détails du club pour le header
    this.clubManagerService.getClubDetails(clubId).subscribe({
      next: (club: any) => {
        this.clubHeaderState.update(state => ({
          ...state,
          clubLogo: club.logo || state.clubLogo,
          clubCoverImage: club.coverImage || state.clubCoverImage,
          clubName: club.name || state.clubName,
          categoryId: club.category?.id || state.categoryId,
          categoryName: club.category?.name || state.categoryName,
          categoryIcon: club.category?.icon || state.categoryIcon
        }));
      },
      error: (err) => {
        console.error('Erreur chargement détails club:', err);
      },
    });

    // Charger les statistiques pour le header
    this.clubManagerService.getClubDetailedStats(clubId).subscribe({
      next: (stats) => {
        this.clubHeaderState.update(state => ({
          ...state,
          totalMembers: stats.totalMembers || 0,
          totalEvents: stats.totalEvents || 0,
          pendingRequests: stats.pendingRequests || 0
        }));
      },
      error: (err) => {
        console.error('Erreur chargement statistiques:', err);
      },
    });

    // Charger le tableau de bord complet
    this.clubManagerService.loadDashboard(clubId);
  }

  loadInternalRole(clubId: number) {
    this.clubManagerService.getMyRole(clubId).subscribe({
      next: (res) => {
        this.internalRole.set(res.role || 'MEMBER');
      },
      error: () => {
        this.internalRole.set('MEMBER');
      }
    });
  }

  // ACTIONS MEMBRES
  onApproveMember(membershipId: number) {
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

  onRejectMember(membershipId: number) {
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
    const clubId = this.state().clubId;
    if (clubId) this.router.navigate([`/club-manager/${clubId}/manage-members`]);
  }

  navigateToAllEvents() {
    this.router.navigate(['/events'], { queryParams: { clubId: this.state().clubId } });
  }

  navigateToCreateEvent() {
    const clubId = this.state().clubId;
    if (clubId)
      this.router.navigate(['/events'], { queryParams: { clubId: this.state().clubId } });
  }

  navigateToManageClub() {
    const clubId = this.state().clubId;
    if (clubId)
      this.router.navigate([`/club-manager/${clubId}/manage-club`]);
  }

  navigateToFinances() {
    this.router.navigate(['/finances'], { queryParams: { clubId: this.state().clubId } });
  }
}
