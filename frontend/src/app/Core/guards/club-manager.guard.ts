import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ClubContextService } from '../services/club-context.service';

/**
 * Guard pour protéger les routes des club managers
 * Vérifie que l'utilisateur est authentifié et a un club associé
 */
export const clubManagerGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const clubContextService = inject(ClubContextService);
    const router = inject(Router);

    // Vérifier l'authentification
    if (!authService.isAuthenticated()) {
        router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
        });
        return false;
    }

    // Vérifier qu'un club est sélectionné
    if (!clubContextService.hasClub()) {
        // TODO: Rediriger vers une page de sélection de club
        // Pour l'instant, on met un clubId par défaut
        console.warn('[CLUB MANAGER GUARD] Aucun club sélectionné, utilisation du club par défaut');
        clubContextService.setCurrentClub(1);
    }

    return true;
};

