import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { 
  RegisterDto, 
  LoginDto, 
  VerifyOtpDto, 
  AuthResponse, 
  User,
  OtpResponse,
  VerifyEmailResponse,
  RefreshTokenDto
} from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  currentUser = signal<User | null>(this.getUserFromStorage());
  accessToken = signal<string | null>(this.getTokenFromStorage());
  refreshToken = signal<string | null>(this.getRefreshTokenFromStorage());
  
  isAuthenticated = computed(() => !!this.accessToken());
  isEmailVerified = computed(() => this.currentUser()?.emailVerified ?? false);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  userFullName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.name} ${user.lastName}` : '';
  });
  userInitials = computed(() => {
    const user = this.currentUser();
    return user ? `${user.name[0]}${user.lastName[0]}`.toUpperCase() : '??';
  });

  constructor() {
    effect(() => {
      const token = this.accessToken();
      const refresh = this.refreshToken();
      const user = this.currentUser();
      
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
      } else {
        localStorage.removeItem(this.TOKEN_KEY);
      }
      
      if (refresh) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
      } else {
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      }
      
      if (user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_KEY);
      }
    });
  }

  register(dto: RegisterDto): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`${this.API_URL}/register`, dto).pipe(
      catchError(this.handleError)
    );
  }

  registerWithImage(dto: RegisterDto, imageFile: File): Observable<{ message: string; user: User }> {
    const formData = new FormData();
    formData.append('email', dto.email);
    formData.append('password', dto.password);
    formData.append('name', dto.name);
    formData.append('lastName', dto.lastName);
    formData.append('major', dto.major);
    formData.append('dateOfBirth', dto.dateOfBirth);
    formData.append('image', imageFile);

    return this.http.post<{ message: string; user: User }>(
      `${this.API_URL}/register-with-image`, 
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  login(dto: LoginDto): Observable<OtpResponse | AuthResponse> {
    return this.http.post<OtpResponse | AuthResponse>(`${this.API_URL}/login`, dto).pipe(
      tap(response => {
        if ('accessToken' in response && !response.requiresOtp) {
          this.handleAuthResponse(response as AuthResponse);
        }
      }),
      catchError(this.handleError)
    );
  }

  verifyOtp(dto: VerifyOtpDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/verify-otp`, dto).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  verifyEmail(token: string): Observable<VerifyEmailResponse> {
    return this.http.get<VerifyEmailResponse>(`${this.API_URL}/verify-email?token=${token}`).pipe(
      catchError(this.handleError)
    );
  }

  refresh(refreshTokenDto: RefreshTokenDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, refreshTokenDto).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleError)
    );
  }

  logout(): Observable<void> {
  const token = this.accessToken();
  
  if (!token) {
    console.warn('[AUTH] Tentative de logout sans token');
    this.clearAuth();
    this.router.navigate(['/login']);
    return of(void 0); 
  }
  
  return this.http.post<void>(`${this.API_URL}/logout`, {}).pipe(
    tap(() => {
      console.log('[AUTH] Logout réussi');
      this.clearAuth();
      this.router.navigate(['/login']);
    }),
    catchError(err => {
      console.error('[AUTH] Erreur lors du logout:', err);

      this.clearAuth();
      this.router.navigate(['/login']);
      return throwError(() => err);
    })
  );
}

  private handleAuthResponse(response: AuthResponse): void {
    this.accessToken.set(response.accessToken);
    this.refreshToken.set(response.refreshToken);
    this.currentUser.set(response.user);
  }

  private clearAuth(): void {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.currentUser.set(null);
  }

  private getTokenFromStorage(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getRefreshTokenFromStorage(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private getUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth error:', error);
    return throwError(() => error);
  }
checkEmailExists(email: string): Observable<{ exists: boolean }> {
  return this.http.get<{ exists: boolean }>(`${this.API_URL}/check-email?email=${encodeURIComponent(email)}`).pipe(
    catchError(() => of({ exists: false })) 
  );
}
}