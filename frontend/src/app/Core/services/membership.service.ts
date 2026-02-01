import { Injectable } from '@angular/core';
import { CreateApplicationDto } from '../dtos/application/create-application.dto';
import { ApplicationResponseDto } from '../dtos/application/application-response.dto';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { httpResource } from '@angular/common/http';
import { MembershipClubDto } from '../dtos/application/membership-club.dto';
import { computed, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MembershipService {
  private readonly apiUrl = `${environment.apiUrl}/memberships`;

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  /**
   * Shared resource for memberships where the user has special responsibilities (Bureau).
   */
  public readonly specialMembershipsResource = httpResource<MembershipClubDto[]>(() => {
    const user = this.authService.currentUser();
    if (!user) return undefined;
    return `${environment.apiUrl}/memberships/special-memberships/users/${user.id}`;
  });

  /**
   * Helper to derive a specific membership from the shared resource.
   */
  getMembership(membershipId: () => number | undefined) {
    return computed(() => {
      const id = membershipId();
      return this.specialMembershipsResource.value()?.find(m => m.membershipId === id) ?? null;
    });
  }

  constructor() {
  }

  createApplication(dto: CreateApplicationDto): Observable<ApplicationResponseDto> {
    return this.http.post<ApplicationResponseDto>(`${this.apiUrl}/create-application`, dto);
  }




  getApplicationsByUser(userId: number): Observable<ApplicationResponseDto[]> {
    return this.http.get<ApplicationResponseDto[]>(
      `${this.apiUrl}/users/${userId}/applications`
    );
  }

  getApplicationById(userId: number): Observable<ApplicationResponseDto> {
    return this.http.get<ApplicationResponseDto>(
      `${this.apiUrl}/applications/${userId}`
    );
  }

  deleteApplication(applicationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/applications/${applicationId}`);
  }
}
