import { Component, signal, OnInit, effect, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation';
import { TabItem } from '../../../shared/interfaces/components.interface';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { EventService } from '../../../Core/services/event.service';
import { EventStatus } from '../../../Core/models/event.model';
import { ClubContextService } from '../../../Core/services/club-context.service';

/**
 * PAGE: Gestion du Club - ENHANCED VERSION
 * Permet de gérer les informations, membres, événements et paramètres du club
 *
 * Améliorations:
 * - Header Hero Section (inspiré du club-details)
 * - Affichage amélioré des statistiques
 * - Meilleure organisation visuelle
 *
 * Route: /club-manager/:clubId/manage-club
 */
@Component({
  selector: 'app-manage-club',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TabNavigationComponent, StatCardComponent],
  templateUrl: './manage-club.html',
  styleUrl: './manage-club.css',
})
export class ManageClubComponent implements OnInit {
  // ============================================
  // SERVICES
  // ============================================
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clubContext = inject(ClubContextService);
  private clubManagerService = inject(ClubManagerService);
  private eventService = inject(EventService);

  // ============================================
  // SIGNAUX - ÉTAT DE LA PAGE
  // ============================================
  /** Onglet actif (info, membres, événements, paramètres) */
  activeTab = signal<string>('info');

  /** ID du club extrait de l'URL */
  clubId = signal<number | null>(null);

  /** En attente de sauvegarde */
  saving = signal(false);

  /** Mode édition activé pour les informations */
  editMode = signal(false);

  // ============================================
  // SIGNAUX - DONNÉES DU CLUB
  // ============================================
  /** Nom du club */
  clubName = signal('');

  /** Description du club */
  clubDescription = signal('');

  /** Email de contact du club */
  clubEmail = signal('');

  /** Logo du club */
  clubLogo = signal('');

  /** Club gratuit ou payant */
  isPublic = signal(false);

  /** Montant de la cotisation annuelle en TND */
  membershipFee = signal(0);

  /** Approbation requise pour les adhésions */
  approvalRequired = signal(true);

  /** Club actif ou inactif */
  isActive = signal(true);

  /** Date de création du club */
  creationDate = signal<string>('');

  // ============================================
  // SIGNAUX - STATISTIQUES
  // ============================================
  /** Nombre total de membres */
  totalMembers = signal(0);

  /** Nombre total d'événements */
  totalEvents = signal(0);

  /** Nombre de demandes en attente */
  pendingRequests = signal(0);

  // ============================================
  // SIGNAUX - DONNÉES PRÉVISUALISÉES
  // ============================================
  /** Membres récents (aperçu) */
  recentMembers = signal<any[]>([]);

  /** Événements à venir (aperçu) */
  upcomingEvents = signal<any[]>([]);

  // ============================================
  // CONFIGURATION DES ONGLETS
  // ============================================
  tabs = signal<TabItem[]>([
    { id: 'info', label: 'Informations', icon: 'info-circle' },
    { id: 'members', label: 'Membres', icon: 'people' },
    { id: 'events', label: 'Événements', icon: 'calendar-event' },
    { id: 'settings', label: 'Paramètres', icon: 'gear' },
  ]);

  // ============================================
  // CONSTRUCTEUR
  // ============================================
  constructor() {
    effect(() => {
      const id = this.clubId();
      if (id) {
        this.loadClubData();
      }
    });
  }

