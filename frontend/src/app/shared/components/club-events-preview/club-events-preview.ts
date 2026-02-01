import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClubEvent } from '../../../shared/interfaces/club-management-models.interface';

/**
 * Club Events Preview Component
 * Displays list of upcoming events with empty state
 */
@Component({
    selector: 'app-club-events-preview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './club-events-preview.html',
    styleUrl: './club-events-preview.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubEventsPreviewComponent {
    // Inputs
    events = input<ClubEvent[]>([]);
    clubId = input<number | null>(null);

    // Outputs
    viewAllClick = output<void>();

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

    onViewAll() {
        this.viewAllClick.emit();
    }
}
