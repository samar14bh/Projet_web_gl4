import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Member } from '../../../Core/interfaces/club-manager.interface';
import { PaginationComponent } from '../pagination/pagination';

/**
 * Members List Component
 * Displays searchable grid of members with pagination
 */
@Component({
    selector: 'app-members-list',
    standalone: true,
    imports: [CommonModule, PaginationComponent],
    templateUrl: './members-list.html',
    styleUrl: './members-list.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembersListComponent {
    // Inputs
    members = input<Member[]>([]);
    loading = input<boolean>(false);
    searchQuery = input<string>('');
    currentPage = input<number>(1);
    totalPages = input<number>(1);
    emptyMessage = input<string>('Aucun membre pour le moment');
    title = input<string>('Tous les Membres');
    canEditRole = input<boolean>(true);
    canRemoveMember = input<boolean>(true);

    // Outputs
    searchChange = output<string>();
    editRole = output<Member>();
    removeMember = output<Member>();
    pageChange = output<number>();

    /**
     * Format date for display
     */
    formatDate(dateString: string | Date | null | undefined): string {
        try {
            if (!dateString) return '-';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString as string;
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return '-';
        }
    }

    getRoleBadgeClass(role: string | undefined): string {
        if (!role || role.toUpperCase() === 'MEMBER') return 'badge-default';
        const normalizedRole = role.toUpperCase().replace('_', '-');
        const classes: Record<string, string> = {
            PRESIDENT: 'badge-primary',
            'VICE-PRESIDENT': 'badge-primary',
            TREASURER: 'badge-success',
            SECRETARY: 'badge-warning',
            RH: 'badge-info'
        };
        return classes[normalizedRole] || 'badge-default';
    }

    getRoleLabel(role: string | undefined): string {
        if (!role || role.toUpperCase() === 'MEMBER') return 'Membre';
        const normalizedRole = role.toUpperCase().replace('_', '-');
        const labels: Record<string, string> = {
            PRESIDENT: 'Président',
            TREASURER: 'Trésorier',
            SECRETARY: 'Secrétaire',
            RH: 'Ressources Humaines'
        };
        return labels[normalizedRole] || role;
    }

    onSearchInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.searchChange.emit(value);
    }

    onEditRole(member: Member) {
        this.editRole.emit(member);
    }

    onRemove(member: Member) {
        this.removeMember.emit(member);
    }

    onPageChange(page: number) {
        this.pageChange.emit(page);
    }
}
