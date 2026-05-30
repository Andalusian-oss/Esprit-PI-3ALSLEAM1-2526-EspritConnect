import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { MessageService } from './core/services/message.service';
import { Router } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { ChatbotService } from './core/services/chatbot.service';
import { LanguageService } from './core/services/language.service';
import { User, UserRole, ChatMessage } from './core/models/models';
import { Subscription, interval, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  styles: [`
    .nav-badge {
      margin-left: auto;
      background: var(--red);
      color: #fff;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      padding: 0 4px;
    }

    /* ── Notifications bell ── */
    .notif-bell-wrap {
      position: relative;
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
    }
    .notif-bell-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      padding: 6px 8px;
      border-radius: 8px;
      transition: var(--transition);
      width: 100%;
      &:hover { background: var(--dark3); }
    }
    .notif-badge {
      background: var(--red);
      color: #fff;
      min-width: 17px;
      height: 17px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      padding: 0 4px;
      margin-left: auto;
    }
    .notif-dropdown {
      position: absolute;
      left: 100%;
      top: 0;
      z-index: 200;
      width: 300px;
      background: var(--dark2);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.4);
      overflow: hidden;
      animation: fadeIn 0.15s ease;
    }
    .notif-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      font-weight: 700;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .notif-list { max-height: 320px; overflow-y: auto; }
    .notif-item {
      display: flex;
      gap: 10px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: var(--transition);
      &:hover { background: var(--dark3); }
      &.unread { border-left: 3px solid var(--red); }
    }
    .notif-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--red);
      flex-shrink: 0;
      margin-top: 4px;
    }
    .notif-text { font-size: 12px; color: var(--text-muted); line-height: 1.5; }
    .notif-time { font-size: 10px; color: var(--text-dim); margin-top: 2px; }
    .notif-empty { padding: 20px; text-align: center; color: var(--text-dim); font-size: 13px; }
    .notif-footer { padding: 10px 16px; text-align: center; border-top: 1px solid var(--border); }
    .notif-footer button { font-size: 12px; color: var(--accent-cyan); background: none; border: none; cursor: pointer; }

    .chatbot-fab {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 400;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--red), #ff4a5b);
      border: none;
      box-shadow: 0 8px 24px rgba(225,29,46,0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
      color: white;
    }
    .chatbot-fab:hover { transform: scale(1.08); box-shadow: 0 12px 32px rgba(225,29,46,0.5); }
    .chatbot-fab .icon { width: 24px; height: 24px; color: white; }

    .chatbot-panel {
      position: fixed;
      right: 24px;
      bottom: 90px;
      z-index: 400;
      width: 360px;
      max-height: 520px;
      background: var(--dark2);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: var(--shadow), 0 16px 48px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.25s cubic-bezier(0.4,0,0.2,1);
    }

    .chatbot-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--red-glow);
    }
    .chatbot-header .bot-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, var(--red), #ff4a5b);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .chatbot-header .bot-avatar .icon { width: 16px; height: 16px; color: white; }
    .chatbot-header .bot-name { font-weight: 700; font-size: 14px; flex: 1; }
    .chatbot-header .bot-status { font-size: 11px; color: #3ddc84; }
    .chatbot-header .btn-icon { margin-left: auto; }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: var(--dark2);
    }

    .chat-msg {
      max-width: 85%;
      animation: fadeIn 0.2s ease;
    }
    .chat-msg-user {
      align-self: flex-end;
      .bubble { background: var(--red); color: white; border-radius: 16px 16px 4px 16px; }
    }
    .chat-msg-bot {
      align-self: flex-start;
      .bubble { background: var(--dark3); border-radius: 4px 16px 16px 16px; }
    }
    .bubble {
      padding: 10px 13px;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .chat-time { font-size: 10px; color: var(--text-dim); margin-top: 3px; padding: 0 4px; }

    .chatbot-typing {
      align-self: flex-start;
      padding: 10px 14px;
      background: var(--dark3);
      border-radius: 4px 16px 16px 16px;
      font-size: 13px;
      color: var(--text-muted);
      animation: fadeIn 0.2s ease;
    }

    .chatbot-input {
      padding: 12px;
      border-top: 1px solid var(--border);
      background: var(--dark2);
      display: flex;
      gap: 8px;
      input {
        flex: 1;
        border-radius: 20px;
        padding: 9px 14px;
        font-size: 13px;
        background: var(--dark3);
        border: 1px solid var(--border);
        color: var(--text);
        outline: none;
        transition: var(--transition);
        &:focus { border-color: var(--accent-cyan); box-shadow: 0 0 0 3px rgba(56,214,199,0.12); }
      }
      button {
        width: 36px; height: 36px;
        border-radius: 50%;
        background: var(--red);
        border: none;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: var(--transition);
        &:hover { background: var(--red-light); }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        .icon { width: 16px; height: 16px; color: white; }
      }
    }

    .chatbot-welcome {
      text-align: center;
      padding: 20px 12px 10px;
      color: var(--text-muted);
      font-size: 13px;
      line-height: 1.6;
    }
    .chatbot-welcome strong { display: block; font-family: 'Syne', sans-serif; font-size: 15px; color: var(--text); margin-bottom: 4px; }

    .quick-chips {
      display: flex; flex-wrap: wrap; gap: 6px; padding: 0 12px 10px;
    }
    .quick-chip {
      background: rgba(56,214,199,0.08);
      border: 1px solid rgba(56,214,199,0.2);
      color: var(--accent-cyan);
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
      transition: var(--transition);
      &:hover { background: rgba(56,214,199,0.15); }
    }

    @media (max-width: 480px) {
      .chatbot-panel { width: calc(100vw - 16px); right: 8px; bottom: 80px; }
      .chatbot-fab { right: 16px; bottom: 16px; }
    }
  `],
  template: `
    <!-- Sidebar layout -->
    <div class="app-layout" [class.no-sidebar]="!authService.isLoggedIn()">

      <!-- ── SIDEBAR ── -->
      <aside class="sidebar" *ngIf="authService.isLoggedIn()">
        <!-- Brand -->
        <div class="sidebar-brand">
          <span class="brand-mark">EC</span>
          <span class="brand-text">Esprit<span>Connect</span></span>
        </div>

        <!-- User card -->
        <div class="sidebar-user" *ngIf="user">
          <div class="avatar-wrap">
            <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" class="avatar" alt="avatar" />
            <div *ngIf="!user.avatarUrl" class="avatar avatar-initials">
              {{ user.prenom[0] }}{{ user.nom[0] }}
            </div>
            <span class="online-dot" [class.online]="user.online"></span>
          </div>
          <div class="user-info">
            <strong>{{ user.prenom }} {{ user.nom }}</strong>
            <span class="role-badge role-badge-{{ user.role.toLowerCase() }}">{{ roleLabel }}</span>
          </div>
        </div>

        <!-- Notifications bell -->
        <div class="notif-bell-wrap" (click)="toggleNotifications()" (clickOutside)="notifOpen=false">
          <button class="notif-bell-btn" type="button" aria-label="Notifications">
            <span class="icon icon-bell"></span>
            <span>{{ lang.t('nav.notifications') }}</span>
            <span class="notif-badge" *ngIf="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </button>
          <div class="notif-dropdown" *ngIf="notifOpen" (click)="$event.stopPropagation()">
            <div class="notif-header">
              <span>{{ lang.t('nav.notifications') }}</span>
              <button type="button" (click)="markAllRead()" *ngIf="unreadCount > 0" style="font-size:11px;color:var(--accent-cyan);background:none;border:none;cursor:pointer;">{{ lang.t('nav.markAllRead') }}</button>
            </div>
            <div class="notif-list">
              <div *ngIf="recentNotifications.length === 0" class="notif-empty">{{ lang.t('nav.noNotif') }}</div>
              <div *ngFor="let n of recentNotifications"
                   class="notif-item"
                   [class.unread]="!n.read"
                   (click)="openNotification(n)">
                <div class="notif-dot" *ngIf="!n.read"></div>
                <div style="flex:1">
                  <div class="notif-text">{{ n.content }}</div>
                  <div class="notif-time">{{ n.createdAt | date:'dd/MM HH:mm' }}</div>
                </div>
              </div>
            </div>
            <div class="notif-footer" *ngIf="recentNotifications.length > 0">
              <button type="button" (click)="goToMessages()">{{ lang.t('nav.viewAll') }}</button>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <ng-container *ngFor="let item of navItems">
            <a *ngIf="canSee(item.roles)"
               [routerLink]="item.path"
               routerLinkActive="active"
               class="nav-item">
              <span class="icon {{ item.icon }}"></span>
              <span>{{ lang.t(item.labelKey) }}</span>
              <span class="nav-badge" *ngIf="item.path === '/messages' && unreadCount > 0">{{ unreadCount }}</span>
            </a>
          </ng-container>
        </nav>

        <!-- Language switch -->
        <button class="sidebar-logout sidebar-theme-btn" type="button" (click)="lang.toggle()" [title]="lang.current === 'fr' ? 'Switch to English' : 'Passer en français'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="flex-shrink:0">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span>{{ lang.current === 'fr' ? 'English' : 'Français' }}</span>
        </button>

        <!-- Theme switch -->
        <button class="sidebar-logout sidebar-theme-btn" type="button" (click)="toggleTheme()" [title]="themeToggleLabel">
          <span class="icon" [ngClass]="theme === 'dark' ? 'icon-sun' : 'icon-moon'"></span>
          <span>{{ theme === 'dark' ? lang.t('nav.lightMode') : lang.t('nav.darkMode') }}</span>
        </button>

        <!-- Logout -->
        <button class="sidebar-logout" (click)="logout()">
          <span class="icon icon-log-out"></span>
          <span>{{ lang.t('nav.signOut') }}</span>
        </button>
      </aside>

      <!-- ── MAIN CONTENT ── -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Toast stack -->
    <div class="toast-stack">
      <button
        class="toast"
        *ngFor="let toast of notifications.toasts$ | async"
        [ngClass]="'toast-' + toast.type"
        (click)="notifications.dismiss(toast.id)"
        type="button">
        <span class="icon" [ngClass]="toast.type === 'success' ? 'icon-check' : toast.type === 'error' ? 'icon-alert' : 'icon-message'"></span>
        {{ toast.message }}
      </button>
    </div>

    <!-- ── AI CHATBOT ── -->
    <ng-container *ngIf="authService.isLoggedIn()">

      <!-- Floating button -->
      <button class="chatbot-fab" (click)="toggleChat()" [attr.aria-label]="chatOpen ? 'Close chat' : 'Open AI assistant'">
        <span class="icon" [ngClass]="chatOpen ? 'icon-x' : 'icon-message-circle'"></span>
      </button>

      <!-- Chat panel -->
      <div class="chatbot-panel" *ngIf="chatOpen">
        <div class="chatbot-header">
          <div class="bot-avatar"><span class="icon icon-shield"></span></div>
          <div>
            <div class="bot-name">{{ lang.t('chat.title') }}</div>
            <div class="bot-status">{{ lang.t('chat.status') }}</div>
          </div>
          <button class="btn btn-icon" (click)="chatOpen = false"><span class="icon icon-x"></span></button>
        </div>

        <div class="chatbot-messages" #chatMessages>
          <div class="chatbot-welcome" *ngIf="chatHistory.length === 0">
            <strong>{{ lang.t('chat.welcome.title') }}</strong>
            {{ lang.t('chat.welcome.body') }}
          </div>

          <!-- Quick chips (show only when empty) -->
          <div class="quick-chips" *ngIf="chatHistory.length === 0">
            <button class="quick-chip" (click)="sendQuick(lang.t('chat.chips.job'))">{{ lang.t('chat.chips.job') }}</button>
            <button class="quick-chip" (click)="sendQuick(lang.t('chat.chips.resources'))">{{ lang.t('chat.chips.resources') }}</button>
            <button class="quick-chip" (click)="sendQuick(lang.t('chat.chips.mentor'))">{{ lang.t('chat.chips.mentor') }}</button>
            <button class="quick-chip" (click)="sendQuick(lang.t('chat.chips.events'))">{{ lang.t('chat.chips.events') }}</button>
          </div>

          <div *ngFor="let msg of chatHistory"
               class="chat-msg"
               [ngClass]="msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'">
            <div class="bubble">{{ msg.content }}</div>
            <div class="chat-time">{{ msg.timestamp | date:'HH:mm' }}</div>
          </div>

          <div class="chatbot-typing" *ngIf="botTyping">{{ lang.t('chat.thinking') }}</div>
        </div>

        <div class="chatbot-input">
          <input
            [(ngModel)]="chatInput"
            [placeholder]="lang.t('chat.placeholder')"
            (keydown.enter)="sendMessage()"
            [disabled]="botTyping"
            maxlength="500"
          />
          <button (click)="sendMessage()" [disabled]="!chatInput.trim() || botTyping">
            <span class="icon icon-send"></span>
          </button>
        </div>
      </div>
    </ng-container>
  `
})
export class AppComponent implements OnInit, OnDestroy {

