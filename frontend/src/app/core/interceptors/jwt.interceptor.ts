import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private notifications: NotificationService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const isAuthEndpoint = request.url.includes('/auth/login') || request.url.includes('/auth/register');

        if (error.status === 401 && !isAuthEndpoint) {
          // 401 = truly unauthenticated (no token or token rejected by Spring Security)
          // This is the only case where we force logout
          this.authService.logout();
          this.notifications.error('Session expired. Please sign in again.');
          this.router.navigate(['/auth/login']);
        } else if (error.status === 400) {
          const msg = error.error?.message || error.error?.error || 'Bad request. Please check your input.';
          this.notifications.error(msg);
        } else if (error.status === 404) {
          this.notifications.error('The requested resource was not found.');
        } else if (error.status === 429) {
          this.notifications.error('Too many requests. Please slow down and try again shortly.');
        } else if (error.status >= 500) {
          this.notifications.error('Server error. Please try again later.');
        }
        // 403 = the user IS authenticated but lacks permission for this specific action.
        // Do NOT logout — let the component handle it with its own error message.

        return throwError(() => error);
      })
    );
  }
}
