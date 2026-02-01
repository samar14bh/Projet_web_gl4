import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Member } from '../../../shared/interfaces/dashboard-models.interface';

/**
 * Recent Members List Component
 * Presentational component for displaying recently joined members
 */
@Component({
    selector: 'app-recent-members-list',
    standalone: true,
    imports: [CommonModule, DatePipe],
    templateUrl: './recent-members-list.html',
    styleUrl: './recent-members-list.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentMembersListComponent {
    // Inputs
    members = input<Member[]>([]);
    maxDisplay = input<number>(5);

    // Outputs
    viewAll = output<void>();

    // Computed
    displayedMembers = computed(() => this.members().slice(0, this.maxDisplay()));


    onViewAll() {
        this.viewAll.emit();
    }
}
