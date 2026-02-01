import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { MembershipService } from '../services/membership.service';
import { UserRoleInClub } from '../dtos/application/membership-club.dto';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const clubRoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const membershipService = inject(MembershipService);
    const authService = inject(AuthService);
    const router = inject(Router);
    const requiredRoles = route.data['clubRoles'] as UserRoleInClub[];

    const membershipId = Number(route.paramMap.get('membershipId'));
    const clubId = Number(route.paramMap.get('clubId'));

    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/login']);
    }

    // Use the shared resource to check permissions
    return toObservable(membershipService.specialMembershipsResource.value).pipe(
        filter(value => value !== undefined), // Wait for the resource to load
        map(memberships => {
            let membership = null;

            if (membershipId) {
                membership = memberships?.find(m => m.membershipId === membershipId);
            } else if (clubId) {
                membership = memberships?.find(m => m.id === clubId);
            }

            if (!membership) {
                // If the user doesn't have a special membership for this ID, reject
                return router.createUrlTree(['/dashboard']);
            }

            // If no specific roles are required, just having a special membership is enough
            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }

            // Check if the user's role is in the allowed list
            const hasRequiredRole = requiredRoles.includes(membership.userRole);

            if (hasRequiredRole) {
                return true;
            }

            // Redirect to the main responsibility page if they don't have the role for this sub-page
            return router.createUrlTree(['/club-responsability', membership.membershipId]);
        }),
        take(1)
    );
};
