import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resource, ResourceRequest, ResourceCategory, ResourceType } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private url = `${environment.apiUrl}/resources`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Resource[]> { return this.http.get<Resource[]>(this.url); }
  getById(id: number): Observable<Resource> { return this.http.get<Resource>(`${this.url}/${id}`); }
  getByCategory(categorie: ResourceCategory): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.url}/category/${categorie}`);
  }
  getByType(type: ResourceType): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.url}/type/${type}`);
  }
  create(data: ResourceRequest): Observable<Resource> { return this.http.post<Resource>(this.url, data); }
  update(id: number, data: ResourceRequest): Observable<Resource> { return this.http.put<Resource>(`${this.url}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  toggleLike(id: number): Observable<Resource> { return this.http.post<Resource>(`${this.url}/${id}/like`, {}); }
  incrementDownload(id: number): Observable<Resource> { return this.http.post<Resource>(`${this.url}/${id}/download`, {}); }
  incrementView(id: number): Observable<Resource> { return this.http.post<Resource>(`${this.url}/${id}/view`, {}); }
  uploadFile(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.url}/upload`, form);
  }
  /**
   * Fetch an uploaded file (e.g. PDF) as a Blob through HttpClient so the JWT
   * interceptor attaches the Authorization header. A plain window.open() on the
   * file URL would navigate without the token and the secured endpoint returns 401.
   */
  fetchFile(fileUrl: string): Observable<Blob> {
    return this.http.get(fileUrl, { responseType: 'blob' });
  }
}
