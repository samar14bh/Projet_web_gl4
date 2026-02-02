import { Component, signal, computed, OnInit, inject, effect, ChangeDetectionStrategy, ViewChild, ElementRef, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { NotificationService } from '../../../Core/services/notification.service';
import {
  Member,
  MembersStats,
  Application,
  Club,
  MemberRole,
} from '../../../Core/interfaces/club-manager.interface';
import {
  ManageMembersState,
  MemberModal,
  RemoveModal,
  ApplicationModal
} from '../../../Core/interfaces/member-management.interface';
import { StatusFilter } from '../../../shared/interfaces/member-models.interface';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation';
import { TabItem } from '../../../shared/interfaces/components.interface';
import { ClubContextService } from '../../../Core/services/club-context.service';

// Dumb Components
import { DashboardHeroComponent } from '../../../shared/components/dashboard-hero/dashboard-hero';
import { MembersStatsGridComponent } from '../../../shared/components/members-stats-grid/members-stats-grid';
import { MembersListComponent } from '../../../shared/components/members-list/members-list';
import { ApplicationsListComponent } from '../../../shared/components/applications-list/applications-list';
import { RoleModalComponent } from '../../../shared/components/role-modal/role-modal';
import { ApplicationDetailsModalComponent } from '../../../shared/components/application-details-modal/application-details-modal';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-manage-members',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TabNavigationComponent,
    DashboardHeroComponent,
    MembersStatsGridComponent,
    MembersListComponent,
    ApplicationsListComponent,
    RoleModalComponent,
    ApplicationDetailsModalComponent,
    ConfirmModal
  ],
  templateUrl: './manage-members.html',
  styleUrl: './manage-members.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageMembersComponent implements OnInit {
  // SERVICES
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clubContext = inject(ClubContextService);
  public clubManagerService = inject(ClubManagerService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private location = inject(Location);
  private searchSubject = new Subject<string>();

  // CONSOLIDATED STATE SIGNALS
  state = signal<ManageMembersState>({
    clubId: null,
    activeTab: 'members',
    loading: false,
    searchQuery: '',
    membersPage: 1,
    applicationsPage: 1,
    applicationStatus: 'PENDING'
  });

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  @ViewChild('downloadLink') downloadLink!: ElementRef<HTMLAnchorElement>;

  // MODAL STATES
  roleModal = signal<MemberModal>({
    show: false,
    selectedMember: null,
    selectedRole: ''
  });

  removeModal = signal<RemoveModal>({
    show: false,
    selectedMember: null
  });

  applicationModal = signal<ApplicationModal>({
    show: false,
    selectedApplication: null
  });

  // DATA SIGNALS
  clubDetails = signal<Club | null>(null);
  membersStats = signal<MembersStats | null>(null);
  allMembers = signal<Member[]>([]);
  applicationsData = signal<Application[]>([]);
  membersTotal = signal(0);
  applicationsTotal = signal(0);
  membersLimit = signal(10);
  applicationsLimit = signal(10);
  internalRole = signal<string>('MEMBER');

  // CONFIGURATION
  tabs = computed<TabItem[]>(() => {
    const role = this.internalRole().toUpperCase();
    const isPowerUser = role === 'PRESIDENT' || role === 'RH';

    const baseTabs: TabItem[] = [
      { id: 'members', label: 'Tous les Membres', icon: 'people-fill' },
      { id: 'bureau', label: 'Bureau', icon: 'shield-check' },
    ];

    if (isPowerUser) {
      baseTabs.push({ id: 'applications', label: 'Demandes', icon: 'inbox', badge: this.pendingCount() });
    }

    return baseTabs;
  });

  statusFilters: StatusFilter[] = [
    { value: 'PENDING', label: 'En Attente', icon: 'hourglass-split' },
    { value: 'APPROVED', label: 'Approuvées', icon: 'check-circle' },
    { value: 'REJECTED', label: 'Rejetées', icon: 'x-circle' },
  ];

  // COMPUTED SIGNALS
  totalMembers = computed(() => this.membersStats()?.totalMembers || 0);
  bureauMembersCount = computed(() => this.membersStats()?.bureauMembers || 0);
  regularMembersCount = computed(() => this.membersStats()?.regularMembers || 0);
  pendingCount = computed(() => this.membersStats()?.pendingApplications || 0);
  approvedCount = computed(() => this.membersStats()?.approvedApplications || 0);
  rejectedCount = computed(() => this.membersStats()?.rejectedApplications || 0);
  membersTotalPages = computed(() =>
    Math.ceil(this.membersTotal() / this.membersLimit())
  );
  applicationsTotalPages = computed(() =>
    Math.ceil(this.applicationsTotal() / this.applicationsLimit())
  );
  removeConfirmationMessage = computed(() => {
    const member = this.removeModal().selectedMember;
    return member ? `Êtes-vous sûr de vouloir retirer ${member.name} ${member.lastName} du club?` : '';
  });

  // COMPUTED FOR INDIVIDUAL STATE PROPERTIES
  private clubId = computed(() => this.state().clubId);
  private activeTab = computed(() => this.state().activeTab);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['clubId'];
      if (id) {
        this.state.update(s => ({ ...s, clubId: +id }));
        this.clubContext.setCurrentClub(+id);
        // Load role first
        this.loadInternalRole(+id);
        // Load data explicitly instead of using effects
        this.loadClubDetails();
        this.loadMembersStats();
        this.loadDataForActiveTab();
      } else {
        this.router.navigate(['/club-manager/select']);
      }
    });
  }

  // CHARGEMENT DES DONNÉES
  loadClubDetails() {
    const clubId = this.clubId();
    if (!clubId) return;

    this.clubManagerService.getClubDetails(clubId).subscribe({
      next: (club) => {
        this.clubDetails.set(club);
      },
      error: (err) => console.error('Erreur chargement club:', err),
    });
  }

  loadInternalRole(clubId: number) {
    this.clubManagerService.getMyRole(clubId).subscribe({
      next: (res) => {
        this.internalRole.set(res.role || 'MEMBER');
      },
      error: (err) => {
        console.error('Erreur chargement rôle:', err);
        this.internalRole.set('MEMBER');
      }
    });
  }

  loadMembersStats() {
    const clubId = this.clubId();
    if (!clubId) return;

    this.clubManagerService.getMembersStats(clubId).subscribe({
      next: (stats) => {
        this.membersStats.set(stats);
        this.updateApplicationBadge();
      },
      error: (err) => console.error('Erreur chargement stats:', err),
    });
  }

  loadDataForActiveTab(explicitTab?: string) {
    const tab = explicitTab || this.activeTab();
    console.log('loadDataForActiveTab calling:', tab, 'ClubId:', this.clubId());

    if (tab === 'members') {
      this.loadMembers();
    } else if (tab === 'bureau') {
      this.loadBureauMembers();
    } else if (tab === 'applications') {
      this.loadApplications();
    }
  }

  loadMembers() {
    const clubId = this.clubId();
    if (!clubId) return;

    this.state.update(s => ({ ...s, loading: true }));
    this.clubManagerService
      .getMembers(
        clubId,
        this.state().membersPage,
        this.membersLimit(),
        undefined,
        this.state().searchQuery
      )
      .subscribe({
        next: (response) => {
          // RACE CONDITION FIX: check if we are still on members tab
          if (this.activeTab() === 'members') {
            this.allMembers.set(response.data);
            this.membersTotal.set(response.total);
            this.state.update(s => ({ ...s, loading: false }));
          }
        },
        error: (err) => {
          console.error('Erreur chargement membres:', err);
          if (this.activeTab() === 'members') {
            this.state.update(s => ({ ...s, loading: false }));
          }
        },
      });
  }

  loadBureauMembers() {
    const clubId = this.clubId();
    if (!clubId) return;

    this.state.update(s => ({ ...s, loading: true }));
    this.clubManagerService
      .getBureauMembers(
        clubId,
        this.state().membersPage,
        this.membersLimit(),
        this.state().searchQuery
      )
      .subscribe({
        next: (response) => {
          // RACE CONDITION FIX: check if we are still on bureau tab
          if (this.activeTab() === 'bureau') {
            this.allMembers.set(response.data);
            this.membersTotal.set(response.total);
            this.state.update(s => ({ ...s, loading: false }));
          }
        },
        error: (err) => {
          console.error('Erreur chargement bureau:', err);
          if (this.activeTab() === 'bureau') {
            this.state.update(s => ({ ...s, loading: false }));
          }
        },
      });
  }

  loadApplications() {
    const clubId = this.clubId();
    if (!clubId) return;

    this.state.update(s => ({ ...s, loading: true }));
    this.clubManagerService
      .getApplications(
        clubId,
        this.state().applicationsPage,
        this.applicationsLimit(),
        this.state().applicationStatus
      )
      .subscribe({
        next: (response) => {
          if (this.activeTab() === 'applications') {
            this.applicationsData.set(response.data);
            this.applicationsTotal.set(response.total);
            this.state.update(s => ({ ...s, loading: false }));
          }
        },
        error: (err) => {
          console.error('Erreur chargement applications:', err);
          if (this.activeTab() === 'applications') {
            this.state.update(s => ({ ...s, loading: false }));
          }
        },
      });
  }

  private updateApplicationBadge() {
    // Computed 'tabs' will automatically update when this.pendingCount() changes
  }

  // GESTION DES ONGLETS
  onTabChange(tabId: string) {
    console.log('onTabChange:', tabId);
    this.state.update(s => ({
      ...s,
      activeTab: tabId,
      membersPage: 1,
      applicationsPage: 1,
      searchQuery: ''
    }));
    // Explicitly pass tabId to ensure we use the new value
    this.loadDataForActiveTab(tabId);
  }

  // RECHERCHE
  onSearchChange(query: string) {
    this.searchSubject.next(query);
  }

  private performSearch(query: string) {
    this.state.update(s => ({ ...s, searchQuery: query, membersPage: 1 }));
    this.loadDataForActiveTab();
  }

  // PAGINATION
  onMembersPageChange(page: number) {
    this.state.update(s => ({ ...s, membersPage: page }));
    this.loadDataForActiveTab();
  }

  onApplicationsPageChange(page: number) {
    this.state.update(s => ({ ...s, applicationsPage: page }));
    this.loadApplications();
  }

  // GESTION DES RÔLES - MODAL
  openRoleModal(member: Member) {
    this.roleModal.set({
      show: true,
      selectedMember: member,
      selectedRole: member.role?.toUpperCase() || 'MEMBER'
    });
  }

  closeRoleModal() {
    this.roleModal.set({
      show: false,
      selectedMember: null,
      selectedRole: ''
    });
  }

  confirmRoleChange() {
    const modal = this.roleModal();
    if (!modal.selectedMember) return;

    this.clubManagerService.assignRole(modal.selectedMember.id, modal.selectedRole as MemberRole).subscribe({
      next: () => {
        this.closeRoleModal();
        this.loadDataForActiveTab();
        this.loadMembersStats();
      },
      error: (err) => {
        console.error('Erreur assignation rôle:', err);
        alert('Erreur lors de l\'assignation du rôle');
      },
    });
  }

  // RETIRER UN MEMBRE
  openRemoveModal(member: Member) {
    console.log('Opening remove modal for member:', member);
    this.removeModal.set({
      show: true,
      selectedMember: member
    });
  }

  closeRemoveModal() {
    this.removeModal.set({
      show: false,
      selectedMember: null
    });
  }

  confirmRemoveMember() {
    const member = this.removeModal().selectedMember;
    if (!member) return;

    this.clubManagerService.removeMember(member.id).subscribe({
      next: () => {
        this.closeRemoveModal();
        this.loadDataForActiveTab();
        this.loadMembersStats();
      },
      error: (err) => {
        console.error('Erreur retrait membre:', err);
        alert('Erreur lors du retrait du membre');
      },
    });
  }

  // GESTION DES APPLICATIONS
  onStatusFilterChange(status: string) {
    this.state.update(s => ({ ...s, applicationStatus: status, applicationsPage: 1 }));
    this.loadApplications();
  }

  openApplicationDetailsModal(application: Application) {
    this.applicationModal.set({
      show: true,
      selectedApplication: application
    });
  }

  closeApplicationDetailsModal() {
    this.applicationModal.set({
      show: false,
      selectedApplication: null
    });
  }

  approveMember(applicationId: number) {
    this.clubManagerService
      .updateApplicationStatus(applicationId, 'APPROVED')
      .subscribe({
        next: (response) => {
          this.closeApplicationDetailsModal();
          this.loadApplications();
          this.loadMembersStats();
        },
        error: (err) => {
          console.error('Erreur approbation:', err);
          alert("Erreur lors de l'approbation");
        },
      });
  }

  rejectMember(applicationId: number) {
    this.clubManagerService
      .updateApplicationStatus(applicationId, 'REJECTED')
      .subscribe({
        next: () => {
          this.closeApplicationDetailsModal();
          this.loadApplications();
          this.loadMembersStats();
        },
        error: (err) => {
          console.error('Erreur rejet:', err);
          alert('Erreur lors du rejet');
        },
      });
  }

  // EXPORT DES DONNÉES
  exportCSV() {
    try {
      const csvContent = this.generateCSV();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const link = this.downloadLink.nativeElement;
      link.href = url;
      link.download = `membres-${this.state().clubId}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export:', error);
      alert("Erreur lors de l'export");
    }
  }

  private generateCSV(): string {
    const headers = ['Nom', 'Prénom', 'Email', 'Rôle', "Date d'adhésion"];
    const rows = this.allMembers().map((m) => [
      m.lastName,
      m.name,
      m.email,
      this.getRoleLabel(m.role),
      this.formatDate(m.joinDate),
    ]);

    const csvRows = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ];
    return csvRows.join('\n');
  }

  // FORMATAGE (used in CSV export)
  private formatDate(dateString: string | Date | null | undefined): string {
    try {
      if (!dateString) return '-';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString as string;
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      return '-';
    }
  }

  private getRoleLabel(role: string | undefined): string {
    if (!role || role.toUpperCase() === 'MEMBER') return 'Membre';
    const normalizedRole = role.toUpperCase().replace('_', '-');
    const labels: Record<string, string> = {
      PRESIDENT: 'Président',
      TREASURER: 'Trésorier',
      SECRETARY: 'Secrétaire',
      RH: 'Ressources Humaines',
    };
    return labels[normalizedRole] || role;
  }

  // NAVIGATION
  goBack() {
    this.location.back();
  }
}
