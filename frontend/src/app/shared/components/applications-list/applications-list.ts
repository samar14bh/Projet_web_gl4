import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Application } from '../../../Core/interfaces/club-manager.interface';
import { StatusFilter } from '../../interfaces/member-models.interface';
import { PaginationComponent } from '../pagination/pagination';

/**
 * Applications List Component
 * Displays filterable grid of membership applications with pagination
 */
@Component({
    selector: 'app-applications-list',
    standalone: true,
    imports: [CommonModule, PaginationComponent],
    templateUrl: './applications-list.html',
    styleUrl: './applications-list.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsListComponent {
    // Inputs
    applications = input<Application[]>([]);
    statusFilters = input<StatusFilter[]>([]);
    activeStatus = input<string>('PENDING');
    loading = input<boolean>(false);
    currentPage = input<number>(1);
    totalPages = input<number>(1);
    canManage = input<boolean>(true);

    // Outputs
    statusFilterChange = output<string>();
    viewDetails = output<Application>();
    approve = output<number>();
    reject = output<number>();
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

    getStatusBadgeClass(status: string | undefined): string {
        if (!status) return 'badge-default';
        const classes: Record<string, string> = {
            PENDING: 'badge-warning',
            APPROVED: 'badge-success',
            CONFIRMED: 'badge-primary',
            REJECTED: 'badge-danger'
        };
        return classes[status] || 'badge-default';
    }

    getStatusLabel(status: string | undefined): string {
        if (!status) return 'Inconnu';
        const labels: Record<string, string> = {
            PENDING: 'En Attente',
            APPROVED: 'Approuvée',
            CONFIRMED: 'Confirmée',
            REJECTED: 'Rejetée'
        };
        return labels[status] || status;
    }

    isApplicationPending(status: string | undefined): boolean {
        return status === 'PENDING';
    }

    onStatusFilterChange(status: string) {
        this.statusFilterChange.emit(status);
    }

    onViewDetails(app: Application) {
        this.viewDetails.emit(app);
    }

    onApprove(appId: number) {
        this.approve.emit(appId);
    }

    onReject(appId: number) {
        this.reject.emit(appId);
    }

    onPageChange(page: number) {
        this.pageChange.emit(page);
    }
}
