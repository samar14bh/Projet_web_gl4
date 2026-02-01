import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Club Info Section Component
 * Displays club information with category, description, and detail cards
 */
@Component({
    selector: 'app-club-info-section',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './club-info-section.html',
    styleUrl: './club-info-section.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubInfoSectionComponent {
    // Inputs
    categoryName = input<string>('');
    categoryIcon = input<string>('');
    categoryColor = input<string>('#6B7280');
    description = input<string>('');
    isPublic = input<boolean>(false);
    membershipFee = input<number>(0);
    approvalRequired = input<boolean>(true);
    isActive = input<boolean>(true);
    creationDate = input<string>('');
    email = input<string>('');

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

    /**
     * Format date for display
     */
    formatDate(dateString: string): string {
        try {
            if (!dateString) return '-';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return dateString || '-';
        }
    }
}
