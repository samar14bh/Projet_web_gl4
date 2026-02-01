import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Payment } from '../payment-table/payment-table';

/**
 * Payment Card List - Dumb Component
 * Mobile card view for payments list
 */
@Component({
    selector: 'app-payment-card-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-card-list.html',
    styleUrl: './payment-card-list.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCardListComponent {
    payments = input.required<Payment[]>();
    downloading = input<boolean>(false);
    downloadReceipt = output<number>();
    viewEvent = output<number>();

    onDownloadReceipt(paymentId: number) {
        this.downloadReceipt.emit(paymentId);
    }

    getStatusBadgeClass(status: string): string {
        const classes: Record<string, string> = {
            'CONFIRMED': 'status-badge-mobile completed',
            'APPROVED': 'status-badge-mobile completed',
            'PENDING': 'status-badge-mobile pending',
            'REJECTED': 'status-badge-mobile rejected',
        };
        return classes[status] || 'status-badge-mobile';
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'CONFIRMED': 'Confirmé',
            'APPROVED': 'Approuvé',
            'PENDING': 'En attente',
            'REJECTED': 'Rejeté',
        };
        return labels[status] || status;
    }

    getPaymentTypeLabel(type: string): string {
        return type === 'MEMBERSHIP' ? 'Cotisation' : 'Événement';
    }

    formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        } catch (e) {
            return dateString;
        }
    }

    formatCurrency(amount: number | null | undefined): string {
        if (!amount) return '0.00 TND';
        try {
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            return new Intl.NumberFormat('fr-TN', {
                style: 'currency',
                currency: 'TND',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numAmount);
        } catch (e) {
            return `${amount} TND`;
        }
    }
}
