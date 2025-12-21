import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { Member } from '../../../Core/interfaces/club-manager.interface';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation';
import { TabItem } from '../../../shared/interfaces/components.interface';

/**
 * PAGE 14: Manage Members
 * Member management and approval page
 */
@Component({
    selector: 'app-manage-members',
    standalone: true,
    imports: [CommonModule, TabNavigationComponent],
    templateUrl: './manage-members.html',
    styleUrl: './manage-members.css',
})
export class ManageMembersComponent implements OnInit {
    // Signals
    activeTab = signal<string>('active');
    currentClubId = signal(1); // TODO: Get from auth/context
    members = signal<Member[]>([]);

    // Tab configuration
    tabs = signal<TabItem[]>([
        { id: 'active', label: 'Membres actifs', icon: 'people-fill' },
        { id: 'pending', label: 'Demandes en attente', icon: 'clock-history', badge: 0 },
        { id: 'history', label: 'Historique', icon: 'archive' },
    ]);

    // Computed values
    activeMembers = computed(() => this.clubManagerService.activeMembers());
    pendingMembers = computed(() => this.clubManagerService.pendingMembers());
    loading = computed(() => this.clubManagerService.loading());

    constructor(public clubManagerService: ClubManagerService) { }

    ngOnInit() {
        this.loadMembers();
    }

    loadMembers() {
        const clubId = this.currentClubId();

        // Load pending requests
        this.clubManagerService.getMembers(clubId, 'PENDING').subscribe({
            next: (response) => {
                // Update badge count
                const tabs = this.tabs();
                tabs[1].badge = response.data?.length || 0;
                this.tabs.set([...tabs]);
            },
        });

        // Load active members
        this.clubManagerService.getMembers(clubId, 'APPROVED').subscribe();
    }

    onTabChange(tabId: string) {
        this.activeTab.set(tabId);
    }

    approveMember(membershipId: number) {
        const clubId = this.currentClubId();
        this.clubManagerService.updateMemberStatus(membershipId, 'APPROVED').subscribe({
            next: () => {
                this.loadMembers();
            },
        });
    }

    rejectMember(membershipId: number) {
        const clubId = this.currentClubId();
        this.clubManagerService.updateMemberStatus(membershipId, 'REJECTED').subscribe({
            next: () => {
                this.loadMembers();
            },
        });
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }

    getRoleBadgeClass(role: string): string {
        const classes: Record<string, string> = {
            president: 'badge-primary',
            treasurer: 'badge-success',
            secretary: 'badge-secondary',
            member: 'badge-default',
        };
        return classes[role] || 'badge-default';
    }

    getRoleLabel(role: string): string {
        const labels: Record<string, string> = {
            president: 'Président',
            treasurer: 'Trésorier',
            secretary: 'Secrétaire',
            member: 'Membre',
        };
        return labels[role] || role;
    }
}