  // ============================================
  // CYCLE DE VIE
  // ============================================
  ngOnInit() {
    // Extraire l'ID du club depuis les paramètres d'URL
    this.route.params.subscribe(params => {
      const id = params['clubId'];
      if (id) {
        this.clubId.set(+id);
        this.clubContext.setCurrentClub(+id);
      } else {
        // Si pas d'ID, rediriger vers la page de sélection
        this.router.navigate(['/club-manager/select']);
      }
    });
  }

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  /**
   * Charger toutes les données du club
   */
  loadClubData() {
    const clubId = this.clubId();
    if (!clubId) return;

    // Charger les détails du club
    this.clubManagerService.getClubDetails(clubId).subscribe({
      next: (club) => {
        if(club.logo) this.clubLogo.set(club.logo);
        if (club.name) this.clubName.set(club.name);
        if (club.description) this.clubDescription.set(club.description);
        if (club.contactEmail) this.clubEmail.set(club.contactEmail);
        if (club.isPublic !== undefined) this.isPublic.set(club.isPublic);
        if (club.membershipFeeAmount) this.membershipFee.set(club.membershipFeeAmount);
        if (club.isActive !== undefined) this.isActive.set(club.isActive);
        if (club.creationDate) this.creationDate.set(club.creationDate);
        // Récupération de l'approbation requise (à adapter selon votre API)
        this.approvalRequired.set(true);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails du club:', err);
        alert('Erreur lors du chargement des données du club');
      }
    });

    // Charger les statistiques détaillées du club
    this.clubManagerService.getClubDetailedStats(clubId).subscribe({
      next: (stats) => {
        this.totalMembers.set(stats.totalMembers || 0);
        this.totalEvents.set(stats.totalEvents || 0);
        this.pendingRequests.set(stats.pendingRequests || 0);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stats:', err);
      }
    });

    // Charger les membres récents (limité à 5)
    this.clubManagerService.getMembers(clubId, 'APPROVED', 1, 5).subscribe({
      next: (response) => {
        const members = response.data || [];
        this.recentMembers.set(members.map((m: any) => ({
          id: m.id,
          name: `${m.user?.name || m.name} ${m.user?.lastName || m.lastName}`,
          role: m.role || 'member',
          joinDate: m.joinDate || m.createdAt
        })));
      },
      error: (err) => {
        console.error('Erreur chargement membres:', err);
      }
    });

    // Charger les événements à venir (limité à 3)
    this.eventService.getEvents({ clubId, status: EventStatus.UPCOMING, limit: 3 }).subscribe({
      next: (response) => {
        this.upcomingEvents.set(response.data.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.startDate,
          participants: e.capacity || 0
        })));
      },
      error: (err) => {
        console.error('Erreur chargement événements:', err);
      }
    });
  }

  // ============================================
  // GESTION DES ONGLETS
  // ============================================

  /**
   * Changer d'onglet actif
   */
  onTabChange(tabId: string) {
    this.activeTab.set(tabId);
  }

  // ============================================
  // GESTION DU MODE ÉDITION
  // ============================================

  /**
   * Basculer le mode édition des informations
   */
  toggleEditMode() {
    this.editMode.set(!this.editMode());
  }

  // ============================================
  // ACTIONS DE NAVIGATION
  // ============================================

  /**
   * Retourner à la page précédente
   */
  goBack() {
    this.router.navigate(['/club-manager']);
  }

  // ============================================
  // ACTIONS DE SAUVEGARDE
  // ============================================

  /**
   * Sauvegarder les informations du club
   */
  saveClubInfo() {
    this.saving.set(true);
    const clubId = this.clubId();
    if (!clubId) return;

    this.clubManagerService.updateClub(clubId, {
      name: this.clubName(),
      description: this.clubDescription(),
      contactEmail: this.clubEmail(),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.editMode.set(false);
        alert('Informations mises à jour avec succès');
      },
      error: (err) => {
        this.saving.set(false);
        console.error('Erreur sauvegarde info:', err);
        alert('Erreur lors de la mise à jour des informations');
      },
    });
  }

  /**
   * Sauvegarder les paramètres du club
   */
  saveSettings() {
    this.saving.set(true);
    const clubId = this.clubId();
    if (!clubId) return;

    this.clubManagerService.updateClub(clubId, {
      isPublic: this.isPublic(),
      membershipFeeAmount: this.membershipFee(),
      approvalRequired: this.approvalRequired(),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        alert('Paramètres mis à jour avec succès');
      },
      error: (err) => {
        this.saving.set(false);
        console.error('Erreur sauvegarde paramètres:', err);
        alert('Erreur lors de la mise à jour des paramètres');
      },
    });
  }

  // ============================================
  // NAVIGATION
  // ============================================

  /**
   * Naviguer vers le tableau de bord du club
   */
  navigateToDashboard() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/club-manager/${clubId}/dashboard`]);
    }
  }

  /**
   * Naviguer vers la gestion des membres
   */
  navigateToMembers() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/club-manager/${clubId}/manage-members`]);
    }
  }

  /**
   * Naviguer vers la gestion des événements
   */
  navigateToEvents() {
    const clubId = this.clubId();
    if (clubId) {
      this.router.navigate([`/events`], { queryParams: { clubId } });
    }
  }

  // ============================================
  // MÉTHODES DE FORMATAGE
  // ============================================

  /**
   * Formater une date au format français
   */
  formatDate(dateString: string | null | undefined): string {
    try {
      if (!dateString) return '-';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString as string;
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      return dateString || '-';
    }
  }

  /**
   * Obtenir la classe CSS du badge du rôle
   */
  getRoleBadge(role: string | undefined): string {
    if (!role) return 'badge-default';
    const badges: Record<string, string> = {
      'president': 'badge-primary',
      'treasurer': 'badge-success',
      'secretary': 'badge-warning',
      'member': 'badge-default',
    };
    return badges[role.toLowerCase()] || 'badge-default';
  }

  /**
   * Obtenir le libellé du rôle en français
   */
  getRoleLabel(role: string | undefined): string {
    if (!role) return 'Membre';
    const labels: Record<string, string> = {
      'president': 'Président',
      'treasurer': 'Trésorier',
      'secretary': 'Secrétaire',
      'member': 'Membre',
    };
    return labels[role.toLowerCase()] || role;
  }
}
