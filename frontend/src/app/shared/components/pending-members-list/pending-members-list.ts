import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Member } from '../../../shared/interfaces/dashboard-models.interface';

/**
 * Pending Members List Component
 * Presentational component for displaying and managing pending member requests
 */
@Component({
    selector: 'app-pending-members-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pending-members-list.html',
    styleUrl: './pending-members-list.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingMembersListComponent {
    // Inputs
    members = input<Member[]>([]);
    maxDisplay = input<number>(5);
    canManage = input<boolean>(true);

    // Outputs
    approveMember = output<number>();
    rejectMember = output<number>();
    viewAll = output<void>();

    // Computed
    displayedMembers = computed(() => this.members().slice(0, this.maxDisplay()));

    // Event handlers
    onApprove(memberId: number) {
        this.approveMember.emit(memberId);
    }

    onReject(memberId: number) {
        this.rejectMember.emit(memberId);
    }

    onViewAll() {
        this.viewAll.emit();
    }
}
