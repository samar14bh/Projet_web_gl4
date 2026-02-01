import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  input,
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
import { ToastService } from '../../../Core/services/toast.service';

/**
 * PAGE 16 : Finances du club
 * Gestion et visualisation des finances du club
 * Optimisé Angular 20 avec Signals et OnPush
 */
@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    TransactionForm,
  ],
  templateUrl: './finances.html',
  styleUrl: './finances.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancesComponent {
  // ========== SERVICES ==========
  private readonly financeService = inject(FinanceService);
  private readonly exportService = inject(ExportService);
  private readonly toastService = inject(ToastService);

  // ✅ Récupérer le clubId depuis l'URL (paramètre de route)
  clubId = input<number, string | number>(0, {
    transform: (val: string | number) => Number(val),
  });

  // ========== SIGNALS D'ÉTAT ==========
  readonly selectedPeriod = signal<'month' | 'quarter' | 'year' | 'all'>('month');
  readonly selectedTransactionType = signal<TransactionType | 'all'>('all');
  readonly selectedCategory = signal<TransactionCategory | 'all'>('all');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly isExpenseModalOpen = signal(false);
  readonly isDetailsModalOpen = signal(false);
  readonly selectedTransaction = signal<Transaction | null>(null);

  // ========== COMPUTED FILTERS ==========
  readonly filters = computed<TransactionFilters>(() => ({
    period: this.selectedPeriod(),
    type:
      this.selectedTransactionType() !== 'all'
        ? this.selectedTransactionType()
        : undefined,
    category:
      this.selectedCategory() !== 'all' ? this.selectedCategory() : undefined,
    search: this.searchQuery() || undefined,
    page: this.currentPage(),
    limit: this.pageSize(),
    clubId: this.clubId(), // ✅ Filtrer par club
  }));

  // ========== RESOURCES (rxResource) ==========

  /**
   * Resource pour les transactions avec filtres réactifs
   */
  readonly transactionsResource = rxResource({
    params: this.filters,
    stream: ({ params }) => this.financeService.getTransactions(params),
  });

  /**
   * Resource pour les statistiques financières
   */
  readonly statsResource = rxResource({
    params: computed(() => ({
      clubId: this.clubId(),
      period: this.selectedPeriod(),
    })),
    stream: ({ params }) =>
      this.financeService.getFinancialStats(params.clubId, params.period),
  });

  /**
   * Resource pour les données mensuelles du graphique
   */
  readonly chartResource = rxResource({
    params: computed(() => ({
      clubId: this.clubId(),
      months: 6,
    })),
    stream: ({ params }) =>
      this.financeService.getMonthlyData(params.clubId, params.months),
  });

  // ========== COMPUTED SIGNALS DÉRIVÉS ==========
  readonly transactions = computed(
    () => this.transactionsResource.value()?.data ?? [],
  );
  readonly totalTransactions = computed(
    () => this.transactionsResource.value()?.total ?? 0,
  );
  readonly totalPages = computed(
    () => this.transactionsResource.value()?.totalPages ?? 0,
  );
  readonly isLoading = computed(() => this.transactionsResource.isLoading());
  readonly hasError = computed(() => !!this.transactionsResource.error());

  readonly financialStats = computed(
    () =>
      this.statsResource.value() ?? {
        totalRevenue: 0,
        totalExpenses: 0,
        balance: 0,
        membershipRevenue: 0,
        eventRevenue: 0,
        donationRevenue: 0,
        pendingPayments: 0,
      },
  );

  readonly chartData = computed(() => this.chartResource.value() ?? []);
  readonly isStatsLoading = computed(() => this.statsResource.isLoading());
  readonly isChartLoading = computed(() => this.chartResource.isLoading());

  // ========== ÉNUMÉRATIONS POUR LE TEMPLATE ==========
  readonly TransactionType = TransactionType;
  readonly TransactionCategory = TransactionCategory;

  // ========== TRACKBY FUNCTIONS ==========
  readonly trackByTransactionId = (_index: number, transaction: Transaction) =>
    transaction.id;
  readonly trackByMonth = (_index: number, data: any) => data.month;

  // ========== MÉTHODES UTILITAIRES (PURES) ==========

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getTransactionTypeClass(type: string): string {
    return type === TransactionType.REVENUE ? 'type-revenue' : 'type-expense';
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      [TransactionCategory.MEMBERSHIP]: 'bi-person-badge',
      [TransactionCategory.EVENT]: 'bi-calendar-event',
      [TransactionCategory.DONATION]: 'bi-gift',
      [TransactionCategory.EXPENSE]: 'bi-cart',
    };
    return icons[category] || 'bi-cash';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      [TransactionCategory.MEMBERSHIP]: 'Cotisation',
      [TransactionCategory.EVENT]: 'Événement',
      [TransactionCategory.DONATION]: 'Don',
      [TransactionCategory.EXPENSE]: 'Dépense',
    };
    return labels[category] || category;
  }

  // ========== ACTIONS ==========

  changePeriod(period: 'month' | 'quarter' | 'year' | 'all'): void {
    this.selectedPeriod.set(period);
    this.currentPage.set(1);
  }

  changeTransactionType(type: TransactionType | 'all'): void {
    this.selectedTransactionType.set(type);
    this.currentPage.set(1);
  }

  changeCategory(category: TransactionCategory | 'all'): void {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  reloadData(): void {
    this.transactionsResource.reload();
    this.statsResource.reload();
    this.chartResource.reload();
  }

  openExpenseModal(): void {
    this.isExpenseModalOpen.set(true);
  }

  closeExpenseModal(): void {
    this.isExpenseModalOpen.set(false);
  }

  onTransactionSuccess(): void {
    this.closeExpenseModal();
    this.reloadData();
    this.toastService.success('Transaction ajoutée avec succès !');
  }

  openDetailsModal(transaction: Transaction): void {
    this.selectedTransaction.set(transaction);
    this.isDetailsModalOpen.set(true);
  }

  closeDetailsModal(): void {
    this.selectedTransaction.set(null);
    this.isDetailsModalOpen.set(false);
  }

  exportData(format: 'pdf' | 'excel'): void {
    const period = this.selectedPeriod();
    const stats = this.financialStats();
    const transactions = this.transactions();

    if (transactions.length === 0) {
      this.toastService.warning('Aucune transaction à exporter');
      return;
    }

    try {
      if (format === 'pdf') {
        this.exportService.exportFinancialReportPDF(
          stats,
          transactions,
          period,
          `rapport-financier-${period}-${Date.now()}.pdf`,
        );
        this.toastService.success('Rapport PDF généré avec succès !');
      } else {
        const excelData = transactions.map((t) => ({
          Date: this.formatDate(t.date),
          Référence: t.reference,
          Description: t.description,
          Catégorie: this.getCategoryLabel(t.category),
          Type: t.type === TransactionType.REVENUE ? 'Revenu' : 'Dépense',
          Montant: t.amount,
          Statut: 'Complété',
        }));

        this.exportService.exportToExcel(
          excelData,
          `transactions-${period}-${Date.now()}.xlsx`,
          'Transactions',
        );
        this.toastService.success('Export Excel généré avec succès !');
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      this.toastService.error('Erreur lors de l\'export des données');
    }
  }
}
