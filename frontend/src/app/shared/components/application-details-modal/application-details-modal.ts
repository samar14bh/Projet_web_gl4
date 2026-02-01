import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Application } from '../../../Core/interfaces/club-manager.interface';

/**
 * Application Details Modal Component
 * Detailed view of membership applications with approve/reject actions
 */
@Component({
    selector: 'app-application-details-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './application-details-modal.html',
    styleUrl: './application-details-modal.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationDetailsModalComponent {
    // Inputs
    show = input<boolean>(false);
    application = input<Application | null>(null);

    // Outputs
    close = output<void>();
    approve = output<number>();
    reject = output<number>();

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

    onClose() {
        this.close.emit();
    }

    onApprove() {
        const app = this.application();
        if (app) {
            this.approve.emit(app.id);
        }
    }

    onReject() {
        const app = this.application();
        if (app) {
            this.reject.emit(app.id);
        }
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            this.onClose();
        }
    }
}
