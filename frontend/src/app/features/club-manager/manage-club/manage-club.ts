import { Component, signal, OnInit, effect, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClubManagerService } from '../../../Core/services/club-manager.service';
import { TabNavigationComponent } from '../../../shared/components/tab-navigation/tab-navigation';
import { TabItem } from '../../../shared/interfaces/components.interface';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { EventService } from '../../../Core/services/event.service';
import { EventStatus } from '../../../Core/models/event.model';
import { ClubContextService } from '../../../Core/services/club-context.service';
import { ClubSelectorComponent } from '../components/club-selector/club-selector';

/**
 * PAGE 13: Manage Club (Enhanced)
 * Comprehensive club management with info, members, and events preview
 */
@Component({
    selector: 'app-manage-club',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, TabNavigationComponent, StatCardComponent, ClubSelectorComponent],
    templateUrl: './manage-club.html',
    styleUrl: './manage-club.css',
})
export class ManageClubComponent {
    private clubContext = inject(ClubContextService);

    // Signals
    activeTab = signal<string>('info');
    currentClubId = computed(() => this.clubContext.currentClubId());

    saving = signal(false);
    editMode = signal(false);

    // Club data signals
    clubName = signal('');
    clubDescription = signal('');
    clubEmail = signal('');
    clubLogo = signal('');
    isPublic = signal(false);
    membershipFee = signal(0);
    approvalRequired = signal(true);

    // Preview data
    recentMembers = signal<any[]>([]);
    upcomingEvents = signal<any[]>([]);

    // Tab configuration
    tabs = signal<TabItem[]>([
        { id: 'info', label: 'Informations', icon: 'info-circle' },
        { id: 'members', label: 'Membres', icon: 'people' },
        { id: 'events', label: 'Événements', icon: 'calendar-event' },
        { id: 'settings', label: 'Paramètres', icon: 'gear' },
    ]);

    constructor(
        private clubManagerService: ClubManagerService,
        private eventService: EventService
    ) {
        effect(() => {
            if (this.currentClubId()) {
                this.loadClubData();
            }
        });
    }

    // ngOnInit() removed as effect handles initial load

    loadClubData() {
        const clubId = this.currentClubId();
        if (!clubId) return;

        // Load Club Details
        this.clubManagerService.getClubDetails(clubId).subscribe({
            next: (club) => {
                if (club.name) this.clubName.set(club.name);
                if (club.description) this.clubDescription.set(club.description);
                if (club.contactEmail) this.clubEmail.set(club.contactEmail);
                if (club.isPublic !== undefined) this.isPublic.set(club.isPublic);
                if (club.membershipFeeAmount) this.membershipFee.set(club.membershipFeeAmount);
                if (club.approvalRequired !== undefined) this.approvalRequired.set(club.approvalRequired);
            }
        });

        // Load Club Members (limit 5 for preview)
        this.clubManagerService.getMembers(clubId, 'APPROVED', 1, 5).subscribe({
            next: (response) => {
                const members = response.data || [];
                this.recentMembers.set(members.map((m: any) => ({
                    id: m.id,
                    name: `${m.user.name} ${m.user.lastName}`,
                    role: m.role || 'member',
                    joinDate: m.joinDate || m.createdAt
                })));
            }
        });

        // Load Upcoming Events (limit 3)
        this.eventService.getEvents({ clubId, status: EventStatus.UPCOMING, limit: 3 }).subscribe({
            next: (response) => {
                this.upcomingEvents.set(response.data.map((e: any) => ({
                    id: e.id,
                    title: e.title,
                    date: e.startDate,
                    participants: e.capacity // Placeholder until we have registrations count
                })));
            }
        });
    }

    onTabChange(tabId: string) {
        this.activeTab.set(tabId);
    }

    toggleEditMode() {
        this.editMode.set(!this.editMode());
    }

    saveClubInfo() {
        this.saving.set(true);
        const clubId = this.currentClubId();
        if (!clubId) return;

        this.clubManagerService.updateClub(clubId, {
            name: this.clubName(),
            description: this.clubDescription(),
            contactEmail: this.clubEmail(),
        }).subscribe({
            next: () => {
                this.saving.set(false);
                this.editMode.set(false);
                alert('Informations mises à jour avec succès');
            },
            error: () => {
                this.saving.set(false);
                alert('Erreur lors de la mise à jour');
            },
        });
    }

    savePricing() {
        this.saving.set(true);
        const clubId = this.currentClubId();
        if (!clubId) return;

        this.clubManagerService.updateClub(clubId, {
            isPublic: this.isPublic(),
            membershipFeeAmount: this.membershipFee(),
        }).subscribe({
            next: () => {
                this.saving.set(false);
                alert('Tarification mise à jour avec succès');
            },
            error: () => {
                this.saving.set(false);
                alert('Erreur lors de la mise à jour');
            },
        });
    }

    saveSettings() {
        this.saving.set(true);
        const clubId = this.currentClubId();
        if (!clubId) return;

        this.clubManagerService.updateClub(clubId, {
            approvalRequired: this.approvalRequired(),
        }).subscribe({
            next: () => {
                this.saving.set(false);
                alert('Paramètres mis à jour avec succès');
            },
            error: () => {
                this.saving.set(false);
                alert('Erreur lors de la mise à jour');
            },
        });
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    getRoleBadge(role: string): string {
        const badges: Record<string, string> = {
            president: 'badge-primary',
            treasurer: 'badge-success',
            secretary: 'badge-secondary',
            member: 'badge-default',
        };
        return badges[role] || 'badge-default';
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
