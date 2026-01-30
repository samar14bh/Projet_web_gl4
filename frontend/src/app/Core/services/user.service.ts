import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../Core/services/auth.service';
import { User } from '../../Core/models/auth.models';

interface UpdateProfileResponse {
  message: string;
  user: User;
}

interface ProfileUpdateData {
  name?: string;
  lastName?: string;
  major?: string;
  dateOfBirth?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly API_URL = `${environment.apiUrl}/users`;
  updateProfile(
    id: number, 
    data: ProfileUpdateData, 
    imageFile?: File
  ): Observable<User> {
    const formData = this.buildFormData(data, imageFile);

    return this.http
      .put<UpdateProfileResponse>(`${this.API_URL}/profile/${id}`, formData)
      .pipe(
        map(response => response.user),
        tap(updatedUser => this.updateCurrentUser(updatedUser)),
        catchError(error => this.handleError(error))
      );
  }
  private buildFormData(data: ProfileUpdateData, image?: File): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (this.isValidValue(value)) {
        formData.append(key, value as string);
      }
    });
  
    if (image) {
      formData.append('image', image);
    }
    
    return formData;
  }

  private isValidValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private updateCurrentUser(updatedUser: User): void {
    this.authService.currentUser.update(current => 
      current ? { ...current, ...updatedUser } : updatedUser
    );
  }

 
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de la mise à jour du profil';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || errorMessage;
    
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides. Veuillez vérifier vos informations.';
          break;
        case 401:
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          break;
        case 403:
          errorMessage = 'Vous n\'avez pas l\'autorisation de modifier ce profil.';
          break;
        case 404:
          errorMessage = 'Utilisateur non trouvé.';
          break;
        case 413:
          errorMessage = 'Le fichier image est trop volumineux.';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
      }
    }

    console.error('Erreur UserService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  getUserProfile(id: number): Observable<User> {
    return this.http
      .get<User>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  deleteProfileImage(id: number): Observable<User> {
    return this.http
      .delete<UpdateProfileResponse>(`${this.API_URL}/profile/${id}/image`)
      .pipe(
        map(response => response.user),
        tap(updatedUser => this.updateCurrentUser(updatedUser)),
        catchError(error => this.handleError(error))
      );
  }
}