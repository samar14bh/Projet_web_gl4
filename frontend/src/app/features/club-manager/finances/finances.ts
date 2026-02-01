import {
  Component,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { FinanceService } from '../../../Core/services/finance.service';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  TransactionFilters,
} from '../../../Core/models/finance.model';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ModalComponent } from '../../../shared/components/modal/modal';
import { TransactionForm } from './transaction-form/transaction-form';
import { ExportService } from '../../../Core/services/export.service';

/**
 * PAGE 16 : Finances du club
 * Gestion et visualisation des finances du club
 */
@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent, TransactionForm],
  templateUrl: './finances.html',
  styleUrl: './finances.css',
})
export class FinancesComponent {
  private readonly financeService = inject(FinanceService);
  private readonly exportService = inject(ExportService);

  // ========== SIGNALS D'ÉTAT ==========

  // Période sélectionnée
  selectedPeriod = signal<'month' | 'quarter' | 'year' | 'all'>('month');

  // Type de transaction filtré
  selectedTransactionType = signal<TransactionType | 'all'>('all');

  // Catégorie de transaction
  selectedCategory = signal<TransactionCategory | 'all'>('all');

  // Recherche
  searchQuery = signal('');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);

  // Modal d'ajout de dépense
  isExpenseModalOpen = signal(false);

  // Modal de détails
  isDetailsModalOpen = signal(false);
  selectedTransaction = signal<Transaction | null>(null);

  // Club ID (TODO: récupérer depuis l'authentification)
  clubId = signal<number>(1);

  // ========== COMPUTED FILTERS ==========

  filters = computed<TransactionFilters>(() => ({
    period: this.selectedPeriod(),
    type: this.selectedTransactionType(),
    category: this.selectedCategory(),
    search: this.searchQuery() || undefined,
    page: this.currentPage(),
    limit: this.pageSize(),
    clubId: this.clubId(),
  }));

  // ========== RESOURCES (rxResource) ==========

  /**
   * Resource pour les transactions avec filtres réactifs
   */
  transactionsResource = rxResource({
    params: this.filters,
    stream: ({ params }) => this.financeService.getTransactions(params),
  });

  /**
   * Resource pour les statistiques financières
   */
  statsResource = rxResource({
    params: computed(() => ({
      clubId: this.clubId(),
      period: this.selectedPeriod(),
    })),
    stream: ({ params }) => this.financeService.getFinancialStats(params.clubId, params.period),
  });

  /**
   * Resource pour les données mensuelles du graphique
   */
  chartResource = rxResource({
    params: computed(() => ({
      clubId: this.clubId(),
      months: 6,
    })),
    stream: ({ params }) => this.financeService.getMonthlyData(params.clubId, params.months),
  });

  // ========== COMPUTED SIGNALS DÉRIVÉS ==========

  transactions = computed(() => this.transactionsResource.value()?.data ?? []);
  totalTransactions = computed(() => this.transactionsResource.value()?.total ?? 0);
  totalPages = computed(() => this.transactionsResource.value()?.totalPages ?? 0);
  isLoading = computed(() => this.transactionsResource.isLoading());
  hasError = computed(() => !!this.transactionsResource.error());
  error = computed(() => this.transactionsResource.error());

  financialStats = computed(() => this.statsResource.value() ?? {
    totalRevenue: 0,
    totalExpenses: 0,
    balance: 0,
    membershipRevenue: 0,
    eventRevenue: 0,
    donationRevenue: 0,
    pendingPayments: 0,
  });

  chartData = computed(() => this.chartResource.value() ?? []);
  isStatsLoading = computed(() => this.statsResource.isLoading());
  isChartLoading = computed(() => this.chartResource.isLoading());

  // ========== ÉNUMÉRATIONS POUR LE TEMPLATE ==========
  TransactionType = TransactionType;
  TransactionCategory = TransactionCategory;

  // ========== MÉTHODES ==========

  /**
   * Changer la période
   */
  changePeriod(period: 'month' | 'quarter' | 'year' | 'all') {
    this.selectedPeriod.set(period);
    this.currentPage.set(1);
    // rxResource se met à jour automatiquement
  }

  /**
   * Changer le type de transaction
   */
  changeTransactionType(type: TransactionType | 'all') {
    this.selectedTransactionType.set(type);
    this.currentPage.set(1);
    // rxResource se met à jour automatiquement
  }

  /**
   * Changer la catégorie
   */
  changeCategory(category: TransactionCategory | 'all') {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
    // rxResource se met à jour automatiquement
  }

  /**
   * Rechercher
   */
  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    // rxResource se met à jour automatiquement
  }

  /**
   * Changer de page
   */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      // rxResource se met à jour automatiquement
    }
  }

  /**
   * Recharger les données manuellement
   */
  reloadData(): void {
    this.transactionsResource.reload();
    this.statsResource.reload();
    this.chartResource.reload();
  }

  /**
   * Ouvrir le modal d'ajout de dépense
   */
  openExpenseModal() {
    this.isExpenseModalOpen.set(true);
  }

  /**
   * Fermer le modal d'ajout de dépense
   */
  closeExpenseModal() {
    this.isExpenseModalOpen.set(false);
  }
  /**
   * Succès de l'ajout de transaction
   */
  onTransactionSuccess() {
    this.closeExpenseModal();
    this.reloadData();
    alert('Transaction ajoutée avec succès !');
  }

  /**
   * Ouvrir le modal de détails
   */
  openDetailsModal(transaction: Transaction) {
    this.selectedTransaction.set(transaction);
    this.isDetailsModalOpen.set(true);
  }

  /**
   * Fermer le modal de détails
   */
  closeDetailsModal() {
    this.selectedTransaction.set(null);
    this.isDetailsModalOpen.set(false);
  }
  /**
   * Exporter les données en PDF ou Excel
   */
  exportData(format: 'pdf' | 'excel') {
    const period = this.selectedPeriod();
    const stats = this.financialStats();
    const transactions = this.transactions();

    if (transactions.length === 0) {
      alert('Aucune transaction à exporter');
      return;
    }

    if (format === 'pdf') {
      // Export PDF avec rapport complet
      this.exportService.exportFinancialReportPDF(
        stats,
        transactions,
        period,
        `rapport-financier-${period}-${Date.now()}.pdf`,
      );
    } else {
      // Export Excel
      const excelData = transactions.map((t) => ({
        Date: new Date(t.date).toLocaleDateString('fr-FR'),
        Référence: t.reference,
        Description: t.description,
        Catégorie: this.getCategoryLabel(t.category),
        Type: t.type === 'REVENUE' ? 'Revenu' : 'Dépense',
        Montant: t.amount,
        Statut: 'Complété',
      }));

      this.exportService.exportToExcel(
        excelData,
        `transactions-${period}-${Date.now()}.xlsx`,
        'Transactions',
      );
    }
  }

  /**
   * Formater une date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  /**
   * Obtenir la classe CSS selon le type de transaction
   */
  getTransactionTypeClass(type: string): string {
    return type === TransactionType.REVENUE ? 'type-revenue' : 'type-expense';
  }

  /**
   * Obtenir l'icône selon la catégorie
   */
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      [TransactionCategory.MEMBERSHIP]: 'bi-person-badge',
      [TransactionCategory.EVENT]: 'bi-calendar-event',
      [TransactionCategory.DONATION]: 'bi-gift',
      [TransactionCategory.EXPENSE]: 'bi-cart',
    };
    return icons[category] || 'bi-cash';
  }

  /**
   * Obtenir le libellé de la catégorie
   */
  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      [TransactionCategory.MEMBERSHIP]: 'Cotisation',
      [TransactionCategory.EVENT]: 'Événement',
      [TransactionCategory.DONATION]: 'Don',
      [TransactionCategory.EXPENSE]: 'Dépense',
    };
    return labels[category] || category;
  }
}
