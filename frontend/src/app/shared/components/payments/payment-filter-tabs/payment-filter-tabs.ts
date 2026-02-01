import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Payment Filter Tabs - Dumb Component
 * Filter buttons for payment status
 */
@Component({
    selector: 'app-payment-filter-tabs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-filter-tabs.html',
    styleUrl: './payment-filter-tabs.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFilterTabsComponent {
    activeFilter = input<string | null>(null);
    filterChange = output<string | null>();

    onFilterClick(status: string | null) {
        this.filterChange.emit(status);
    }
}
