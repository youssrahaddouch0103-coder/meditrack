import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, map, of } from 'rxjs';
import { SoinItem, SOINS_LIST, CLINICAL_DISCLAIMER } from '../config/soins.config';
import { Soin, CreationSoinRequest } from '../models/soin.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CareService {
  private publicApiUrl = `${environment.apiUrl}/public/soins`;
  private adminApiUrl = `${environment.apiUrl}/admin/soins`;

  private selectedCareSubject = new BehaviorSubject<string | null>(null);
  public selectedCare$ = this.selectedCareSubject.asObservable();

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

  selectCare(careTitle: string): void {
    this.selectedCareSubject.next(careTitle);
  }

  selectCareForAppointment(careTitle: string): void {
    this.selectCare(careTitle);
  }

  getClinicalDisclaimer(): string {
    return CLINICAL_DISCLAIMER;
  }

  getSoins(): SoinItem[] {
    return SOINS_LIST;
  }

  getSoinsTitles(): string[] {
    return SOINS_LIST.map(item => item.title);
  }

  // Public APIs
  getSoinsPublics(): Observable<Soin[]> {
    return this.http.get<Soin[]>(this.publicApiUrl).pipe(
      catchError((err) => {
        console.warn('[CareService] API publique indisponible, utilisation du fallback statique.', err);
        const fallback: Soin[] = SOINS_LIST.map((item, index) => ({
          id: index + 1,
          codeSlug: item.id,
          titre: item.title,
          descriptionCourte: item.shortDescription,
          descriptionDetaillee: item.detailedDescription,
          photoCouvertureUrl: item.imageUrl,
          photoCouvertureAlt: item.imageAlt,
          ordreAffichage: index + 1,
          statut: 'PUBLIE'
        }));
        return of(fallback);
      })
    );
  }

  getTitresSoinsPublics(): Observable<string[]> {
    return this.http.get<string[]>(`${this.publicApiUrl}/titres`).pipe(
      catchError(() => {
        return of(SOINS_LIST.map(item => item.title));
      })
    );
  }

  getPublicCareTitles(): Observable<string[]> {
    return this.getTitresSoinsPublics();
  }

  getSoinBySlugOrId(identifier: string): Observable<Soin | null> {
    return this.http.get<Soin>(`${this.publicApiUrl}/${identifier}`).pipe(
      catchError(() => {
        const item = SOINS_LIST.find(s => s.id === identifier || s.title.toLowerCase().includes(identifier.toLowerCase()));
        if (item) {
          const fallback: Soin = {
            id: 1,
            codeSlug: item.id,
            titre: item.title,
            descriptionCourte: item.shortDescription,
            descriptionDetaillee: item.detailedDescription,
            photoCouvertureUrl: item.imageUrl,
            photoCouvertureAlt: item.imageAlt,
            ordreAffichage: 1,
            statut: 'PUBLIE'
          };
          return of(fallback);
        }
        return of(null);
      })
    );
  }

  // Admin APIs
  getAllSoinsAdmin(): Observable<Soin[]> {
    return this.http.get<Soin[]>(this.adminApiUrl, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of([]))
    );
  }

  creerSoin(request: CreationSoinRequest, coverFile?: File): Observable<Soin> {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' });
    formData.append('data', jsonBlob);
    formData.append('titre', request.titre);
    formData.append('descriptionCourte', request.descriptionCourte);
    formData.append('descriptionDetaillee', request.descriptionDetaillee);
    if (request.photoCouvertureAlt) formData.append('photoCouvertureAlt', request.photoCouvertureAlt);
    if (request.ordreAffichage) formData.append('ordreAffichage', request.ordreAffichage.toString());
    if (request.statut) formData.append('statut', request.statut);

    if (coverFile) {
      formData.append('coverFile', coverFile);
      formData.append('coverImage', coverFile);
    }

    return this.http.post<Soin>(this.adminApiUrl, formData, { headers: this.getAuthHeaders() });
  }

  modifierSoin(idOrSlug: number | string, request: CreationSoinRequest, coverFile?: File): Observable<Soin> {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(request)], { type: 'application/json' });
    formData.append('data', jsonBlob);
    formData.append('titre', request.titre);
    formData.append('descriptionCourte', request.descriptionCourte);
    formData.append('descriptionDetaillee', request.descriptionDetaillee);
    if (request.photoCouvertureAlt) formData.append('photoCouvertureAlt', request.photoCouvertureAlt);
    if (request.ordreAffichage) formData.append('ordreAffichage', request.ordreAffichage.toString());
    if (request.statut) formData.append('statut', request.statut);

    if (coverFile) {
      formData.append('coverFile', coverFile);
      formData.append('coverImage', coverFile);
    }

    const url = `${this.adminApiUrl}/${idOrSlug}`;
    console.log(`[PUT Care API Request] Modification du soin idOrSlug: "${idOrSlug}", URL: ${url}`);

    return this.http.put<Soin>(url, formData, { headers: this.getAuthHeaders() });
  }

  reordonnerSoins(soinIdsInOrder: number[]): Observable<Soin[]> {
    return this.http.put<Soin[]>(
      `${this.adminApiUrl}/reorder`,
      { soinIdsInOrder },
      { headers: this.getAuthHeaders() }
    );
  }

  supprimerOuArchiverSoin(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
