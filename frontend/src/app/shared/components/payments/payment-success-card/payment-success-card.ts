import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

/**
 * Payment Success Card - Dumb Component
 * Displays success confirmation after payment
 */
@Component({
    selector: 'app-payment-success-card',
    standalone: true,
    imports: [CommonModule, DatePipe],
    templateUrl: './payment-success-card.html',
    styleUrl: './payment-success-card.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSuccessCardComponent {
    paymentId = input.required<number>();
    paymentType = input.required<'membership' | 'event'>();
    paymentDate = input.required<Date | string>();
    downloading = input<boolean>(false);

    // Dynamic message inputs
    title = input<string>('Paiement réussi !');
    description = input<string>('Votre paiement a été traité avec succès');
    icon = input<string>('bi bi-check-circle-fill');


    downloadReceipt = output<void>();
    goToPayments = output<void>();
    goHome = output<void>();

    onDownloadReceipt() {
        this.downloadReceipt.emit();
    }

    onGoToPayments() {
        this.goToPayments.emit();
    }

    onGoHome() {
        this.goHome.emit();
    }

    getPaymentTypeLabel(): string {
        return this.paymentType() === 'membership' ? 'Cotisation' : 'Inscription événement';
    }
}
