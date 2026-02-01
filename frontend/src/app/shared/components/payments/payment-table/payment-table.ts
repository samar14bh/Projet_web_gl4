import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Payment {
    id: number;
    date: string;
    amount: number;
    status: string;
    type: string;
    membership?: {
        club: {
            name: string;
        };
    };
    event?: {
        id: number;
        title: string;
    };
}

/**
 * Payment Table - Dumb Component
 * Desktop table view for payments list
 */
@Component({
    selector: 'app-payment-table',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-table.html',
    styleUrl: './payment-table.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentTableComponent {
    payments = input.required<Payment[]>();
    downloading = input<boolean>(false);
    downloadReceipt = output<number>();

    onDownloadReceipt(paymentId: number) {
        this.downloadReceipt.emit(paymentId);
    }


    getStatusBadgeClass(status: string): string {
        const classes: Record<string, string> = {
            'CONFIRMED': 'status-badge completed',
            'APPROVED': 'status-badge completed',
            'PENDING': 'status-badge pending',
            'REJECTED': 'status-badge failed',
        };
        return classes[status] || 'status-badge';
    }

    getStatusIcon(status: string): string {
        const icons: Record<string, string> = {
            'CONFIRMED': 'bi bi-check-circle-fill',
            'APPROVED': 'bi bi-check-circle-fill',
            'PENDING': 'bi bi-hourglass-split',
            'REJECTED': 'bi bi-x-circle-fill',
        };
        return icons[status] || 'bi bi-question-circle';
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

    getPaymentTypeClass(type: string): string {
        return type === 'MEMBERSHIP' ? 'payment-type-badge membership' : 'payment-type-badge event';
    }

    getPaymentTypeIcon(type: string): string {
        return type === 'MEMBERSHIP' ? 'bi bi-people-fill' : 'bi bi-calendar-event-fill';
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