  unreadCount = 0;
  notifOpen = false;
  recentNotifications: any[] = [];
  private pollSub?: Subscription;

  // Chatbot state
  chatOpen = false;
  chatInput = '';
  chatHistory: ChatMessage[] = [];
  botTyping = false;
  quickChips: string[] = [];

  navItems: { path: string; labelKey: string; icon: string; roles: UserRole[] | null }[] = [
    { path: '/feed',      labelKey: 'nav.feed',      icon: 'icon-home',      roles: ['STUDENT', 'ENSEIGNANT', 'ALUMNI', 'EMPLOYE', 'ADMIN', 'MENTOR'] },
    { path: '/events',    labelKey: 'nav.events',    icon: 'icon-calendar',  roles: ['STUDENT', 'ENSEIGNANT', 'ALUMNI', 'EMPLOYE', 'ADMIN', 'MENTOR'] },
    { path: '/jobs',      labelKey: 'nav.jobs',      icon: 'icon-briefcase', roles: ['STUDENT', 'ALUMNI', 'EMPLOYE', 'ADMIN', 'MENTOR', 'COMPANY'] },
    { path: '/mentoring', labelKey: 'nav.mentoring', icon: 'icon-mentoring', roles: ['STUDENT', 'ENSEIGNANT', 'ALUMNI', 'EMPLOYE', 'ADMIN', 'MENTOR'] },
    { path: '/pfe-books', labelKey: 'nav.pfeBooks', icon: 'icon-book',      roles: ['STUDENT', 'ALUMNI', 'ADMIN', 'COMPANY'] },
    { path: '/resources', labelKey: 'nav.resources', icon: 'icon-book',      roles: null },
    { path: '/messages',  labelKey: 'nav.messages',  icon: 'icon-message',   roles: ['STUDENT', 'ENSEIGNANT', 'ALUMNI', 'EMPLOYE', 'ADMIN', 'MENTOR', 'COMPANY'] },
    { path: '/profile',   labelKey: 'nav.profile',   icon: 'icon-user',      roles: null },
    { path: '/rh',        labelKey: 'nav.rh',        icon: 'icon-users',     roles: ['COMPANY'] },
    { path: '/admin',     labelKey: 'nav.admin',     icon: 'icon-shield',    roles: ['ADMIN'] },
  ];

