import { Component, signal, computed, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import {
  Member,
  MembersStats,
  Application,
  Club,
  MemberRole,
} from '../../../Core/interfaces/club-manager.interface';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation';
import { TabItem } from '../../../shared/interfaces/components.interface';
import { ClubContextService } from '../../../Core/services/club-context.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-manage-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TabNavigationComponent,
    PaginationComponent,
  ],
  templateUrl: './manage-members.html',
  styleUrl: './manage-members.css',
})
export class ManageMembersComponent implements OnInit {
  // SERVICES
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clubContext = inject(ClubContextService);
  public clubManagerService = inject(ClubManagerService);

  // SIGNAUX - ÉTAT DE LA PAGE
  activeTab = signal<string>('members');
  clubId = signal<number | null>(null);
  searchQuery = signal('');
  loading = signal(false);

  // CLUB DATA
  clubDetails = signal<Club | null>(null);
  membersStats = signal<MembersStats | null>(null);

  // MODAL STATE
  showRoleModal = signal(false);
  showRemoveModal = signal(false);
  showApplicationDetailsModal = signal(false);
  selectedMember = signal<Member | null>(null);
  selectedRole = signal<string>('');
  selectedApplication = signal<Application | null>(null);

  // APPLICATION FILTER
  applicationStatus = signal<string>('PENDING');

  // PAGINATION
  membersPage = signal(1);
  membersLimit = signal(10);
  membersTotal = signal(0);

  applicationsPage = signal(1);
  applicationsLimit = signal(10);
  applicationsTotal = signal(0);

  // DONNÉES LOCALES
  allMembers = signal<Member[]>([]);
  applicationsData = signal<Application[]>([]);

  // CONFIGURATION DES ONGLETS
  tabs = signal<TabItem[]>([
    { id: 'members', label: 'Tous les Membres', icon: 'people-fill' },
    { id: 'bureau', label: 'Bureau', icon: 'shield-check' },
    { id: 'applications', label: 'Demandes', icon: 'inbox', badge: 0 },
  ]);

  // FILTRES DE STATUS D'APPLICATIONS
  statusFilters = [
    { value: 'PENDING', label: 'En Attente', icon: 'hourglass-split' },
    { value: 'APPROVED', label: 'Approuvées', icon: 'check-circle' },
    { value: 'REJECTED', label: 'Rejetées', icon: 'x-circle' },
  ];

  // SIGNAUX CALCULÉS - STATS
  totalMembers = computed(() => this.membersStats()?.totalMembers || 0);
  bureauMembersCount = computed(() => this.membersStats()?.bureauMembers || 0);
  regularMembersCount = computed(
    () => this.membersStats()?.regularMembers || 0
  );
  pendingCount = computed(
    () => this.membersStats()?.pendingApplications || 0
  );
  approvedCount = computed(
    () => this.membersStats()?.approvedApplications || 0
  );
  rejectedCount = computed(
    () => this.membersStats()?.rejectedApplications || 0
  );

  // PAGINATION CALCULÉE
  membersTotalPages = computed(() =>
    Math.ceil(this.membersTotal() / this.membersLimit())
  );
  applicationsTotalPages = computed(() =>
    Math.ceil(this.applicationsTotal() / this.applicationsLimit())
  );

