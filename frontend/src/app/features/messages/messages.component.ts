import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, HostListener } from '@angular/core';
import { MessageService } from '../../core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { Conversation, Message, User } from '../../core/models/models';

@Component({
  selector: 'app-messages',
  template: `
    <div class="messages-layout">

      <!-- ── Conversations list ───────────────────────────────────── -->
      <aside class="conversations-panel">
        <div class="panel-header">
          <h2>Messages</h2>
        </div>

        <div class="user-search">
          <div class="search-input-wrapper">
            <input
              [(ngModel)]="searchQuery"
              type="text"
              placeholder="Search user by name or email..."
              class="input-sm"
              (input)="onSearchInput()"
              (keyup.enter)="onSearchInput()"
            />
            <span class="icon icon-search search-icon"></span>
          </div>

          <!-- Search Results Dropdown -->
          <div class="search-results-overlay glass" *ngIf="searchResults.length > 0 || searchingUsers">
            <div *ngIf="searchingUsers" class="search-status">
              <div class="spinner-sm"></div>
              <span>Searching...</span>
            </div>
            
            <ng-container *ngIf="!searchingUsers">
              <button
                class="search-result-item"
                *ngFor="let user of searchResults"
                (click)="startConversationWith(user)">
                <div class="result-avatar">{{ getInitials(user) }}</div>
                <div class="result-info">
                  <div class="result-name">{{ user.prenom }} {{ user.nom }}</div>
                  <div class="result-email">{{ user.email }}</div>
                </div>
              </button>
              <div *ngIf="searchResults.length === 0 && searchQuery.length >= 2" class="search-status">
                <p>No users found matching "{{ searchQuery }}"</p>
              </div>
            </ng-container>
          </div>
        </div>

        <div *ngIf="loadingConversations" class="empty"><p>Loading...</p></div>

        <div *ngIf="!loadingConversations && conversations.length === 0" class="empty">
          <p>No conversations yet</p>
          <small>Enter a recipient user ID above to start one</small>
        </div>

        <div class="conv-list">
          <button
            class="conv-item"
            *ngFor="let conv of conversations"
            [class.active]="activeConv?.id === conv.id"
            (click)="openConversation(conv)">
            <div class="conv-avatar">
              {{ getInitialsFromText(otherParticipant(conv)) }}
            </div>
            <div class="conv-info">
              <div class="conv-header">
                <span class="conv-name">{{ otherParticipant(conv) }}</span>
                <span class="conv-time" *ngIf="conv.lastMessageAt">{{ conv.lastMessageAt | date:'HH:mm' }}</span>
              </div>
              <div class="conv-preview">{{ conv.lastMessage || (conv.messageCount + ' messages') }}</div>
            </div>
            <div class="unread-badge" *ngIf="conv.unreadCount > 0">{{ conv.unreadCount }}</div>
          </button>
        </div>
      </aside>

      <!-- ── Message thread ──────────────────────────────────────── -->
      <section class="message-thread">

        <!-- Empty state -->
        <div class="thread-empty" *ngIf="!activeConv">
          <div style="font-size:48px">💬</div>
          <p>Select a conversation or enter a recipient user name to start chatting</p>
        </div>

        <ng-container *ngIf="activeConv">
          <!-- Thread header -->
          <div class="thread-header">
            <div class="thread-avatar">{{ getInitialsFromText(otherParticipant(activeConv)) }}</div>
            <div>
              <div class="thread-name">{{ otherParticipant(activeConv) }}</div>
              <div class="thread-sub">Conversation</div>
            </div>
          </div>

          <!-- Messages -->
          <div class="thread-messages" #scrollContainer>
            <div *ngIf="loadingMessages" class="empty"><p>Loading messages...</p></div>

            <div
              class="message-bubble"
              *ngFor="let msg of messages"
              [class.mine]="msg.senderUserId === currentUserId"
              [class.theirs]="msg.senderUserId !== currentUserId">
              <div class="bubble-content">{{ msg.contenu }}</div>
              <div class="bubble-time">{{ msg.createdAt | date:'HH:mm' }}</div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="thread-input-section">
            <div class="modern-input-wrapper">
              <textarea
                [(ngModel)]="newMessage"
                placeholder="Type your message..."
                rows="1"
                #msgInput
                (input)="adjustTextareaHeight(msgInput)"
                (keydown.enter)="handleMessageEnter($event)"
                [disabled]="sending"
              ></textarea>
              <div class="input-controls">
                <div class="tool-group">
                  <button class="icon-tool"><span class="icon icon-smile"></span></button>
                  <button class="icon-tool"><span class="icon icon-paperclip"></span></button>
                </div>
                <button class="send-trigger" (click)="sendMessage()" [disabled]="!newMessage.trim() || sending">
                  <span class="icon icon-send" *ngIf="!sending"></span>
                  <div class="loader-xs" *ngIf="sending"></div>
                </button>
              </div>
            </div>
          </div>
        </ng-container>
      </section>

      <!-- ── Online Users panel ────────────────────────────────────── -->
      <aside class="online-panel">
        <div class="panel-header">
          <h2>Online Users</h2>
        </div>
        <div class="online-list">
          <div *ngIf="loadingOnline" class="empty"><p>Loading...</p></div>
          <div *ngIf="!loadingOnline && onlineUsers.length <= 1" class="empty">
            <p>No one else is online right now</p>
          </div>
          <button
            class="online-item"
            *ngFor="let user of onlineUsers"
            [hidden]="user.id === currentUserId"
            (click)="startConversationWith(user)">
            <div class="online-status"></div>
            <div class="online-avatar">{{ getInitials(user) }}</div>
            <div class="online-name">{{ user.prenom }} {{ user.nom }}</div>
            <span class="icon icon-message-square"></span>
          </button>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .messages-layout {
      display: grid;
      grid-template-columns: 300px 1fr 260px;
      height: calc(100vh - 32px);
      overflow: hidden;
    }

    /* Conversations panel */
    .conversations-panel {
      background: var(--dark2);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .panel-header {
      padding: 20px 16px 12px;
      border-bottom: 1px solid var(--border);
    }
    .panel-header h2 { margin: 0; font-size: 16px; font-family: 'Syne', sans-serif; }

    .user-search {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      position: relative;
    }
    .search-input-wrapper { position: relative; }
    .search-icon {
      position: absolute; right: 12px; top: 50%;
      transform: translateY(-50%); opacity: 0.4;
    }
    .input-sm {
      width: 100%; padding: 8px 32px 8px 12px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--dark);
    }

    .search-results-overlay {
      position: absolute; top: 100%; left: 8px; right: 8px;
      background: rgba(26, 26, 26, 0.95);
      border: 1px solid var(--border);
      border-radius: 12px; z-index: 100;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6);
      max-height: 350px; overflow-y: auto; margin-top: 8px;
      padding: 6px;
    }
    .search-results-overlay.glass {
      backdrop-filter: blur(12px);
    }
    .search-status {
      padding: 20px; text-align: center; color: var(--text-muted);
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      font-size: 13px;
    }
    .spinner-sm {
      width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.1);
      border-top-color: var(--red); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .search-result-item {
      width: 100%; display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; border: none; background: none; cursor: pointer;
      text-align: left; border-radius: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      color: var(--text); margin-bottom: 2px;
    }
    .search-result-item:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateX(4px);
    }
    .result-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--red); color: #fff; display: flex;
      align-items: center; justify-content: center; font-size: 11px;
      font-weight: 700; flex-shrink: 0;
    }
    .result-name { font-size: 13px; font-weight: 600; }
    .result-email { font-size: 11px; color: var(--text-muted); }

    .conv-list { flex: 1; overflow-y: auto; }
    .conv-item {
      width: 100%; display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border: none; background: none; cursor: pointer;
      text-align: left; border-bottom: 1px solid rgba(255,255,255,0.04);
      transition: background 0.15s; color: var(--text);
    }
    .conv-item:hover, .conv-item.active { background: rgba(255,255,255,0.06); }
    .conv-avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, var(--red), #ff5252);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
      flex-shrink: 0; box-shadow: 0 4px 12px rgba(229, 9, 20, 0.2);
    }
    .conv-info { flex: 1; min-width: 0; padding-left: 4px; }
    .conv-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
    .conv-name { font-weight: 600; font-size: 14px; color: var(--white); }
    .conv-time { font-size: 11px; color: var(--text-muted); opacity: 0.7; }
    .conv-preview {
      font-size: 13px; color: var(--text-muted);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      max-width: 180px;
    }
    .unread-badge {
      background: var(--red); color: white; min-width: 18px; height: 18px;
      border-radius: 9px; display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; padding: 0 4px; box-shadow: 0 2px 6px rgba(229, 9, 20, 0.4);
    }

    /* Thread */
    .message-thread {
      display: flex; flex-direction: column; overflow: hidden;
    }
    .thread-empty {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 12px; color: var(--text-muted);
    }
    .thread-header {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 20px; border-bottom: 1px solid var(--border);
      background: var(--dark2);
    }
    .thread-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--red); color: #fff; display: flex;
      align-items: center; justify-content: center;
      font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
    }
    .thread-name { font-weight: 600; font-size: 15px; }
    .thread-sub { font-size: 12px; color: var(--text-muted); }

    .thread-messages {
      flex: 1; overflow-y: auto; padding: 20px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .message-bubble { display: flex; flex-direction: column; max-width: 65%; }
    .message-bubble.mine { align-self: flex-end; align-items: flex-end; }
    .message-bubble.theirs { align-self: flex-start; align-items: flex-start; }
    .bubble-content {
      padding: 10px 14px; border-radius: 16px;
      font-size: 14px; line-height: 1.5;
    }
    .mine .bubble-content {
      background: var(--red); color: #fff;
      border-bottom-right-radius: 4px;
    }
    .theirs .bubble-content {
      background: #2a2a2a; border: 1px solid rgba(255,255,255,0.08);
      border-bottom-left-radius: 4px; color: #e0e0e0;
    }
    .bubble-time { font-size: 10px; color: var(--text-muted); margin-top: 5px; opacity: 0.6; }
 
    /* Modern Thread Input */
    .thread-input-section {
      padding: 24px; border-top: 1px solid var(--border);
      background: var(--dark-lighter);
    }
    .modern-input-wrapper {
      background: #1a1a1a; border: 1px solid var(--border);
      border-radius: 20px; padding: 14px 18px; display: flex; flex-direction: column;
      gap: 12px; transition: all 0.3s ease;
    }
    .modern-input-wrapper:focus-within {
      border-color: rgba(229, 9, 20, 0.5);
      box-shadow: 0 0 0 4px rgba(229, 9, 20, 0.1);
    }
    .modern-input-wrapper textarea {
      width: 100%; background: none; border: none; color: var(--white);
      font-size: 15px; line-height: 1.6; resize: none; max-height: 180px;
      padding: 0; outline: none; font-family: inherit;
    }
    .input-controls {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.04);
    }
    .tool-group { display: flex; gap: 10px; }
    .icon-tool {
      background: none; border: none; color: var(--text-muted);
      cursor: pointer; padding: 8px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .icon-tool:hover { background: rgba(255,255,255,0.06); color: var(--white); }
    .send-trigger {
      background: var(--red); color: white; border: none;
      border-radius: 12px; width: 42px; height: 42px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .send-trigger:hover:not(:disabled) { transform: translateY(-2px) scale(1.05); box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4); }
    .send-trigger:active { transform: translateY(0) scale(0.95); }
    .send-trigger:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
 
    .loader-xs {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    }

    /* Online panel */
    .online-panel {
      background: var(--dark2);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .online-list { flex: 1; overflow-y: auto; padding: 8px 0; }
    .online-item {
      width: 100%; display: flex; align-items: center; gap: 10px;
      padding: 10px 16px; border: none; background: none; cursor: pointer;
      text-align: left; transition: background 0.15s; color: var(--text);
    }
    .online-item:hover { background: rgba(255,255,255,0.06); }
    .online-status {
      width: 8px; height: 8px; border-radius: 50%;
      background: #4caf50; flex-shrink: 0;
      box-shadow: 0 0 8px rgba(76, 175, 80, 0.4);
      position: relative;
    }
    .online-status::after {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 50%; background: inherit;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.8; }
      70% { transform: scale(2.5); opacity: 0; }
      100% { transform: scale(1); opacity: 0; }
    }
    .online-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--dark); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600; flex-shrink: 0;
    }
    .online-name { flex: 1; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .online-item .icon { font-size: 14px; opacity: 0.4; }
    .online-item:hover .icon { opacity: 1; color: var(--red); }

    @media (max-width: 1100px) {
      .messages-layout { grid-template-columns: 300px 1fr; }
      .online-panel { display: none; }
    }

    @media (max-width: 768px) {
      .messages-layout {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(220px, 38vh) 1fr;
        height: calc(100vh - 16px);
      }
      .conversations-panel {
        display: flex;
        border-right: 0;
        border-bottom: 1px solid var(--border);
      }
      .thread-input { padding: 12px; }
      .message-bubble { max-width: 86%; }
    }
  `]
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  conversations: Conversation[] = [];
  messages: Message[] = [];
  onlineUsers: User[] = [];
  activeConv: Conversation | null = null;
  currentUserId: number | null = null;
  loadingConversations = true;
  loadingMessages = false;
  loadingOnline = true;
  searchingUsers = false;
  sending = false;
  newMessage = '';
  searchQuery = '';
  searchResults: User[] = [];
  newRecipientId: number | null = null;
  userCache = new Map<number, string>();
  private searchTimeout: any;
  private shouldScroll = false;

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id ?? null;
    this.loadConversations();
    this.loadOnlineUsers();
    const token = this.authService.getToken();
    if (token) {
      this.messageService.connectWebSocket(token, (msg: Message) => {
        if (this.activeConv && msg.conversationId === this.activeConv.id) {
          this.messages.push(msg);
          this.shouldScroll = true;
        } else {
          // Increment unread badge for the relevant conversation
          const conv = this.conversations.find(c => c.id === msg.conversationId);
          if (conv) conv.unreadCount++;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.messageService.disconnectWebSocket();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadConversations(openConversationId?: string | number): void {
    this.messageService.getConversations().subscribe({
      next: convs => {
        this.conversations = convs;
        this.loadingConversations = false;

        // Resolve names for all participants
        const idsToFetch = new Set<number>();
        convs.forEach(c => {
          if (c.participant1Name) {
            idsToFetch.add(Number(c.participant1Name));
          }
          if (c.participant2Name) {
            idsToFetch.add(Number(c.participant2Name));
          }
        });

        if (idsToFetch.size > 0) {
          console.log('Fetching names for IDs:', Array.from(idsToFetch));
          this.authService.getUsersByIds(Array.from(idsToFetch)).subscribe({
            next: users => {
              console.log('Received users:', users);
              users.forEach(u => {
                const fullName = `${u.prenom} ${u.nom}`;
                // Convert both to number for consistent comparison
                const userId = Number(u.id);
                this.userCache.set(userId, fullName);

                // Convert both to number when comparing
                if (!this.onlineUsers.find(ou => Number(ou.id) === userId)) {
                  this.onlineUsers.push(u);
                }
              });
            },
            error: err => console.error('Error fetching user names:', err)
          });
        }

        if (openConversationId) {
          const conv = convs.find(c => c.participant1Name === openConversationId);
          if (conv) this.openConversation(conv);
        }
      },
      error: () => { this.loadingConversations = false; }
    });
  }

  openConversation(conv: Conversation): void {
    this.activeConv = conv;
    this.loadingMessages = true;
    this.messageService.getMessages(conv.id).subscribe({
      next: msgs => {
        this.messages = msgs;
        this.loadingMessages = false;
        this.shouldScroll = true;
        if (conv.unreadCount > 0) {
          this.messageService.markAsRead(conv.id).subscribe(() => { conv.unreadCount = 0; });
        }
      },
      error: () => { this.loadingMessages = false; }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.activeConv) return;
    this.sending = true;
    const recipientId = this.otherParticipantId(this.activeConv);
    this.messageService.sendMessage(recipientId, this.newMessage).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage = '';
        this.sending = false;
        this.shouldScroll = true;
      },
      error: () => { this.sending = false; }
    });
  }

  handleMessageEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) return;
    keyboardEvent.preventDefault();
    this.sendMessage();
  }

  startConversation(): void {
    if (!this.newRecipientId) return;
    this.startConversationWith({ id: this.newRecipientId } as any);
  }

  startConversationWith(user: User): void {
    this.searchResults = [];
    this.searchQuery = '';

    const existing = this.conversations.find(c => this.otherParticipantId(c) === user.id);
    if (existing) {
      this.openConversation(existing);
      return;
    }

    this.sending = true;
    this.messageService.sendMessage(user.id, 'Bonjour !').subscribe({
      next: msg => {
        this.newRecipientId = null;
        this.sending = false;
        this.loadConversations(msg.conversationId);
      },
      error: () => { this.sending = false; }
    });
  }

  loadOnlineUsers(): void {
    this.loadingOnline = true;
    this.authService.getOnlineUsers().subscribe({
      next: users => {
        // Merge into onlineUsers without losing names from cache
        users.forEach(u => {
          this.userCache.set(Number(u.id), `${u.prenom} ${u.nom}`);
          if (!this.onlineUsers.find(ou => ou.id === u.id)) {
            this.onlineUsers.push(u);
          }
        });
        this.loadingOnline = false;
      },
      error: () => { this.loadingOnline = false; }
    });
  }

  onSearchInput(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      this.searchingUsers = false;
      return;
    }

    this.searchingUsers = true;
    this.searchTimeout = setTimeout(() => {
      this.authService.searchUsers(this.searchQuery).subscribe({
        next: users => {
          this.searchResults = users.filter(u => u.id !== this.currentUserId);
          this.searchingUsers = false;
        },
        error: () => {
          this.searchingUsers = false;
        }
      });
    }, 400); // Debounce
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-search')) {
      this.searchResults = [];
      this.searchingUsers = false;
    }
  }

  getInitials(user: User): string {
    return (user.prenom?.[0] || '') + (user.nom?.[0] || '');
  }

  getInitialsFromText(text: string): string {
    if (text.startsWith('#')) return text;
    const parts = text.split(' ');
    if (parts.length >= 2) return (parts[0][0] || '') + (parts[1][0] || '');
    return text[0] || '';
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  otherParticipantId(conv: Conversation): number {
    const p1 = Number(conv.participant1UserId);
    const p2 = Number(conv.participant2UserId);
    const current = Number(this.currentUserId);
    return p1 === current ? p2 : p1;
  }

  otherParticipant(conv: Conversation): string {
    const isP1 = Number(conv.participant1UserId) === Number(this.currentUserId);
    return isP1 ? (conv.participant2Name || '#' + conv.participant2UserId)
      : (conv.participant1Name || '#' + conv.participant1UserId);
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch { /* ignore */ }
  }
}