  constructor(
    public authService: AuthService,
    public notifications: NotificationService,
    public lang: LanguageService,
    private messageService: MessageService,
    private chatbotService: ChatbotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initTheme();

    this.pollSub = interval(30000).pipe(
      switchMap(() => {
        if (!this.authService.isLoggedIn()) return of(0);
        return this.messageService.getUnreadNotificationCount();
      })
    ).subscribe({ next: count => { this.unreadCount = count; }, error: () => {} });

    if (this.authService.isLoggedIn()) {
      this.messageService.getUnreadNotificationCount().subscribe({
        next: count => { this.unreadCount = count; }, error: () => {}
      });
    }
  }

  ngOnDestroy(): void { this.pollSub?.unsubscribe(); }

  get user(): User | null { return this.authService.getCurrentUser(); }

  theme: 'dark' | 'light' = 'dark';

  get roleLabel(): string {
    const map: Record<UserRole, string> = {
      STUDENT: 'Étudiant', ENSEIGNANT: 'Enseignant', ALUMNI: 'Alumni',
      EMPLOYE: 'Employé', COMPANY: 'Entreprise', ADMIN: 'Admin', MENTOR: 'Mentor'
    };
    return this.user ? map[this.user.role] ?? this.user.role : '';
  }

  get themeToggleLabel(): string {
    return this.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }

