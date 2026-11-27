import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  let token = authService.getToken();
  if (!token && typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('cabinet_admin_jwt_token') ||
            localStorage.getItem('admin_jwt_token') ||
            localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('jwt') ||
            localStorage.getItem('authToken');
  }

  if (token && (req.url.includes('/api/admin') || req.url.includes('/admin/'))) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
