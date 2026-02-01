import { Component, signal, computed, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../Core/services/payment.service';
import { PaymentSuccessCardComponent } from '../../shared/components/payments/payment-success-card/payment-success-card';
import { Loader } from '../../shared/components/loader/loader';
import { PaymentSuccessState } from '../../shared/interfaces/payment.state';


/**
 * Page de Confirmation de Paiement
 * Affiche la confirmation après un paiement réussi
 * Route: /payment/success
 */
@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, PaymentSuccessCardComponent, Loader],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSuccessComponent implements OnInit {
  // SERVICES
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);

  // STATE SIGNAL
  state = signal<PaymentSuccessState>({
    paymentId: null,
    paymentType: 'membership',
    paymentDetails: null,
    loading: true,
  });

  // COMPUTED
  currentDate = new Date(); // Constant for now

  message = computed(() => {
    if (this.state().paymentType === 'membership') {
      return {
        title: 'Paiement de cotisation confirmé !',
        description: 'Votre adhésion au club est maintenant active',
        icon: 'bi bi-check-circle-fill',
      };
    } else {
      return {
        title: 'Inscription confirmée !',
        description: 'Vous êtes maintenant inscrit à cet événement',
        icon: 'bi bi-calendar-check-fill',
      };
    }
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['paymentId'] ? +params['paymentId'] : null;
      const type = params['type'] || 'membership';

      this.state.update(s => ({
        ...s,
        paymentId: id,
        paymentType: type,
        loading: !!id // Still loading if we have ID and need details? Or just set false if only ID check?
      }));

      if (id) {
        this.loadPaymentDetails(id);
      } else {
        this.state.update(s => ({ ...s, loading: false }));
      }
    });
  }

  loadPaymentDetails(paymentId: number) {
    try {
      if ('getPaymentDetails' in this.paymentService) {
        (this.paymentService as any).getPaymentDetails(paymentId).subscribe({
          next: (details: any) => {
            this.state.update(s => ({ ...s, paymentDetails: details, loading: false }));
          },
          error: (err: any) => {
            console.error('Erreur chargement détails:', err);
            this.state.update(s => ({ ...s, loading: false }));
          }
        });
      } else {
        this.state.update(s => ({ ...s, loading: false }));
      }
    } catch (error) {
      console.error('Erreur:', error);
      this.state.update(s => ({ ...s, loading: false }));
    }
  }

  downloadReceipt() {
    const paymentId = this.state().paymentId;
    if (!paymentId) return;

    this.paymentService.downloadReceipt(paymentId).subscribe({
      next: (blob: Blob) => {
        this.paymentService.handleBlobDownload(blob, `recu-paiement-${paymentId}.pdf`);
      },
      error: (err: any) => {
        console.error('Erreur téléchargement reçu:', err);
        alert('Erreur lors du téléchargement du reçu.');
      }
    });
  }

  goToPayments() {
    this.router.navigate(['/my-payments']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
