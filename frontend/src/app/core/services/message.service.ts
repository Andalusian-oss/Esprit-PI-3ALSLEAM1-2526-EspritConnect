import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Message, Conversation, Notification, Group, GroupMessage } from '../models/models';
import { environment } from '../../../environments/environment';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private url = `${environment.apiUrl}/messages`;
  private groupUrl = `${environment.apiUrl}/groups`;
  private stompClient: Client | null = null;
  readonly callSignal$ = new Subject<{ type: 'offer' | 'answer' | 'ice' | 'end' | 'reject'; payload: any }>();

  constructor(private http: HttpClient) {}

  // ── Direct messages ────────────────────────────────────────────────────────

  sendMessage(recipientUserId: number, contenu: string): Observable<Message> {
    return this.http.post<Message>(this.url, { recipientUserId, contenu });
  }

  editMessage(messageId: number, contenu: string): Observable<Message> {
    return this.http.patch<Message>(`${this.url}/${messageId}/edit`, { contenu });
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${messageId}`);
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

  deleteConversation(conversationId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/conversations/${conversationId}`);
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.url}/notifications`);
  }

  markNotificationRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/notifications/${id}/read`, {});
  }

  getUnreadNotificationCount(): Observable<number> {
    return this.http.get<number>(`${this.url}/notifications/unread-count`);
  }

  // ── Groups ─────────────────────────────────────────────────────────────────

  createGroup(name: string, memberIds: number[], avatarUrl?: string): Observable<Group> {
    return this.http.post<Group>(this.groupUrl, { name, memberIds, avatarUrl });
  }

  getMyGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.groupUrl);
  }

  getGroup(groupId: number): Observable<Group> {
    return this.http.get<Group>(`${this.groupUrl}/${groupId}`);
  }

  addGroupMember(groupId: number, targetUserId: number): Observable<Group> {
    return this.http.post<Group>(`${this.groupUrl}/${groupId}/members/${targetUserId}`, {});
  }

  removeGroupMember(groupId: number, targetUserId: number): Observable<void> {
    return this.http.delete<void>(`${this.groupUrl}/${groupId}/members/${targetUserId}`);
  }

  deleteGroup(groupId: number): Observable<void> {
    return this.http.delete<void>(`${this.groupUrl}/${groupId}`);
  }

  sendGroupMessage(groupId: number, contenu: string): Observable<GroupMessage> {
    return this.http.post<GroupMessage>(`${this.groupUrl}/${groupId}/messages`, { contenu });
  }

  getGroupMessages(groupId: number): Observable<GroupMessage[]> {
    return this.http.get<GroupMessage[]>(`${this.groupUrl}/${groupId}/messages`);
  }

  editGroupMessage(messageId: number, contenu: string): Observable<GroupMessage> {
    return this.http.patch<GroupMessage>(`${this.groupUrl}/messages/${messageId}/edit`, { contenu });
  }

  deleteGroupMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.groupUrl}/messages/${messageId}`);
  }

  // ── WebSocket ──────────────────────────────────────────────────────────────

  connectWebSocket(
    token: string,
    onDirectMessage: (msg: Message) => void,
    onEditedMessage: (msg: Message) => void,
    onGroupMessage: (msg: GroupMessage) => void,
    onGroupInvite: (group: Group) => void,
    subscribedGroupIds: number[] = []
  ): void {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        this.stompClient?.subscribe('/user/queue/messages', (frame: IMessage) => {
          onDirectMessage(JSON.parse(frame.body));
        });
        this.stompClient?.subscribe('/user/queue/messages/edit', (frame: IMessage) => {
          onEditedMessage(JSON.parse(frame.body));
        });
        this.stompClient?.subscribe('/user/queue/groups/invite', (frame: IMessage) => {
          onGroupInvite(JSON.parse(frame.body));
        });
        subscribedGroupIds.forEach(id => this.subscribeGroup(id, onGroupMessage));
        // WebRTC call signaling
        (['offer', 'answer', 'ice', 'end', 'reject'] as const).forEach(type =>
          this.stompClient?.subscribe(`/user/queue/call/${type}`, (f: IMessage) =>
            this.callSignal$.next({ type, payload: JSON.parse(f.body) })
          )
        );
      }
    });
    this.stompClient.activate();
  }

  subscribeGroup(groupId: number, onGroupMessage: (msg: GroupMessage) => void): void {
    this.stompClient?.subscribe(`/topic/group/${groupId}`, (frame: IMessage) => {
      onGroupMessage(JSON.parse(frame.body));
    });
  }

  sendCallSignal(type: string, toUserId: number, payload: any): void {
    this.stompClient?.publish({
      destination: `/app/call/${type}/${toUserId}`,
      body: JSON.stringify(payload)
    });
  }

  disconnectWebSocket(): void {
    this.stompClient?.deactivate();
  }
}
