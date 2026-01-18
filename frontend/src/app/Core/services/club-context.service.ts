import { Injectable, signal, computed, effect } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Service pour gérer le contexte du club actuel
 * Centralise la logique de gestion du club sélectionné pour les managers
 */
@Injectable({
    providedIn: 'root',
})
export class ClubContextService {
    private readonly CURRENT_CLUB_KEY = 'current_club_id';

    // Signal pour le club actuel
    currentClubId = signal<number | null>(this.getClubIdFromStorage());

    // Computed pour vérifier si un club est sélectionné
    hasClub = computed(() => this.currentClubId() !== null);

    constructor(private authService: AuthService) {
        // Persister le clubId dans le localStorage
        effect(() => {
            const clubId = this.currentClubId();
            if (clubId !== null) {
                localStorage.setItem(this.CURRENT_CLUB_KEY, clubId.toString());
            } else {
                localStorage.removeItem(this.CURRENT_CLUB_KEY);
            }
        });

        // Réinitialiser le club lors de la déconnexion
        effect(() => {
            if (!this.authService.isAuthenticated()) {
                this.currentClubId.set(null);
            }
        });
    }

    /**
     * Définir le club actuel
     */
    setCurrentClub(clubId: number): void {
        this.currentClubId.set(clubId);
    }

    /**
     * Récupérer le clubId depuis le localStorage
     */
    private getClubIdFromStorage(): number | null {
        if (typeof window === 'undefined') return null;
        const clubId = localStorage.getItem(this.CURRENT_CLUB_KEY);
        return clubId ? parseInt(clubId, 10) : null;
    }

    /**
     * Réinitialiser le club actuel
     */
    clearCurrentClub(): void {
        this.currentClubId.set(null);
    }
}

