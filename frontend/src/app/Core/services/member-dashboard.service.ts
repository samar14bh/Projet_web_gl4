
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DashboardMember, DashboardResponse } from '../models/dashboard.model';
import { Club } from '../models/club.model';

@Injectable({
  providedIn: 'root'
})
export class MemberDashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/`;

  getMemberDashboard(): Observable<DashboardMember> {
  return this.http.get<DashboardMember>(`${this.apiUrl}dashboard/member`).pipe(

    catchError((error) => {
      console.error('Erreur dans MemberDashboardService:', error);
      return throwError(() => error);
    })
  );
}
  getRecommendedClubs(limit: number = 3): Observable<Club[]> {
  return this.http.get<Club[]>(`${this.apiUrl}clubs/recommendations`, {
    params: { limit: limit.toString() }
  });
}
}
