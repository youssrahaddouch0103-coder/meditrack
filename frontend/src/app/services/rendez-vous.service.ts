import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreationRendezVousRequest,
  RefusRendezVousRequest,
  RendezVousResponse,
  StatutRendezVous
} from '../models/rendez-vous.model';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {

  private publicUrl = `${environment.apiUrl}/public`;
  private adminUrl = `${environment.apiUrl}/admin/rendez-vous`;

  constructor(private http: HttpClient) {}

  // --- Endpoints Publics ---

  creerDemande(request: CreationRendezVousRequest): Observable<RendezVousResponse> {
    return this.http.post<RendezVousResponse>(`${this.publicUrl}/rendez-vous`, request);
  }

  obtenirListeSoins(): Observable<string[]> {
    return this.http.get<string[]>(`${this.publicUrl}/soins`);
  }

  // --- Endpoints Admin (Proteges par JWT) ---

  obtenirRendezVousAdmin(statut?: StatutRendezVous): Observable<RendezVousResponse[]> {
    let params = new HttpParams();
    if (statut) {
      params = params.set('statut', statut);
    }
    return this.http.get<RendezVousResponse[]>(this.adminUrl, { params });
  }

  obtenirRendezVousParIdAdmin(id: number): Observable<RendezVousResponse> {
    return this.http.get<RendezVousResponse>(`${this.adminUrl}/${id}`);
  }

  confirmerRendezVousAdmin(id: number): Observable<RendezVousResponse> {
    return this.http.patch<RendezVousResponse>(`${this.adminUrl}/${id}/confirmer`, {});
  }

  refuserRendezVousAdmin(id: number, motifRefus?: string): Observable<RendezVousResponse> {
    const body: RefusRendezVousRequest = { motifRefus };
    return this.http.patch<RendezVousResponse>(`${this.adminUrl}/${id}/refuser`, body);
  }

  annulerRendezVousAdmin(id: number): Observable<RendezVousResponse> {
    return this.http.patch<RendezVousResponse>(`${this.adminUrl}/${id}/annuler`, {});
  }
}
