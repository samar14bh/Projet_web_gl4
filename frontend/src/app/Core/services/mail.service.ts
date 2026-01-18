import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MailService {
    private apiUrl = `${environment.apiUrl}/mail`;

    constructor(private http: HttpClient) { }

    sendContactClubEmail(to: string, subject: string, message: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/contact-club`, { to, subject, message });
    }
}
