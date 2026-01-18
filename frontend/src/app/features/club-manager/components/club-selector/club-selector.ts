import { Component, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ClubContextService } from '../../../../Core/services/club-context.service';
import { ClubManagerService } from '../../../../Core/services/club-manager.service';
import { AuthService } from '../../../../Core/services/auth.service';
import { Club } from '../../../../Core/models/club.model';

@Component({
    selector: 'app-club-selector',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './club-selector.html',
    styleUrl: './club-selector.css'
})
export class ClubSelectorComponent implements OnInit {
    managedClubs = signal<Club[]>([]);
    currentClubId = computed(() => this.clubContext.currentClubId());
    currentClub = computed(() => this.managedClubs().find(c => c.id === this.currentClubId()));

    loading = signal(true);
    isOpen = signal(false);

    constructor(
        private clubContext: ClubContextService,
        private clubManagerService: ClubManagerService,
        private authService: AuthService,
        private router: Router
    ) {
        // Automatically check validity of current club
        effect(() => {
            const currentId = this.currentClubId();
            const clubs = this.managedClubs();

            if (clubs.length > 0 && currentId && !clubs.find(c => c.id === currentId)) {
                // If current ID is invalid (not in managed list), reset it
                this.clubContext.clearCurrentClub();
            }
        });
    }

    ngOnInit() {
        this.loadManagedClubs();
    }

    loadManagedClubs() {
        const user = this.authService.currentUser();
        if (!user) return;

        this.loading.set(true);
        // Ensure user.id is a number. If it is string in User model, parse it. 
        // Assuming User.id is number based on usage elsewhere, but if error says 'string not assignable to number', then User.id is string.
        // Let's cast or parse.
        const userId = typeof user.id === 'string' ? parseInt(user.id as string, 10) : user.id;

        this.clubManagerService.getManagedClubs(userId).subscribe({
            next: (clubs) => {
                this.managedClubs.set(clubs);
                this.loading.set(false);

                // Auto-select if only one club and none selected
                if (clubs.length === 1 && !this.currentClubId()) {
                    this.selectClub(clubs[0]);
                }
            },
            error: (err) => {
                console.error('Error loading managed clubs:', err);
                this.loading.set(false);
            }
        });
    }

    selectClub(club: Club) {
        this.clubContext.setCurrentClub(club.id);
        this.isOpen.set(false);
        // Reload current page to refresh data with new ID
        // Or simpler: The signals in other components will react if we link them properly!
        // For now, let's just close. The other components should listen to ClubContext.

        // Force refresh via navigation trick if components don't define effect on id change
        // But better is to just let signals propagate if possible.
        // Given current architecture, components use currentClubId() signal.
        // If they use effect() or computed(), they will update.
        // If they fetch in ngOnInit() only, they won't update.
        // We will need to check the pages.
    }

    toggleDropdown() {
        this.isOpen.update(v => !v);
    }
}
