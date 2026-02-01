import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Payment Stats Card - Dumb Component
 * Displays a statistic value with icon and label
 */
@Component({
    selector: 'app-payment-stats-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-stats-card.html',
    styleUrl: './payment-stats-card.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStatsCardComponent {
    label = input.required<string>();
    value = input.required<string | number>();
    icon = input.required<string>();
    variant = input<'primary' | 'secondary' | 'success' | 'accent'>('primary');
}
