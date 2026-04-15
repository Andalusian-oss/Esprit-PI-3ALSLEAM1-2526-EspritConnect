import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, Conversation, Notification } from '../models/models';
import { environment } from '../../../environments/environment';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private url = `${environment.apiUrl}/messages`;
  private stompClient: Client | null = null;

  constructor(private http: HttpClient) {}

  sendMessage(recipientUserId: number, contenu: string): Observable<Message> {
    return this.http.post<Message>(this.url, { recipientUserId, contenu });
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.url}/conversations`);
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.url}/conversations/${conversationId}`);
  }

  markAsRead(conversationId: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/conversations/${conversationId}/read`, {});
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.url}/notifications`);
  }

  markNotificationRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/notifications/${id}/read`, {});
  }

  connectWebSocket(token: string, onMessage: (msg: Message) => void): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        this.stompClient?.subscribe('/user/queue/messages', frame => {
          const msg: Message = JSON.parse(frame.body);
          onMessage(msg);
        });
      }
    });
    this.stompClient.activate();
  }

  disconnectWebSocket(): void {
    this.stompClient?.deactivate();
  }
}
