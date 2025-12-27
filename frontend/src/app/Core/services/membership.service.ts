import { Injectable } from '@angular/core';
import {CreateApplicationDto} from '../dtos/create-application.dto';
import {ApplicationResponseDto} from '../dtos/application-response.dto';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MembershipService {
  private readonly apiUrl = `${environment.apiUrl}/memberships`;

  constructor(private http: HttpClient) {
  }

  createApplication(dto: CreateApplicationDto): Observable<ApplicationResponseDto> {
    return this.http.post<ApplicationResponseDto>(`${this.apiUrl}/create-application`, dto);
  }




  getApplicationsByUser(userId: number): Observable<ApplicationResponseDto[]> {
    return this.http.get<ApplicationResponseDto[]>(
      `${this.apiUrl}/users/${userId}/applications`
    );
  }

  getApplicationById(userId :number):Observable<ApplicationResponseDto>{
    return this.http.get<ApplicationResponseDto>(
      `${this.apiUrl}/applications/${userId}`
    );
  }

}
