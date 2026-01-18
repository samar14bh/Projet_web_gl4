import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../../Core/services/payment.service';

/**
 * Payment Success Page
 * Confirmation page after successful payment
 */
@Component({
    selector: 'app-payment-success',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './payment-success.html',
    styleUrl: './payment-success.css',
})
export class PaymentSuccessComponent implements OnInit {
    paymentId = signal<number | null>(null);
    paymentType = signal<'membership' | 'event'>('membership');
    paymentDetails = signal<any>(null);
    loading = signal(true);
    currentDate = new Date(); // Pour utilisation dans le template

    message = computed(() => {
        if (this.paymentType() === 'membership') {
            return {
                title: 'Paiement de cotisation confirmé !',
                description: 'Votre adhésion au club est maintenant active',
                icon: 'bi-check-circle-fill',
            };
        } else {
            return {
                title: 'Inscription confirmée !',
                description: 'Vous êtes maintenant inscrit à cet événement',
                icon: 'bi-calendar-check-fill',
            };
        }
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private paymentService: PaymentService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['paymentId']) {
                this.paymentId.set(+params['paymentId']);
            }
            if (params['type']) {
                this.paymentType.set(params['type']);
            }
            this.loading.set(false);
        });
    }

    downloadReceipt() {
        const paymentId = this.paymentId();
        if (!paymentId) return;

        this.paymentService.downloadReceipt(paymentId).subscribe({
            next: (blob) => {
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `recu-${paymentId}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: (err) => {
                console.error('Error downloading receipt:', err);
                alert('Erreur lors du téléchargement du reçu');
            }
        });
    }

    goToPayments() {
        this.router.navigate(['/member/my-payments']);
    }

    goToHome() {
        this.router.navigate(['/']);
    }
}
