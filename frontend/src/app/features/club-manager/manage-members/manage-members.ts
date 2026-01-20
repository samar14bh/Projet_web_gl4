import { Component, signal, computed, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { Member } from '../../../Core/interfaces/club-manager.interface';
import { ApplicationResponseDto } from '../../../Core/dtos/application-response.dto';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation';
import { TabItem } from '../../../shared/interfaces/components.interface';
import { ClubContextService } from '../../../Core/services/club-context.service';
import {ApplicationItem} from '../../applications/application-item/application-item';

/**
 * PAGE 14: Gestion des Membres du Club
 * Permet de gérer les adhésions, approuver/rejeter les demandes, assigner des rôles
 *
 * Route: /club-manager/:clubId/manage-members
 */
@Component({
  selector: 'app-manage-members',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TabNavigationComponent, ApplicationItem],
  templateUrl: './manage-members.html',
  styleUrl: './manage-members.css',
})
export class ManageMembersComponent implements OnInit {
  // ============================================
  // SERVICES
  // ============================================
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clubContext = inject(ClubContextService);
  public clubManagerService = inject(ClubManagerService);

  // ============================================
  // SIGNAUX - ÉTAT DE LA PAGE
  // ============================================
  /** Onglet actif (bureau, members, applications) */
  activeTab = signal<string>('bureau');

  /** ID du club extrait de l'URL */
  clubId = signal<number | null>(null);

  /** Texte de recherche pour filtrer */
  searchQuery = signal('');

  /** Modal state */
  showRoleModal = signal(false);
  selectedMember = signal<Member | null>(null);
  selectedRole = signal('');

  // ============================================
  // SIGNAUX - DONNÉES LOCALES
  // ============================================
  /** Tous les membres */
  allMembers = signal<Member[]>([]);

  /** Toutes les applications */
  applicationsData = signal<ApplicationResponseDto[]>([]);

  // ============================================
  // CONFIGURATION DES ONGLETS
  // ============================================
  tabs = signal<TabItem[]>([
    { id: 'bureau', label: 'Bureau', icon: 'shield-check' },
    { id: 'members', label: 'Tous les Membres', icon: 'people-fill' },
    { id: 'applications', label: 'Demandes', icon: 'inbox', badge: 0 },
  ]);

  // ============================================
  // SIGNAUX CALCULÉS - MEMBRES
  // ============================================

  /** Membres du bureau (où role != MEMBER) */
  bureauMembers = computed(() =>
    this.allMembers().filter(m => m.role && m.role.toLowerCase() !== 'member')
  );

  /** Membres normaux (où role = MEMBER) */
  regularMembers = computed(() =>
    this.allMembers().filter(m => !m.role || m.role.toLowerCase() === 'member')
  );

