import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Dashboard Hero Component
 * Presentational component for displaying club header with logo, name, and quick stats
 */
@Component({
    selector: 'app-dashboard-hero',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard-hero.html',
    styleUrl: './dashboard-hero.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHeroComponent {
    // Inputs
    clubName = input<string>('Mon Club');
    clubLogo = input<string>('');
    clubCoverImage = input<string>('');
    totalMembers = input<number>(0);
    totalEvents = input<number | undefined>(undefined);
    pendingRequests = input<number>(0);
    showBackButton = input<boolean>(false);

    // Outputs
    backClick = output<void>();

    onBackClick() {
        this.backClick.emit();
    }
}