  constructor() {
    effect(() => {
      const id = this.clubId();
      if (id) {
        this.loadClubDetails();
        this.loadMembersStats();
        this.loadDataForActiveTab();
      }
    });

    effect(() => {
      const tab = this.activeTab();
      if (this.clubId()) {
        this.loadDataForActiveTab();
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['clubId'];
      if (id) {
        this.clubId.set(+id);
        this.clubContext.setCurrentClub(+id);
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

  loadDataForActiveTab() {
    const tab = this.activeTab();
    if (tab === 'members') {
      this.loadMembers();
    } else if (tab === 'bureau') {
      this.loadBureauMembers();
    } else if (tab === 'applications') {
      this.loadApplications();
    }
  }

  // ✅ CHARGEMENT TOUS LES MEMBRES
  loadMembers() {
    const clubId = this.clubId();
    if (!clubId) return;

    this.loading.set(true);
    this.clubManagerService
      .getMembers(
        clubId,
        this.membersPage(),
        this.membersLimit(),
        undefined,
        this.searchQuery()
      )
      .subscribe({
        next: (response) => {
          this.allMembers.set(response.data);
          this.membersTotal.set(response.total);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement membres:', err);
          this.loading.set(false);
        },
      });
  }

  // ✅ CHARGEMENT MEMBRES DU BUREAU - CORRIGÉ
  loadBureauMembers() {
    const clubId = this.clubId();
    if (!clubId) return;

    this.loading.set(true);
    this.clubManagerService
      .getBureauMembers(
        clubId,
        this.membersPage(),
        this.membersLimit(),
        this.searchQuery()
      )
      .subscribe({
        next: (response) => {
          this.allMembers.set(response.data);
          this.membersTotal.set(response.total); // ✅ Total correct du backend
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement bureau:', err);
          this.loading.set(false);
        },
      });
  }

  // ✅ CHARGEMENT APPLICATIONS
  loadApplications() {
    const clubId = this.clubId();
    if (!clubId) return;

    this.loading.set(true);
    this.clubManagerService
      .getApplications(
        clubId,
        this.applicationsPage(),
        this.applicationsLimit(),
        this.applicationStatus()
      )
      .subscribe({
        next: (response) => {
          this.applicationsData.set(response.data);
          this.applicationsTotal.set(response.total);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement applications:', err);
          this.loading.set(false);
        },
      });
  }

  private updateApplicationBadge() {
    const tabs = this.tabs();
    tabs[2].badge = this.pendingCount();
    this.tabs.set([...tabs]);
  }

  // GESTION DES ONGLETS
  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
    this.membersPage.set(1);
    this.applicationsPage.set(1);
    this.searchQuery.set('');
  }

  // RECHERCHE
  onSearchChange() {
    this.membersPage.set(1);
    this.loadDataForActiveTab();
  }

  // PAGINATION
  onMembersPageChange(page: number) {
    this.membersPage.set(page);
    this.loadDataForActiveTab();
  }

  onApplicationsPageChange(page: number) {
    this.applicationsPage.set(page);
    this.loadApplications();
  }

  // GESTION DES RÔLES - MODAL
  openRoleModal(member: Member) {
    this.selectedMember.set(member);
    this.selectedRole.set(member.role?.toUpperCase() || 'MEMBER');
    this.showRoleModal.set(true);
  }

  closeRoleModal() {
    this.showRoleModal.set(false);
    this.selectedMember.set(null);
    this.selectedRole.set('');
  }

  confirmRoleChange() {
    const member = this.selectedMember();
    const role = this.selectedRole();

    if (!member) return;

    this.clubManagerService.assignRole(member.id, role as MemberRole).subscribe({
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
    this.selectedMember.set(member);
    this.showRemoveModal.set(true);
  }

  closeRemoveModal() {
    this.showRemoveModal.set(false);
    this.selectedMember.set(null);
  }

  confirmRemoveMember() {
    const member = this.selectedMember();
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
    this.applicationStatus.set(status);
    this.applicationsPage.set(1);
    this.loadApplications();
  }

  openApplicationDetailsModal(application: Application) {
    this.selectedApplication.set(application);
    this.showApplicationDetailsModal.set(true);
  }

  closeApplicationDetailsModal() {
    this.showApplicationDetailsModal.set(false);
    this.selectedApplication.set(null);
  }

  approveMember(applicationId: number) {
    this.clubManagerService
      .updateApplicationStatus(applicationId, 'APPROVED')
      .subscribe({
        next: () => {
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
      const link = document.createElement('a');
      link.href = url;
      link.download = `membres-${this.clubId()}-${new Date().toISOString().split('T')[0]}.csv`;
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

  // FORMATAGE
  formatDate(dateString: string | Date | null | undefined): string {
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

  getRoleBadgeClass(role: string | undefined): string {
    if (!role || role.toUpperCase() === 'MEMBER') return 'badge-default';
    const normalizedRole = role.toUpperCase().replace('_', '-');
    const classes: Record<string, string> = {
      PRESIDENT: 'badge-primary',
      'VICE-PRESIDENT': 'badge-primary',
      TREASURER: 'badge-success',
      SECRETARY: 'badge-warning',
      RH: 'badge-info',
    };
    return classes[normalizedRole] || 'badge-default';
  }

  getRoleLabel(role: string | undefined): string {
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

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'badge-default';
    const classes: Record<string, string> = {
      PENDING: 'badge-warning',
      APPROVED: 'badge-success',
      CONFIRMED: 'badge-primary',
      REJECTED: 'badge-danger',
    };
    return classes[status] || 'badge-default';
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Inconnu';
    const labels: Record<string, string> = {
      PENDING: 'En Attente',
      APPROVED: 'Approuvée',
      CONFIRMED: 'Confirmée',
      REJECTED: 'Rejetée',
    };
    return labels[status] || status;
  }

  // Helper pour vérifier si une application est en attente
  isApplicationPending(status: string | undefined): boolean {
    return status === 'PENDING';
  }
}
