import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Club Stats Simple Grid Component
 * Displays 4 simple statistics cards for manage-club page
 */
@Component({
    selector: 'app-club-stats-simple-grid',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './club-stats-simple-grid.html',
    styleUrl: './club-stats-simple-grid.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubStatsSimpleGridComponent {
    // Inputs
    totalMembers = input<number>(0);
    totalEvents = input<number>(0);
    pendingRequests = input<number>(0);
    monthlyRevenue = input<number>(0);

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
