import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { CarePhoto, UpdateCarePhotoRequest, ReorderPhotosRequest } from '../models/care-photo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarePhotoService {
  private publicApiUrl = `${environment.apiUrl}/public/soins`;
  private adminApiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('cabinet_admin_jwt_token') ||
              localStorage.getItem('admin_jwt_token') ||
              localStorage.getItem('token') ||
              localStorage.getItem('accessToken') ||
              localStorage.getItem('jwt') ||
              localStorage.getItem('authToken') || '';
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Public API
  getPhotosByCare(careSlug: string): Observable<CarePhoto[]> {
    return this.http.get<CarePhoto[]>(`${this.publicApiUrl}/${careSlug}/photos`).pipe(
      catchError(() => of([]))
    );
  }

  // Admin APIs
  uploadPhotos(careSlug: string, files: File[], altTexts: string, captions?: string): Observable<CarePhoto[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    formData.append('altTexts', altTexts);
    if (captions) {
      formData.append('captions', captions);
    }

    return this.http.post<CarePhoto[]>(
      `${this.adminApiUrl}/soins/${careSlug}/photos`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  setCoverPhoto(photoId: number): Observable<CarePhoto> {
    return this.http.put<CarePhoto>(
      `${this.adminApiUrl}/soins/photos/${photoId}/cover`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  updatePhotoInfo(photoId: number, request: UpdateCarePhotoRequest): Observable<CarePhoto> {
    return this.http.put<CarePhoto>(
      `${this.adminApiUrl}/soins/photos/${photoId}`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }

  reorderPhotos(careSlug: string, photoIdsInOrder: number[]): Observable<CarePhoto[]> {
    const body: ReorderPhotosRequest = { photoIdsInOrder };
    return this.http.put<CarePhoto[]>(
      `${this.adminApiUrl}/soins/${careSlug}/photos/reorder`,
      body,
      { headers: this.getAuthHeaders() }
    );
  }

  deletePhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.adminApiUrl}/soins/photos/${photoId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
