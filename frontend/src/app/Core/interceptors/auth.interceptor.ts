import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // URLs publiques qui ne nécessitent pas de token
  const publicUrls = [
    '/register',
    '/register-with-image',
    '/login',
    '/verify-email',
    '/check-email',
    '/refresh'
  ];


  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  if (isPublicUrl) {
    return next(req);
  }


  const token = authService.accessToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401 && !req.url.includes('/refresh')) {
        const refreshToken = authService.refreshToken();
        
        if (refreshToken) {
          return authService.refresh({ refreshToken }).pipe(
            switchMap(() => {

              const newToken = authService.accessToken();
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              authService.logout().subscribe();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        } else {
      
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};