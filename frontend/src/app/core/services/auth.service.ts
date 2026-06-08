import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User, UserRole } from '../models/models';
import { environment } from '../../../environments/environment';

export interface RegisterPayload {
  email: string;
  password: string;
  prenom: string;
  nom: string;
  role: UserRole;
  promo?: string;
  espritId?: string;
  cin?: string;
  specialite?: string;
  parcours?: string;
  avatarUrl?: string;
  verificationDocumentUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly TOKEN_KEY = 'esprit_token';
  private readonly USER_KEY = 'esprit_user';
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(data: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap(res => { if (res.token) { this.saveSession(res); } }));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  logout(): void {
    // Notify backend to set isOnline=false (fire-and-forget)
    // NOTE: use getToken() directly — calling isLoggedIn() here would recurse infinitely
    // because isLoggedIn() calls logout() when the token is expired.
    if (this.getToken()) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    }
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(...roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return !!user && roles.includes(user.role);
  }

  isAdmin(): boolean { return this.hasRole('ADMIN'); }
  isStudent(): boolean { return this.hasRole('STUDENT'); }
  isCompany(): boolean { return this.hasRole('COMPANY'); }
  isEnseignant(): boolean { return this.hasRole('ENSEIGNANT'); }
  isAlumni(): boolean { return this.hasRole('ALUMNI'); }

  uploadAvatar(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/auth/upload`, form);
  }

  uploadCompanyDoc(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/auth/upload-company-doc`, form);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/users/${id}`);
  }

  getOnlineUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/auth/users/online`);
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/auth/users/search`, { params: { q: query } });
  }

  getUsersByIds(ids: number[]): Observable<User[]> {
    let params = new HttpParams();
    ids.forEach(id => params = params.append('ids', id.toString()));
    return this.http.get<User[]>(`${environment.apiUrl}/auth/users/bulk`, { params });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/change-password`, { oldPassword, newPassword });
  }

  private saveSession(res: AuthResponse): void {
    if (!res.token) return;
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      // JWT uses base64url — replace url-safe chars before atob()
      const base64url = token.split('.')[1];
      const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const payload = JSON.parse(atob(padded)) as { exp?: number };
      return !!payload.exp && payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}

