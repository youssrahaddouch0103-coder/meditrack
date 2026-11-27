import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TeamMember } from '../models/team-member.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private publicApiUrl = `${environment.apiUrl}/public/team`;
  private adminApiUrl = `${environment.apiUrl}/admin/team`;

  constructor(private http: HttpClient) {}

  getPublicTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(this.publicApiUrl);
  }

  getAllTeamMembersAdmin(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(this.adminApiUrl);
  }

  getTeamMemberByIdAdmin(id: number): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.adminApiUrl}/${id}`);
  }

  createTeamMember(formData: FormData): Observable<TeamMember> {
    return this.http.post<TeamMember>(this.adminApiUrl, formData);
  }

  updateTeamMember(id: number, formData: FormData): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.adminApiUrl}/${id}`, formData);
  }

  deleteTeamMember(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminApiUrl}/${id}`);
  }

  toggleMemberStatus(id: number): Observable<TeamMember> {
    return this.http.patch<TeamMember>(`${this.adminApiUrl}/${id}/status`, {});
  }

  reorderTeamMembers(items: { id: number; displayOrder: number }[]): Observable<TeamMember[]> {
    return this.http.patch<TeamMember[]>(`${this.adminApiUrl}/reorder`, { items });
  }

  getImageUrl(url?: string): string {
    if (!url) {
      return 'assets/team-1.png';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('assets/') || url.startsWith('/assets/')) {
      return url.startsWith('/') ? url.slice(1) : url;
    }
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    if (url.startsWith('/uploads/')) {
      return `${backendBase}${url}`;
    }
    if (url.startsWith('uploads/')) {
      return `${backendBase}/${url}`;
    }
    return `${backendBase}/${url.startsWith('/') ? url.slice(1) : url}`;
  }
}
