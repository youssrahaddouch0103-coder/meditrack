import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { JwtAuthResponse, LoginRequest, GenericResponse, AdminAccountInfoResponse, EmergencyCodesResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = `${environment.apiUrl}/auth`;
  private securityUrl = `${environment.apiUrl}/admin/security`;
  private TOKEN_KEY = 'cabinet_admin_jwt_token';
  private EMAIL_KEY = 'cabinet_admin_email';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.EMAIL_KEY, response.email);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp) {
        return Math.floor(Date.now() / 1000) >= payload.exp;
      }
      return false;
    } catch {
      return true;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  // Public security & recovery methods
  requestPasswordReset(email: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.authUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.authUrl}/reset-password`, { token, newPassword });
  }

  recoverWithEmergencyCode(recoveryCode: string, newLoginEmail: string, newPassword: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.authUrl}/recover-emergency`, {
      recoveryCode,
      newLoginEmail,
      newPassword
    });
  }

  // Protected Admin Security Settings methods
  getAdminAccountInfo(): Observable<AdminAccountInfoResponse> {
    return this.http.get<AdminAccountInfoResponse>(`${this.securityUrl}/account-info`);
  }

  updateLoginEmail(newLoginEmail: string, currentPassword: string): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(`${this.securityUrl}/update-login-email`, { newLoginEmail, currentPassword }).pipe(
      tap(() => {
        localStorage.setItem(this.EMAIL_KEY, newLoginEmail);
      })
    );
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<GenericResponse> {
    return this.http.put<GenericResponse>(`${this.securityUrl}/update-password`, { currentPassword, newPassword });
  }

  generateEmergencyCodes(): Observable<EmergencyCodesResponse> {
    return this.http.post<EmergencyCodesResponse>(`${this.securityUrl}/generate-emergency-codes`, {});
  }
}
