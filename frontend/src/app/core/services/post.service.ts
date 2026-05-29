import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, Comment } from '../models/models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PostService {
  private url = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAllPosts(): Observable<Post[]> { return this.http.get<Post[]>(this.url); }
  getPostsByUser(userId: number): Observable<Post[]> { return this.http.get<Post[]>(`${this.url}/user/${userId}`); }
  uploadPhoto(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.url}/upload`, form);
  }
  createPost(data: { contenu: string; photoUrls?: string[] }): Observable<Post> {
    const user = this.authService.getCurrentUser();
    const payload = { ...data, userName: user ? `${user.prenom} ${user.nom}` : 'Anonymous' };
    return this.http.post<Post>(this.url, payload);
  }
  updatePost(id: number, data: { contenu: string }): Observable<Post> { return this.http.put<Post>(`${this.url}/${id}`, data); }
  deletePost(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  toggleLike(postId: number): Observable<void> { return this.http.post<void>(`${this.url}/${postId}/likes`, {}); }
  getComments(postId: number): Observable<Comment[]> { return this.http.get<Comment[]>(`${this.url}/${postId}/comments`); }
  addComment(postId: number, texte: string): Observable<Comment> {
    const user = this.authService.getCurrentUser();
    const payload = { texte, userName: user ? `${user.prenom} ${user.nom}` : 'Anonymous' };
    return this.http.post<Comment>(`${this.url}/${postId}/comments`, payload);
  }
  deleteComment(commentId: number): Observable<void> { return this.http.delete<void>(`${this.url}/comments/${commentId}`); }

  // Admin moderation
  getPendingPosts(): Observable<Post[]> { return this.http.get<Post[]>(`${this.url}/admin/pending`); }
  approvePost(id: number): Observable<Post> { return this.http.put<Post>(`${this.url}/admin/${id}/approve`, {}); }
  rejectPost(id: number): Observable<Post> { return this.http.put<Post>(`${this.url}/admin/${id}/reject`, {}); }
  adminDeletePost(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/admin/${id}`); }
}

