import { Component, ChangeDetectionStrategy, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Member } from '../../../Core/interfaces/club-manager.interface';

/**
 * Role Modal Component
 * Modal for assigning roles to members
 */
@Component({
    selector: 'app-role-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './role-modal.html',
    styleUrl: './role-modal.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleModalComponent {
    // Inputs
    show = input<boolean>(false);
    member = input<Member | null>(null);

    // Two-way binding for selected role
    selectedRole = model<string>('');

    // Outputs
    close = output<void>();
    confirm = output<void>();

    onClose() {
        this.close.emit();
    }

    onConfirm() {
        this.confirm.emit();
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            this.onClose();
        }
    }
}
