import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, Comment } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PostService {
  private url = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<Post[]> { return this.http.get<Post[]>(this.url); }
  createPost(data: { contenu: string; photoUrls?: string[] }): Observable<Post> { return this.http.post<Post>(this.url, data); }
  updatePost(id: number, data: { contenu: string }): Observable<Post> { return this.http.put<Post>(`${this.url}/${id}`, data); }
  deletePost(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  toggleLike(postId: number): Observable<void> { return this.http.post<void>(`${this.url}/${postId}/likes`, {}); }
  getComments(postId: number): Observable<Comment[]> { return this.http.get<Comment[]>(`${this.url}/${postId}/comments`); }
  addComment(postId: number, texte: string): Observable<Comment> { return this.http.post<Comment>(`${this.url}/${postId}/comments`, { texte }); }
  deleteComment(commentId: number): Observable<void> { return this.http.delete<void>(`${this.url}/comments/${commentId}`); }
}
