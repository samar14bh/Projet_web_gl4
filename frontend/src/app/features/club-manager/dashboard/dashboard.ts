import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';

/**
 * PAGE 12: Club Manager Dashboard
 * Dashboard for club managers with statistics and quick actions
 */
@Component({
    selector: 'app-club-manager-dashboard',
    standalone: true,
    imports: [CommonModule, StatCardComponent],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css',
})
export class ClubManagerDashboardComponent implements OnInit {
    // Signals
    currentClubId = signal(1); // TODO: Get from auth/context service

    // Computed values
    stats = computed(() => this.clubManagerService.clubStats());
    pendingMembers = computed(() => this.clubManagerService.pendingMembers());
    displayedPendingMembers = computed(() => this.pendingMembers().slice(0, 3));
    loading = computed(() => this.clubManagerService.loading());

    constructor(public clubManagerService: ClubManagerService) { }

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        const clubId = this.currentClubId();

        // Load club detailed statistics
        this.clubManagerService.getClubDetailedStats(clubId).subscribe();

        // Load pending requests
        this.clubManagerService.getMembers(clubId, 'PENDING').subscribe();
    }

    approveMember(membershipId: number) {
        const clubId = this.currentClubId();
        this.clubManagerService.updateMemberStatus(membershipId, 'APPROVED').subscribe({
            next: () => {
                // Reload pending requests
                this.clubManagerService.getMembers(clubId, 'PENDING').subscribe();
            },
        });
    }

    rejectMember(membershipId: number) {
        const clubId = this.currentClubId();
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
