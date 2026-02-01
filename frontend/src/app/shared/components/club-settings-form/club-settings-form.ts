import { Component, ChangeDetectionStrategy, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Club Settings Form Component
 * Form for managing club settings with toggles and inputs
 */
@Component({
    selector: 'app-club-settings-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './club-settings-form.html',
    styleUrl: './club-settings-form.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClubSettingsFormComponent {
    // Two-way binding with model signals
    isPublic = model<boolean>(false);
    membershipFee = model<number>(0);
    approvalRequired = model<boolean>(true);

    // Inputs
    saving = input<boolean>(false);

    // Outputs
    saveClick = output<void>();

    onSubmit() {
        this.saveClick.emit();
    }
}
