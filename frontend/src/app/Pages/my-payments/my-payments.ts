import {
  Component,
  signal,
  computed,
  OnInit,
  inject,
  effect,
  ChangeDetectionStrategy,
  untracked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PaymentService } from '../../Core/services/payment.service';
import { AuthService } from '../../Core/services/auth.service';
import { PaymentStatsCardComponent } from '../../shared/components/payments/payment-stats/payment-stats-card';
import { PaymentTableComponent } from '../../shared/components/payments/payment-table/payment-table';
import { PaymentCardListComponent } from '../../shared/components/payments/payment-card-list/payment-card-list';
import { CurrencyTndPipe } from '../../shared/pipes/currency-tnd.pipe';
import { MyPaymentsState } from '../../shared/interfaces/payment.state';
import { PaginationComponent } from '../../shared/components/pagination/pagination';


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
    PaymentTableComponent,
    PaymentCardListComponent,
    CurrencyTndPipe,
    PaginationComponent,
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
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0
  });

  // COMPUTED - USER
  currentUserId = computed(() => Number(this.authService.currentUser()?.id) || 0);

  // COMPUTED - STATS
  totalSpentThisMonth = computed(() => this.state().paymentStats?.totalSpentThisMonth || 0);
  totalSpentThisYear = computed(() => this.state().paymentStats?.totalSpentThisYear || 0);
  stats = computed(() => this.state().paymentStats);



  constructor() {
    effect(() => {
      const userId = this.currentUserId();
      if (userId) {
        untracked(() => this.loadData());
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
  loadData(page = 1) {
    const userId = this.currentUserId();
    if (!userId) return;

    this.state.update(s => ({ ...s, loading: true, error: null }));

    // Charger les statistiques (on peut garder ça séparé ou le faire une seule fois)
    if (page === 1) {
      this.paymentService.getPaymentStats(userId).subscribe({
        next: (stats) => {
          this.state.update(s => ({ ...s, paymentStats: stats }));
        },
        error: (err) => {
          console.error('Erreur chargement statistiques:', err);
        }
      });
    }

    // Charger l'historique avec pagination
    this.paymentService.getPaymentHistory(userId, { page, limit: this.state().pageSize }).subscribe({
      next: (response: any) => {
        this.state.update(s => ({
          ...s,
          payments: response.data || [],
          currentPage: response.page || page,
          totalPages: response.totalPages || 1,
          totalItems: response.total || 0,
          loading: false
        }));
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

  onPageChange(page: number) {
    this.loadData(page);
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