  canSee(roles: UserRole[] | null): boolean {
    if (!roles) return true;
    const r = this.user?.role;
    return !!r && roles.includes(r);
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
  }

  private applyTheme(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('light-theme', this.theme === 'light');
    }
    localStorage.setItem('app-theme', this.theme);
  }

  private initTheme(): void {
    const saved = localStorage.getItem('app-theme');
    this.theme = saved === 'light' ? 'light' : 'dark';
    this.applyTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // ── Notifications bell ───────────────────────────────────────────────────

  toggleNotifications(): void {
    this.notifOpen = !this.notifOpen;
    if (this.notifOpen) {
      this.messageService.getNotifications().subscribe({
        next: ns => { this.recentNotifications = ns.slice(0, 10); },
        error: () => {}
      });
    }
  }

  markAllRead(): void {
    const unread = this.recentNotifications.filter(n => !n.read);
    unread.forEach(n => {
      this.messageService.markNotificationRead(n.id).subscribe({ error: () => {} });
      n.read = true;
    });
    this.unreadCount = 0;
  }

  openNotification(n: any): void {
    if (!n.read) {
      this.messageService.markNotificationRead(n.id).subscribe({ error: () => {} });
      n.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
    this.notifOpen = false;
    this.router.navigate(['/messages']);
  }

  goToMessages(): void {
    this.notifOpen = false;
    this.router.navigate(['/messages']);
  }

  // ── Chatbot ──────────────────────────────────────────────────────────────

  toggleChat(): void { this.chatOpen = !this.chatOpen; }

  sendQuick(text: string): void { this.chatInput = text; this.sendMessage(); }

  sendMessage(): void {
    const text = this.chatInput.trim();
    if (!text || this.botTyping) return;

    this.chatHistory.push({ role: 'user', content: text, timestamp: new Date() });
    this.chatInput = '';
    this.botTyping = true;

    const history = this.chatHistory.slice(-8).map(m => ({ role: m.role, content: m.content }));
    this.chatbotService.chat({
      message: text,
      history,
      user_role: this.user?.role
    }).subscribe({
      next: (res) => {
        this.chatHistory.push({ role: 'assistant', content: res.response, timestamp: new Date() });
        this.botTyping = false;
      },
      error: () => {
        this.chatHistory.push({
          role: 'assistant',
          content: 'Sorry, I\'m temporarily unavailable. Please try again later.',
          timestamp: new Date()
        });
        this.botTyping = false;
      }
    });
  }
}
