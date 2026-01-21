import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DocumentDto {
    id: number;
    name: string;
    file: string;
    date: Date;
    type: string;
    size: number;
    createdAt: Date;
    user?: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

export interface PaginatedDocuments {
    data: DocumentDto[];
    total: number;
    page: number;
    lastPage: number;
}

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/documents`;

    upload(clubId: number, userId: number, file: File): Observable<DocumentDto> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<DocumentDto>(`${this.apiUrl}/upload/${clubId}/${userId}`, formData);
    }

    getClubFiles(clubId: number, page: number = 1, limit: number = 10): Observable<PaginatedDocuments> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<PaginatedDocuments>(`${this.apiUrl}/club/${clubId}`, { params });
    }

    getDocumentsResource(request: () => {
        clubId: number | undefined,
        page: number,
        limit: number,
        type: 'all' | 'image' | 'pdf'
    }) {
        return httpResource<PaginatedDocuments>(() => {
            const { clubId, page, limit, type } = request();
            if (!clubId) return undefined;

            let path = '';
            if (type === 'image') path = '/images';
            else if (type === 'pdf') path = '/docs';

            return {
                url: `${this.apiUrl}/club/${clubId}${path}`,
                params: new HttpParams()
                    .set('page', page.toString())
                    .set('limit', limit.toString())
            };
        });
    }

    getClubFilesResource(request: () => { clubId: number | undefined, page: number, limit: number }) {
        return httpResource<PaginatedDocuments>(() => {
            const { clubId, page, limit } = request();
            if (!clubId) return undefined;
            return {
                url: `${this.apiUrl}/club/${clubId}`,
                params: new HttpParams().set('page', page.toString()).set('limit', limit.toString())
            };
        });
    }

    getClubImages(clubId: number, page: number = 1, limit: number = 10): Observable<PaginatedDocuments> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<PaginatedDocuments>(`${this.apiUrl}/club/${clubId}/images`, { params });
    }

    getClubImagesResource(request: () => { clubId: number | undefined, page: number, limit: number }) {
        return httpResource<PaginatedDocuments>(() => {
            const { clubId, page, limit } = request();
            if (!clubId) return undefined;
            return {
                url: `${this.apiUrl}/club/${clubId}/images`,
                params: new HttpParams().set('page', page.toString()).set('limit', limit.toString())
            };
        });
    }

    getClubDocs(clubId: number, page: number = 1, limit: number = 10): Observable<PaginatedDocuments> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<PaginatedDocuments>(`${this.apiUrl}/club/${clubId}/docs`, { params });
    }

    getClubDocsResource(request: () => { clubId: number | undefined, page: number, limit: number }) {
        return httpResource<PaginatedDocuments>(() => {
            const { clubId, page, limit } = request();
            if (!clubId) return undefined;
            return {
                url: `${this.apiUrl}/club/${clubId}/docs`,
                params: new HttpParams().set('page', page.toString()).set('limit', limit.toString())
            };
        });
    }


    download(id: number): void {
        window.open(`${this.apiUrl}/download/${id}`, '_blank');
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
