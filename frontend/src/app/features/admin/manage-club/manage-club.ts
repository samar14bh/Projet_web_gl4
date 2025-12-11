import {
  Component,
  signal,
  computed,
  inject,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {rxResource} from '@angular/core/rxjs-interop';
import {ButtonComponent} from '../../../shared/components/button/button';
import {ModalComponent} from '../../../shared/components/modal/modal';
import {ClubService} from '../../../Core/services/club.service';
import {Club, ClubFilters} from '../../../Core/models/club.model';

/**
 * PAGE 18 : Manage Clubs
 * Gestion complète des clubs par l'administrateur
 */
@Component({
  selector: 'app-manage-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent],
  templateUrl: './manage-club.html',
  styleUrl: './manage-club.css',
})
export class ManageClubsComponent {
  // ========== SERVICES ==========
  private readonly clubService = inject(ClubService);

  // ========== SIGNALS D'ÉTAT ==========
  selectedStatus = signal<'all' | 'active' | 'inactive'>('all');
  selectedCategory = signal<number | 'all'>('all');
  searchQuery = signal('');
  sortBy = signal<'name' | 'members' | 'events' | 'createdAt'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  pageSize = signal(12);

  // Modals
  isDeleteModalOpen = signal(false);
  isDetailsModalOpen = signal(false);
  isFormModalOpen = signal(false);
  selectedClub = signal<Club | null>(null);

  // ========== COMPUTED FILTERS ==========
  filters = computed<ClubFilters>(() => ({
    status: this.selectedStatus(),
    categoryId: this.selectedCategory(),
    search: this.searchQuery(),
    sortBy: this.sortBy(),
    sortOrder: this.sortOrder(),
    page: this.currentPage(),
    limit: this.pageSize(),
  }));

  // ========== RX RESOURCES ==========

  // Resource pour les clubs
  clubsResource = rxResource({
    params: this.filters,
    stream: ({params}) => this.clubService.getClubs(params),
  });

  // Resource pour les statistiques
  statsResource = rxResource({
    stream: () => this.clubService.getClubsStats(),
  });

  // Resource pour les catégories
  categoriesResource = rxResource({
    stream: () => this.clubService.getCategories(),
  });

  // ========== COMPUTED SIGNALS ==========

  // Clubs paginés
  clubs = computed(() => this.clubsResource.value()?.data || []);
  totalClubs = computed(() => this.clubsResource.value()?.total || 0);
  totalPages = computed(() => this.clubsResource.value()?.totalPages || 0);

  // États de chargement
  isLoading = computed(() => this.clubsResource.isLoading());
  hasError = computed(() => this.clubsResource.error() != null);

  // Statistiques
  stats = computed(() => this.statsResource.value() || {
    total: 0,
    active: 0,
    inactive: 0,
    totalMembers: 0,
    totalEvents: 0,
    totalRevenue: 0,
  });

  // Catégories
  categories = computed(() => this.categoriesResource.value() || []);

  // ========== MÉTHODES DE FILTRAGE ==========

  changeStatus(status: 'all' | 'active' | 'inactive') {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

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
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  // ========== MÉTHODES MODALS ==========

  openCreateModal() {
    this.selectedClub.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(club: Club) {
    this.selectedClub.set(club);
    this.isFormModalOpen.set(true);
  }

  openDetailsModal(club: Club) {
    this.selectedClub.set(club);
    this.isDetailsModalOpen.set(true);
  }

  closeDetailsModal() {
    this.selectedClub.set(null);
    this.isDetailsModalOpen.set(false);
  }

  openDeleteModal(club: Club) {
    this.selectedClub.set(club);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.selectedClub.set(null);
    this.isDeleteModalOpen.set(false);
  }

  // ========== MÉTHODES CRUD ==========

  deleteClub() {
    const club = this.selectedClub();
    if (!club) return;

    this.clubService.deleteClub(club.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.refreshData();
        alert(`Club "${club.name}" supprimé avec succès !`);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du club');
      },
    });
  }

  toggleClubStatus(club: Club) {
    const newStatus = !club.isActive;

    this.clubService.toggleClubStatus(club.id, newStatus).subscribe({
      next: () => {
        this.refreshData();
        const statusLabel = newStatus ? 'activé' : 'désactivé';
        alert(`Club "${club.name}" ${statusLabel} !`);
      },
      error: (error) => {
        console.error('Erreur lors du changement de statut:', error);
        alert('Erreur lors du changement de statut');
      },
    });
  }

  // ========== MÉTHODES UTILITAIRES ==========

  refreshData() {
    this.clubsResource.reload();
    this.statsResource.reload();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return `${amount.toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} TND`;
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
}
