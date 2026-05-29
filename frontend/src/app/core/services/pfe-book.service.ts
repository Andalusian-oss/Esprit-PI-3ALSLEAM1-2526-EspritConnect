import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PfeBook, PfeBookRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PfeBookService {
  private apiUrl = `${environment.apiUrl}/pfe-books`;

  constructor(private http: HttpClient) {}

  getAllBooks(skip: number = 0, limit: number = 100): Observable<PfeBook[]> {
    return this.http.get<PfeBook[]>(`${this.apiUrl}?skip=${skip}&limit=${limit}`);
  }

  getBookById(id: number): Observable<PfeBook> {
    return this.http.get<PfeBook>(`${this.apiUrl}/${id}`);
  }

  createBook(data: PfeBookRequest): Observable<PfeBook> {
    return this.http.post<PfeBook>(this.apiUrl, data);
  }

  updateBook(id: number, data: Partial<PfeBookRequest>): Observable<PfeBook> {
    return this.http.put<PfeBook>(`${this.apiUrl}/${id}`, data);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleLike(id: number): Observable<PfeBook> {
    return this.http.post<PfeBook>(`${this.apiUrl}/${id}/like`, {});
  }

  incrementDownload(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/download`, {});
  }

  incrementView(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/view`, {});
  }

  getPendingBooks(skip: number = 0, limit: number = 100): Observable<PfeBook[]> {
    return this.http.get<PfeBook[]>(`${this.apiUrl}/pending?skip=${skip}&limit=${limit}`);
  }

  approveBook(id: number): Observable<PfeBook> {
    return this.http.post<PfeBook>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectBook(id: number, reason?: string): Observable<PfeBook> {
    return this.http.post<PfeBook>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  getApprovedBooks(skip: number = 0, limit: number = 100): Observable<PfeBook[]> {
    return this.http.get<PfeBook[]>(`${this.apiUrl}/approved?skip=${skip}&limit=${limit}`);
  }
}
