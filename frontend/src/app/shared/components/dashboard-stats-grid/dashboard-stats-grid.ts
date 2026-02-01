import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClubStats } from '../../../Core/interfaces/club-dashboard.interface';

/**
 * Dashboard Stats Grid Component
 * Presentational component for displaying 4 statistics cards
 */
@Component({
    selector: 'app-dashboard-stats-grid',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard-stats-grid.html',
    styleUrl: './dashboard-stats-grid.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardStatsGridComponent {
    // Inputs
    stats = input<ClubStats | null>(null);
    loading = input<boolean>(false);

    /**
     * Format currency in Tunisian Dinar
     */
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-TN', {
            style: 'currency',
            currency: 'TND',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
}
