import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../Core/services/payment.service';
import { AuthService } from '../../../Core/services/auth.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation';
import { TabItem } from '../../../shared/interfaces/components.interface';

/**
 * PAGE 10: My Payments
 * Displays payment history, statistics, and payment methods
 */
@Component({
    selector: 'app-my-payments',
    standalone: true,
    imports: [CommonModule, StatCardComponent, TabNavigationComponent],
    templateUrl: './my-payments.html',
    styleUrl: './my-payments.css',
})
export class MyPaymentsComponent implements OnInit {
    // Services
    private paymentService = inject(PaymentService);
    private authService = inject(AuthService);

    // Signals
    activeTab = signal<string>('history');
    currentUserId = computed(() => Number(this.authService.currentUser()?.id) || 0);

    // Tab configuration
    tabs = signal<TabItem[]>([
        { id: 'history', label: 'Historique des paiements', icon: 'clock-history' },
        { id: 'methods', label: 'Moyens de paiement', icon: 'credit-card' },
    ]);

    // Computed values
    payments = computed(() => this.paymentService.payments());
    paymentStats = computed(() => this.paymentService.stats());

    // Computed aliases for template compatibility
    stats = computed(() => this.paymentStats());
    totalSpentThisMonth = computed(() => this.paymentStats()?.totalSpentThisMonth || 0);
    totalSpentThisYear = computed(() => this.paymentStats()?.totalSpentThisYear || 0);

    loading = computed(() => this.paymentService.loading());

    constructor() { }

    ngOnInit() {
        if (this.authService.isAuthenticated()) {
            this.loadData();
        }
    }

    loadData() {
        const userId = this.currentUserId();
        if (!userId) return;

        // Load payment statistics
        this.paymentService.getPaymentStats(userId).subscribe();

        // Load payment history
        this.paymentService.getPaymentHistory(userId, {
            page: 1,
            limit: 20,
        }).subscribe();
    }

    onTabChange(tabId: string) {
        this.activeTab.set(tabId);
    }

    getStatusBadgeClass(status: string): string {
        const classes: Record<string, string> = {
            CONFIRMED: 'badge-success',
            PENDING: 'badge-warning',
            REJECTED: 'badge-danger',
            APPROVED: 'badge-success',
        };
        return classes[status] || 'badge-secondary';
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            CONFIRMED: 'Confirmé',
            PENDING: 'En attente',
            REJECTED: 'Rejeté',
            APPROVED: 'Approuvé',
        };
        return labels[status] || status;
    }

    getPaymentTypeLabel(type: string): string {
        return type === 'membership' ? 'Cotisation' : 'Événement';
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-TN', {
            style: 'currency',
            currency: 'TND',
            minimumFractionDigits: 2
        }).format(amount);
    }

    downloadReceipt(paymentId: number) {
        this.paymentService.downloadReceipt(paymentId).subscribe({
            next: (blob: Blob) => {
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `recu-${paymentId}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: (err: any) => {
                console.error('Error downloading receipt:', err);
                alert('Erreur lors du téléchargement du reçu');
            }
        });
    }
}
