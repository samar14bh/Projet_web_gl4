import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Members Stats Grid Component
 * Displays statistics cards based on active tab (members or applications)
 */
@Component({
    selector: 'app-members-stats-grid',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './members-stats-grid.html',
    styleUrl: './members-stats-grid.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembersStatsGridComponent {
    // Inputs
    activeTab = input<string>('members');
    totalMembers = input<number>(0);
    bureauMembers = input<number>(0);
    regularMembers = input<number>(0);
    pendingCount = input<number>(0);
    approvedCount = input<number>(0);
    rejectedCount = input<number>(0);
}
