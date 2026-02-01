import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Notification Toast Component
 * Displays success/error notifications with auto-hide
 */
@Component({
    selector: 'app-notification-toast',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-toast.html',
    styleUrl: './notification-toast.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationToastComponent {
    // Inputs
    type = input<'success' | 'error' | null>(null);
    message = input<string>('');

    // Outputs
    closeClick = output<void>();

    onClose() {
        this.closeClick.emit();
    }
}
