import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatResponse } from '../models/models';
import { environment } from '../../../environments/environment';

export interface ChatPayload {
  message: string;
  history: Array<{ role: string; content: string }>;
  user_role?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private url = `${environment.apiUrl}/chatbot`;

  constructor(private http: HttpClient) {}

  chat(payload: ChatPayload): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.url}/chat`, payload);
  }

  analyzeCv(file: File, jobDescription?: string): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    const params: Record<string, string> = {};
    if (jobDescription?.trim()) params['job_description'] = jobDescription.trim();
    return this.http.post<any>(`${environment.apiUrl}/cv-analyzer/analyze`, form, { params });
  }

  analyzeCvByUrl(url: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/cv-analyzer/analyze-url`, { url });
  }
}
