import { Component, signal, computed, OnInit, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PaymentService } from '../../Core/services/payment.service';
import { AuthService } from '../../Core/services/auth.service';
import { PaymentStatsCardComponent } from '../../shared/components/payments/payment-stats/payment-stats-card';
import { PaymentFilterTabsComponent } from '../../shared/components/payments/payment-filter-tabs/payment-filter-tabs';
import { PaymentTableComponent } from '../../shared/components/payments/payment-table/payment-table';
import { PaymentCardListComponent } from '../../shared/components/payments/payment-card-list/payment-card-list';
import { CurrencyTndPipe } from '../../shared/pipes/currency-tnd.pipe';
import { MyPaymentsState } from '../../shared/interfaces/payment.state';


/**
 * PAGE: Mes Paiements
 * Affiche l'historique des paiements (adhésions et événements)
 * Devise: Dinars Tunisiens (TND)
 */
@Component({
  selector: 'app-my-payments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PaymentStatsCardComponent,
    PaymentFilterTabsComponent,
    PaymentTableComponent,
    PaymentCardListComponent,
    CurrencyTndPipe,
  ],
  templateUrl: './my-payments.html',
  styleUrl: './my-payments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyPaymentsComponent implements OnInit {
  // SERVICES
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // STATE SIGNAL
  state = signal<MyPaymentsState>({
    loading: false,
    error: null,
    downloading: false,
    payments: [],
    paymentStats: null,
    filterStatus: null,
  });

  // COMPUTED - USER
  currentUserId = computed(() => Number(this.authService.currentUser()?.id) || 0);

  // COMPUTED - STATS
  totalSpentThisMonth = computed(() => this.state().paymentStats?.totalSpentThisMonth || 0);
  totalSpentThisYear = computed(() => this.state().paymentStats?.totalSpentThisYear || 0);
  stats = computed(() => this.state().paymentStats);

  // COMPUTED - FILTERING
  filteredPayments = computed(() => {
    const { payments, filterStatus } = this.state();
    if (!filterStatus) return payments;
    return payments.filter(p => p.status === filterStatus);
  });

  constructor() {
    effect(() => {
      const userId = this.currentUserId();
      if (userId) {
        this.loadData();
      }
    });
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
    // loadData triggered by effect
  }

  /** Charger les données */
  loadData() {
    const userId = this.currentUserId();
    if (!userId) return;

    this.state.update(s => ({ ...s, loading: true, error: null }));

    // Charger les statistiques
    this.paymentService.getPaymentStats(userId).subscribe({
      next: (stats) => {
        this.state.update(s => ({ ...s, paymentStats: stats }));
      },
      error: (err) => {
        console.error('Erreur chargement statistiques:', err);
      }
    });

    // Charger l'historique
    this.paymentService.getPaymentHistory(userId, { page: 1, limit: 50 }).subscribe({
      next: (response) => {
        const paymentsList = Array.isArray(response) ? response : (response.data || response);
        this.state.update(s => ({ ...s, payments: paymentsList, loading: false }));
      },
      error: (err) => {
        console.error('Erreur chargement paiements:', err);
        this.state.update(s => ({
          ...s,
          loading: false,
          error: 'Impossible de charger vos paiements'
        }));
      }
    });
  }

  filterByStatus(status: string | null) {
    this.state.update(s => ({ ...s, filterStatus: status }));
  }


  downloadReceipt(paymentId: number) {
    this.state.update(s => ({ ...s, downloading: true }));

    this.paymentService.downloadReceipt(paymentId).subscribe({
      next: (blob: Blob) => {
        this.paymentService.handleBlobDownload(blob, `recu-paiement-${paymentId}.pdf`);
        this.state.update(s => ({ ...s, downloading: false }));
      },
      error: (err: any) => {
        console.error('Erreur téléchargement reçu:', err);
        this.state.update(s => ({
          ...s,
          downloading: false,
          error: 'Erreur lors du téléchargement du reçu. Veuillez réessayer.'
        }));
      }
    });
  }

}
