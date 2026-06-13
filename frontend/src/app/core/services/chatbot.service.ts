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

export interface ChatStreamEvent {
  delta?: string;
  done?: boolean;
  engine?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private url = `${environment.apiUrl}/chatbot`;

  constructor(private http: HttpClient) {}

  chat(payload: ChatPayload): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.url}/chat`, payload);
  }

  /**
   * ChatGPT-style streaming via Server-Sent Events.
   * Emits {delta} chunks as the model generates, then {done, engine}.
   * Unsubscribing aborts the request (stop generation).
   */
  chatStream(payload: ChatPayload): Observable<ChatStreamEvent> {
    return new Observable<ChatStreamEvent>(observer => {
      const controller = new AbortController();

      fetch(`${this.url}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).then(async res => {
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';
          for (const evt of events) {
            const dataLine = evt.split('\n').find(l => l.startsWith('data:'));
            if (!dataLine) continue;
            try {
              observer.next(JSON.parse(dataLine.slice(5).trim()) as ChatStreamEvent);
            } catch { /* skip malformed chunk */ }
          }
        }
        observer.complete();
      }).catch(err => {
        if (err?.name !== 'AbortError') observer.error(err);
        else observer.complete();
      });

      return () => controller.abort();
    });
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
