import { Component, signal, computed, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { ClubSelectorComponent } from '../components/club-selector/club-selector';
import { ClubContextService } from '../../../Core/services/club-context.service';

/**
 * PAGE 12: Club Manager Dashboard
 * Dashboard for club managers with statistics and quick actions
 */
@Component({
    selector: 'app-club-manager-dashboard',
    standalone: true,
    imports: [CommonModule, StatCardComponent, ClubSelectorComponent],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class ClubManagerDashboardComponent {
    private clubContext = inject(ClubContextService);
    public clubManagerService = inject(ClubManagerService);

    // Signals
    currentClubId = computed(() => this.clubContext.currentClubId());

    // Computed values
    stats = computed(() => this.clubManagerService.clubStats());
    pendingMembers = computed(() => this.clubManagerService.pendingMembers());
    displayedPendingMembers = computed(() => this.pendingMembers().slice(0, 3));
    loading = computed(() => this.clubManagerService.loading());

    constructor() {
        // Automatically load data when club changes
        effect(() => {
            if (this.currentClubId()) {
                this.loadDashboardData();
            }
        });
    }

    loadDashboardData() {
        const clubId = this.currentClubId();
        if (!clubId) return;

        // Load club detailed statistics
        this.clubManagerService.getClubDetailedStats(clubId).subscribe();

        // Load pending requests
        this.clubManagerService.getMembers(clubId, 'PENDING').subscribe();
    }

    approveMember(membershipId: number) {
        const clubId = this.currentClubId();
        if (!clubId) return;

        this.clubManagerService.updateMemberStatus(membershipId, 'APPROVED').subscribe({
            next: () => {
                // Reload pending requests
                this.clubManagerService.getMembers(clubId, 'PENDING').subscribe();
            },
        });
    }

    rejectMember(membershipId: number) {
        const clubId = this.currentClubId();
        if (!clubId) return;

        this.clubManagerService.updateMemberStatus(membershipId, 'REJECTED').subscribe({
            next: () => {
                // Reload pending requests
                this.clubManagerService.getMembers(clubId, 'PENDING').subscribe();
            },
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }
}
