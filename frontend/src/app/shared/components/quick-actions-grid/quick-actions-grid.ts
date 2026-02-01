import { Component, ChangeDetectionStrategy, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Quick Actions Grid Component
 * Presentational component for quick action buttons
 */
@Component({
    selector: 'app-quick-actions-grid',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './quick-actions-grid.html',
    styleUrl: './quick-actions-grid.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickActionsGridComponent {
    // Outputs
    createEvent = output<void>();
    manageMembers = output<void>();
    manageClub = output<void>();
    viewFinances = output<void>();
    canManageClub = input<boolean>(true);
    canCreateEvent = input<boolean>(true);
    canViewFinances = input<boolean>(true);

    // Event handlers
    onCreateEvent() {
        this.createEvent.emit();
    }

    onManageMembers() {
        this.manageMembers.emit();
    }

    onManageClub() {
        this.manageClub.emit();
    }

    onViewFinances() {
        this.viewFinances.emit();
    }
}
