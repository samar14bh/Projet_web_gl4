import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  const requiredRole = route.data['role'];
  
  if (!requiredRole) {
    return true;
  }
  if (requiredRole === 'ADMIN' && authService.isAdmin()) {
    return true;
  }
  
  if (requiredRole === 'USER' && !authService.isAdmin()) {
    return true;
  }

  if (authService.isAdmin()) {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/dashboard']);
  }
  
  return false;
};