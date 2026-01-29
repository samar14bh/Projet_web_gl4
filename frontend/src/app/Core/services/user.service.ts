import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../Core/services/auth.service';
import { User } from '../../Core/models/auth.models';

interface UpdateProfileResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly API_URL = `${environment.apiUrl}/users`;

  updateProfile(id: number, data: Partial<User>, imageFile?: File): Observable<User> {
    const formData = this.buildFormData(data, imageFile);

    return this.http.put<UpdateProfileResponse>(`${this.API_URL}/profile/${id}`, formData).pipe(
      map(res => res.user),
      tap(updatedUser => {
        this.authService.currentUser.update(current => 
          current ? { ...current, ...updatedUser } : updatedUser
        );
      })
    );
  }

  private buildFormData(data: any, image?: File): FormData {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && key !== 'password') {
        formData.append(key, value as string);
      }
    });
    if (image) formData.append('image', image);
    return formData;
  }
}