import { HttpInterceptorFn } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop'; 
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';

const isRefreshing = signal<boolean>(false);
const refreshTokenSignal = signal<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if (req.url.includes('/auth/logout')) {
    const token = authService.accessToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next(req); 
  }
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/register') || 
      req.url.includes('/auth/verify-email') ||
      req.url.includes('/auth/refresh')) {
    return next(req);
  }

  const token = authService.accessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401 && authService.refreshToken()) {
        
        if (!isRefreshing()) {
          isRefreshing.set(true);
          refreshTokenSignal.set(null);

          const refreshToken = authService.refreshToken();
          if (!refreshToken) {
            authService.logout();
            return throwError(() => error);
          }

          return authService.refresh({ refreshToken }).pipe(
            switchMap((response) => {
              isRefreshing.set(false);
              refreshTokenSignal.set(response.accessToken);
              
              const clonedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${response.accessToken}` }
              });
              return next(clonedReq);
            }),
            catchError((err) => {
              isRefreshing.set(false);
              refreshTokenSignal.set(null);
              authService.logout();
              return throwError(() => err);
            })
          );
        } else {
          return toObservable(refreshTokenSignal).pipe(
            filter(token => token !== null), 
            take(1),                         
            switchMap(newToken => {
              const clonedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(clonedReq);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};