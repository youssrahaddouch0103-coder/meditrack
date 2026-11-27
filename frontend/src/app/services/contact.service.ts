import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreationMessageContactRequest, MessageContactResponse } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private publicUrl = `${environment.apiUrl}/contact/messages`;
  private adminUrl = `${environment.apiUrl}/admin/contact/messages`;

  constructor(private http: HttpClient) {}

  // Endpoint public pour le formulaire de contact
  envoyerMessage(request: CreationMessageContactRequest): Observable<MessageContactResponse> {
    return this.http.post<MessageContactResponse>(this.publicUrl, request);
  }

  // Endpoints admin (Proteges par JWT via authInterceptor)
  obtenirMessagesAdmin(): Observable<MessageContactResponse[]> {
    return this.http.get<MessageContactResponse[]>(this.adminUrl);
  }

  compterMessagesNonLusAdmin(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.adminUrl}/non-lus-count`);
  }

  obtenirMessageParIdAdmin(id: number): Observable<MessageContactResponse> {
    return this.http.get<MessageContactResponse>(`${this.adminUrl}/${id}`);
  }

  marquerCommeLuAdmin(id: number): Observable<MessageContactResponse> {
    return this.http.patch<MessageContactResponse>(`${this.adminUrl}/${id}/lu`, {});
  }

  marquerCommeNonLuAdmin(id: number): Observable<MessageContactResponse> {
    return this.http.patch<MessageContactResponse>(`${this.adminUrl}/${id}/non-lu`, {});
  }

  supprimerMessageAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
