import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberService } from '../../../Core/services/member.service';
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
    // Signals
    activeTab = signal<string>('history');
    currentUserId = signal(1); // TODO: Get from auth service

    // Tab configuration
    tabs = signal<TabItem[]>([
        { id: 'history', label: 'Historique des paiements', icon: 'clock-history' },
        { id: 'methods', label: 'Moyens de paiement', icon: 'credit-card' },
    ]);

    // Computed values
    payments = computed(() => this.memberService.payments());
    paymentStats = computed(() => this.memberService.paymentStats());

    // Computed aliases for template compatibility
    stats = computed(() => this.paymentStats());
    totalSpentThisMonth = computed(() => this.paymentStats()?.totalSpentThisMonth || 0);
    totalSpentThisYear = computed(() => this.paymentStats()?.totalSpentThisYear || 0);

    loading = computed(() => this.memberService.loading());

    constructor(public memberService: MemberService) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        const userId = this.currentUserId();

        // Load payment statistics
        this.memberService.getPaymentStats(userId).subscribe();

        // Load payment history
        this.memberService.getPaymentHistory(userId, {
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
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    }
}
