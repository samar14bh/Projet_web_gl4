import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../../shared/interfaces/dashboard-models.interface';

/**
 * Upcoming Events List Component
 * Presentational component for displaying upcoming club events
 */
@Component({
    selector: 'app-upcoming-events-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './upcoming-events-list.html',
    styleUrl: './upcoming-events-list.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingEventsListComponent {
    // Inputs
    events = input<Event[]>([]);
    maxDisplay = input<number>(5);

    // Outputs
    viewEvent = output<number>();
    viewAll = output<void>();

    // Computed
    displayedEvents = computed(() => this.events().slice(0, this.maxDisplay()));

    /**
     * Format date for display
     */
    formatDate(dateString: string | null | undefined): string {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // Event handlers
    onViewEvent(eventId: number) {
        this.viewEvent.emit(eventId);
    }

    onViewAll() {
        this.viewAll.emit();
    }
}