  /** Tous les membres filtrés par recherche */
  filteredAllMembers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.allMembers().filter(m =>
      `${m.name} ${m.lastName}`.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query)
    );
  });

  /** Membres du bureau filtrés */
  filteredBureauMembers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.bureauMembers().filter(m =>
      `${m.name} ${m.lastName}`.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query)
    );
  });

  // ============================================
  // SIGNAUX CALCULÉS - APPLICATIONS
  // ============================================

  /** Applications en attente */
  pendingApplications = computed(() =>
    this.applicationsData().filter(a => a.status === 'PENDING')
  );

  /** Applications approuvées */
  approvedApplications = computed(() =>
    this.applicationsData().filter(a => a.status === 'APPROVED')
  );

  /** Applications confirmées */
  confirmedApplications = computed(() =>
    this.applicationsData().filter(a => a.status === 'CONFIRMED')
  );

  /** Applications rejetées */
  rejectedApplications = computed(() =>
    this.applicationsData().filter(a => a.status === 'REJECTED')
  );

  /** Toutes les applications */
  allApplications = computed(() => this.applicationsData());

  // ============================================
  // SIGNAUX CALCULÉS - STATS DYNAMIQUES
  // ============================================

  /** Total des membres */
  totalMembers = computed(() => this.allMembers().length);

  /** Nombre de membres du bureau */
  bureauMembersCount = computed(() => this.bureauMembers().length);

  /** Nombre de membres normaux */
  regularMembersCount = computed(() => this.regularMembers().length);

  /** Nombre de demandes en attente */
  pendingCount = computed(() => this.pendingApplications().length);

  /** Nombre de demandes approuvées */
  approvedCount = computed(() => this.approvedApplications().length);

  /** Nombre de demandes rejetées */
  rejectedCount = computed(() => this.rejectedApplications().length);

  /** En attente du chargement */
  loading = computed(() => this.clubManagerService.loading());

  // ============================================
  // CONSTRUCTEUR
  // ============================================
  constructor() {
    effect(() => {
      const id = this.clubId();
      if (id) {
        this.loadData();
      }
    });
  }

  // ============================================
  // CYCLE DE VIE
  // ============================================
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

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  /**
   * Charger toutes les données
   */
  loadData() {
    const clubId = this.clubId();
    if (!clubId) return;

    // Charger les membres approuvés
    this.clubManagerService.getMembers(clubId, 'APPROVED').subscribe({
      next: (response) => {
        const members = (response.data || []).map((m: any) => ({
          id: m.id,
          name: m.user?.name || m.name,
          lastName: m.user?.lastName || m.lastName,
          email: m.user?.email || m.email,
          role: m.role || 'member',
          dateDebut: m.joinDate || m.createdAt,
          dateFin: m.endDate,
          status: 'active' as const
        }));
        this.allMembers.set(members);
      },
      error: (err: any) => {
        console.error('Erreur chargement membres:', err);
      }
    });

    // Charger toutes les applications (PENDING, APPROVED, CONFIRMED, REJECTED)
    this.loadApplicationsByStatus('PENDING');
    this.loadApplicationsByStatus('APPROVED');
    this.loadApplicationsByStatus('CONFIRMED');
    this.loadApplicationsByStatus('REJECTED');
  }

  /**
   * Charger les applications par statut
   */
  private loadApplicationsByStatus(status: string) {
    const clubId = this.clubId();
    if (!clubId) return;

    // Note: Le service getMembers retourne les applications
    // Vous pouvez créer une nouvelle méthode si besoin
    this.clubManagerService.getMembers(clubId, status).subscribe({
      next: (response) => {
        const apps = (response.data || []).map((a: any) => this.mapToApplicationDto(a, status));
        this.applicationsData.update(prev => [
          ...prev.filter(p => p.status !== status),
          ...apps
        ]);
        this.updateApplicationBadge();
      },
      error: (err: any) => {
        console.error(`Erreur chargement applications ${status}:`, err);
      }
    });
  }

  /**
   * Mapper les données du service vers ApplicationResponseDto
   */
  private mapToApplicationDto(data: any, status: string): ApplicationResponseDto {
    return {
      id: data.id,
      status: status,
      adminResponse: data.adminResponse,
      whyJoin: data.whyJoin || '',
      previousClub: data.previousClub,
      goalsInClub: data.goalsInClub || '',
      phoneNumber: data.phoneNumber || '',
      skills: data.skills,
      expectations: data.expectations,
      availability: data.availability,
      additionalComments: data.additionalComments,
      isMemberOfOtherClub: data.isMemberOfOtherClub || false,
      userId: data.user?.id || data.userId || 0,
      userName: data.user?.name || data.userName || '',
      userEmail: data.user?.email || data.userEmail || '',
      clubId: data.clubId || 0,
      clubName: data.clubName || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  /**
   * Mettre à jour le badge du nombre de demandes
   */
  private updateApplicationBadge() {
    const tabs = this.tabs();
    tabs[2].badge = this.pendingCount();
    this.tabs.set([...tabs]);
  }

  // ============================================
  // GESTION DES ONGLETS
  // ============================================

  /**
   * Changer d'onglet
   */
  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  // ============================================
  // GESTION DES RÔLES - MODAL
  // ============================================

  /**
   * Ouvrir le modal d'assignation de rôle
   */
  openRoleModal(member: Member) {
    this.selectedMember.set(member);
    this.selectedRole.set(member.role || 'member');
    this.showRoleModal.set(true);
  }

  /**
   * Fermer le modal
   */
  closeRoleModal() {
    this.showRoleModal.set(false);
    this.selectedMember.set(null);
    this.selectedRole.set('');
  }

  /**
   * Confirmer le changement de rôle
   */
  confirmRoleChange() {
    const member = this.selectedMember();
    const role = this.selectedRole();

    if (!member) return;

    // TODO: Appeler le service pour mettre à jour le rôle
    console.log(`Mise à jour du rôle de ${member.name} à ${role}`);

    // Mettre à jour localement
    this.allMembers.update(members =>
      members.map(m =>
        m.id === member.id ? { ...m, role } : m
      )
    );

    this.closeRoleModal();
  }

  // ============================================
  // GESTION DES APPLICATIONS
  // ============================================

  /**
   * Approuver une demande d'adhésion
   */
  approveMember(applicationId: number) {
    this.clubManagerService.updateMemberStatus(applicationId, 'APPROVED').subscribe({
      next: () => {
        this.loadData();
      },
      error: (err: any) => {
        console.error('Erreur approbation:', err);
        alert('Erreur lors de l\'approbation');
      }
    });
  }

  /**
   * Rejeter une demande d'adhésion
   */
  rejectMember(applicationId: number) {
    this.clubManagerService.updateMemberStatus(applicationId, 'REJECTED').subscribe({
      next: () => {
        this.loadData();
      },
      error: (err: any) => {
        console.error('Erreur rejet:', err);
        alert('Erreur lors du rejet');
      }
    });
  }

  /**
   * Gérer l'affichage des détails d'une application
   */
  handleViewApplicationDetails(applicationId: number): void {
    const app = this.allApplications().find(a => a.id === applicationId);
    if (app) {
      console.log('Voir les détails de:', app);
      // TODO: Ouvrir un modal ou naviguer vers une page de détails
      alert(`Voir les détails de ${app.userName}`);
    }
  }

  // ============================================
  // EXPORT DES DONNÉES
  // ============================================

  /**
   * Exporter la liste des membres en CSV
   */
  exportCSV() {
    try {
      console.log('Export CSV en cours de développement');
      alert('La fonctionnalité d\'export est en développement');
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  }

  // ============================================
  // FORMATAGE
  // ============================================

  /**
   * Formater une date
   */
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

  /**
   * Obtenir la classe CSS du badge du rôle
   */
  getRoleBadgeClass(role: string | undefined): string {
    if (!role) return 'badge-default';
    const classes: Record<string, string> = {
      'president': 'badge-primary',
      'vice-president': 'badge-primary',
      'treasurer': 'badge-success',
      'secretary': 'badge-warning',
      'member': 'badge-default',
    };
    return classes[role.toLowerCase()] || 'badge-default';
  }

  /**
   * Obtenir le libellé du rôle en français
   */
  getRoleLabel(role: string | undefined): string {
    if (!role) return 'Membre';
    const labels: Record<string, string> = {
      'president': 'Président',
      'vice-president': 'Vice-Président',
      'treasurer': 'Trésorier',
      'secretary': 'Secrétaire',
      'member': 'Membre',
    };
    return labels[role.toLowerCase()] || role;
  }

  /**
   * Obtenir la classe CSS du badge du statut
   */
  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'badge-default';
    const classes: Record<string, string> = {
      'PENDING': 'badge-warning',
      'APPROVED': 'badge-success',
      'CONFIRMED': 'badge-primary',
      'REJECTED': 'badge-danger',
    };
    return classes[status] || 'badge-default';
  }

  /**
   * Obtenir le libellé du statut
   */
  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Inconnu';
    const labels: Record<string, string> = {
      'PENDING': 'En Attente',
      'APPROVED': 'Approuvée',
      'CONFIRMED': 'Confirmée',
      'REJECTED': 'Rejetée',
    };
    return labels[status] || status;
  }

  assignRole() {
    alert('La fonctionnalité d\'assignation de rôle est en développement');
  }
}
