import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { ClubService } from '../../../Core/services/club.service';
import { Club, ClubFilters } from '../../../Core/models/club.model';
import { ClubFormComponent } from './club-form/club-form';
import { ClubPresidentModalComponent } from './club-president-modal/club-president-modal';
import { ToastService } from '../../../Core/services/toast.service';

/**
 * PAGE 18 : Manage Clubs
 * Gestion complète des clubs par l'administrateur
 * Optimisé Angular 20 avec Signals et OnPush
 */
@Component({
  selector: 'app-manage-clubs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    ClubFormComponent,
    ClubPresidentModalComponent,
  ],
  templateUrl: './manage-club.html',
  styleUrl: './manage-club.css',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ OnPush
})
export class ManageClubsComponent {
  // ========== SERVICES ==========
  private readonly clubService = inject(ClubService);
  private readonly toastService = inject(ToastService);

  // ========== SIGNALS D'ÉTAT ==========
  readonly selectedStatus = signal<'all' | 'active' | 'inactive'>('all');
  readonly selectedCategory = signal<number | 'all'>('all');
  readonly searchQuery = signal('');
  readonly sortBy = signal<'name' | 'members' | 'events' | 'createdAt'>('name');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(1);
  readonly pageSize = signal(12);

  // Modals
  readonly isDeleteModalOpen = signal(false);
  readonly isDetailsModalOpen = signal(false);
  readonly isFormModalOpen = signal(false);
  readonly selectedClub = signal<Club | null>(null);
  readonly isPresidentModalOpen = signal(false);

  // ========== COMPUTED FILTERS ==========
  readonly filters = computed<ClubFilters>(() => ({
    status: this.selectedStatus(),
    categoryId: this.selectedCategory(),
    search: this.searchQuery(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    page: this.currentPage(),
    limit: this.pageSize(),
  }));

  // ========== RX RESOURCES ==========

  /**
   * Resource pour les clubs
   */
  readonly clubsResource = rxResource({
    params: this.filters,
    stream: ({ params }) => this.clubService.getClubs(params),
  });

  /**
   * Resource pour les statistiques
   */
  readonly statsResource = rxResource({
    stream: () => this.clubService.getClubsStats(),
  });

  /**
   * Resource pour les catégories
   */
  readonly categoriesResource = rxResource({
    stream: () => this.clubService.getCategories(),
  });

  // ========== COMPUTED SIGNALS ==========

  // Clubs paginés
  readonly clubs = computed(() => this.clubsResource.value()?.data || []);
  readonly totalClubs = computed(() => this.clubsResource.value()?.total || 0);
  readonly totalPages = computed(() => this.clubsResource.value()?.totalPages || 0);

  // États de chargement
  readonly isLoading = computed(() => this.clubsResource.isLoading());
  readonly hasError = computed(() => this.clubsResource.error() != null);

  // Statistiques
  readonly stats = computed(
    () =>
      this.statsResource.value() || {
        total: 0,
        active: 0,
        inactive: 0,
        totalMembers: 0,
        totalEvents: 0,
        totalRevenue: 0,
      },
  );

  // Catégories
  readonly categories = computed(() => this.categoriesResource.value() || []);

  // ========== TRACKBY FUNCTIONS ==========
  readonly trackByClubId = (_index: number, club: Club) => club.id;
  readonly trackByCategoryId = (_index: number, category: any) => category.id;

  // ========== MÉTHODES UTILITAIRES (PURES) ==========

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return `${amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} TND`;
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }

  /**
   * Obtenir l'URL complète d'une image
   */
  getImageUrl(path: string | null): string {
    if (!path) {
      return 'https://via.placeholder.com/400x200?text=No+Image';
    }
    if (path.startsWith('http')) {
      return path;
    }
    return `http://localhost:3000${path}`;
  }

  // ========== ACTIONS - FILTRAGE ==========

  changeStatus(status: 'all' | 'active' | 'inactive'): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
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

  // ========== ACTIONS - MODALS ==========

  openCreateModal(): void {
    this.selectedClub.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(club: Club): void {
    this.selectedClub.set(club);
    this.isFormModalOpen.set(true);
  }

  openDetailsModal(club: Club): void {
    this.selectedClub.set(club);
    this.isDetailsModalOpen.set(true);
  }

  closeDetailsModal(): void {
    this.selectedClub.set(null);
    this.isDetailsModalOpen.set(false);
  }

  openDeleteModal(club: Club): void {
    this.selectedClub.set(club);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.selectedClub.set(null);
    this.isDeleteModalOpen.set(false);
  }

  /**
   * Ouvrir le modal de gestion du président
   */
  openPresidentModal(club: Club): void {
    this.selectedClub.set(club);
    this.isPresidentModalOpen.set(true);
  }

  /**
   * Fermer le modal de président
   */
  closePresidentModal(): void {
    this.selectedClub.set(null);
    this.isPresidentModalOpen.set(false);
  }

  /**
   * Gérer le succès de modification du président
   */
  onPresidentChanged(): void {
    this.closePresidentModal();
    this.refreshData();
    this.toastService.success('Président mis à jour avec succès !');
  }

  /**
   * Gérer le succès de création/modification
   */
  onClubCreated(): void {
    this.isFormModalOpen.set(false);
    this.selectedClub.set(null);
    this.refreshData();
  }

  // ========== ACTIONS - CRUD ==========

  deleteClub(): void {
    const club = this.selectedClub();
    if (!club) return;

    this.clubService.deleteClub(club.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.refreshData();
        this.toastService.success(`Club "${club.name}" supprimé avec succès !`);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.toastService.error('Erreur lors de la suppression du club');
      },
    });
  }

  toggleClubStatus(club: Club): void {
    const newStatus = !club.isActive;

    this.clubService.toggleClubStatus(club.id, newStatus).subscribe({
      next: () => {
        this.refreshData();
        const statusLabel = newStatus ? 'activé' : 'désactivé';
        this.toastService.success(`Club "${club.name}" ${statusLabel} !`);
      },
      error: (error) => {
        console.error('Erreur lors du changement de statut:', error);
        this.toastService.error('Erreur lors du changement de statut');
      },
    });
  }

  // ========== UTILITAIRES ==========

  refreshData(): void {
    this.clubsResource.reload();
    this.statsResource.reload();
  }
}
