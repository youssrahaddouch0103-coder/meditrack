import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AvisResponse, CreationAvisRequest, StatutAvis } from '../models/avis.model';

@Injectable({
  providedIn: 'root'
})
export class AvisService {

  private publicUrl = `${environment.apiUrl}/avis`;
  private adminUrl = `${environment.apiUrl}/admin/avis`;

  constructor(private http: HttpClient) {}

  // Endpoints publics
  proposerAvis(request: CreationAvisRequest): Observable<{ message: string; avis: AvisResponse }> {
    return this.http.post<{ message: string; avis: AvisResponse }>(this.publicUrl, request);
  }

  obtenirAvisPublics(): Observable<AvisResponse[]> {
    return this.http.get<AvisResponse[]>(`${this.publicUrl}/publics`);
  }

  // Endpoints admin (Proteges par JWT via authInterceptor)
  obtenirTousAvisAdmin(statut?: StatutAvis): Observable<AvisResponse[]> {
    let params = new HttpParams();
    if (statut) {
      params = params.set('statut', statut);
    }
    return this.http.get<AvisResponse[]>(this.adminUrl, { params });
  }

  compterAvisEnAttenteAdmin(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.adminUrl}/en-attente-count`);
  }

  obtenirAvisParIdAdmin(id: number): Observable<AvisResponse> {
    return this.http.get<AvisResponse>(`${this.adminUrl}/${id}`);
  }

  approuverAvisAdmin(id: number): Observable<{ message: string; avis: AvisResponse }> {
    return this.http.patch<{ message: string; avis: AvisResponse }>(`${this.adminUrl}/${id}/approuver`, {});
  }

  refuserAvisAdmin(id: number): Observable<{ message: string; avis: AvisResponse }> {
    return this.http.patch<{ message: string; avis: AvisResponse }>(`${this.adminUrl}/${id}/refuser`, {});
  }

  supprimerAvisAdmin(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminUrl}/${id}`);
  }
}
