import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatbotService } from '../../core/services/chatbot.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { renderMarkdown } from '../../core/utils/markdown';

interface ConvoMessage {
  role: 'user' | 'assistant';
  content: string;
  html?: string;
  ts: number;
  engine?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ConvoMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'ec_assistant_conversations';
const MAX_CONVERSATIONS = 50;

@Component({
  selector: 'app-assistant',
  styles: [`
    :host { display: block; }

    .assistant-page {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--dark2);
    }

    /* ── Conversations sidebar ── */
    .convo-sidebar {
      width: 270px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border);
      background: var(--dark1, var(--dark3));
    }
    .convo-head { padding: 14px 12px 8px; }
    .new-chat-btn {
      width: 100%;
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      &:hover { background: var(--dark3); border-color: var(--accent-cyan); }
      .icon { width: 15px; height: 15px; }
    }
    .convo-list {
      flex: 1;
      overflow-y: auto;
      padding: 6px 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .convo-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-dim);
      padding: 10px 8px 4px;
    }
    .convo-item {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 10px;
      border-radius: 9px;
      cursor: pointer;
      font-size: 13px;
      color: var(--text-muted);
      transition: var(--transition);
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      &:hover { background: var(--dark3); color: var(--text); }
      &.active { background: var(--dark3); color: var(--text); font-weight: 600; }
    }
    .convo-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .convo-del {
      background: none; border: none; cursor: pointer;
      color: var(--text-dim);
      opacity: 0;
      padding: 2px;
      flex-shrink: 0;
      transition: var(--transition);
      .icon { width: 13px; height: 13px; }
      &:hover { color: var(--red); }
    }
    .convo-item:hover .convo-del { opacity: 1; }
    .convo-empty { padding: 18px 12px; font-size: 12px; color: var(--text-dim); text-align: center; }

    /* ── Chat area ── */
    .chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .chat-topbar {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .chat-topbar .bot-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: linear-gradient(135deg, var(--red), #ff4a5b);
      display: flex; align-items: center; justify-content: center;
      .icon { width: 15px; height: 15px; color: #fff; }
    }
    .chat-topbar .bot-name { font-weight: 700; font-size: 14px; }
    .chat-topbar .bot-engine { font-size: 11px; color: var(--text-dim); }

    .chat-scroll {
      flex: 1;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
    .chat-thread {
      max-width: 780px;
      margin: 0 auto;
      padding: 24px 20px 12px;
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    /* ── Empty state ── */
    .chat-empty {
      flex: 1;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 8px;
      padding: 20px;
      text-align: center;
    }
    .chat-empty .big-avatar {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, var(--red), #ff4a5b);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 6px;
      .icon { width: 28px; height: 28px; color: #fff; }
    }
    .chat-empty h2 { font-family: 'Syne', sans-serif; font-size: 22px; margin: 0; color: var(--text); }
    .chat-empty p { color: var(--text-muted); font-size: 14px; margin: 0 0 18px; }
    .suggest-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 260px));
      gap: 10px;
    }
    .suggest-card {
      border: 1px solid var(--border);
      background: var(--dark3);
      border-radius: 12px;
      padding: 13px 15px;
      font-size: 13px;
      color: var(--text-muted);
      cursor: pointer;
      text-align: left;
      transition: var(--transition);
      &:hover { border-color: var(--accent-cyan); color: var(--text); transform: translateY(-1px); }
    }

    /* ── Messages ── */
    .msg-row { display: flex; gap: 12px; }
    .msg-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff;
      margin-top: 2px;
    }
    .msg-avatar.bot { background: linear-gradient(135deg, var(--red), #ff4a5b); .icon { width: 15px; height: 15px; color: #fff; } }
    .msg-avatar.user { background: var(--dark3); border: 1px solid var(--border); color: var(--text); }
    .msg-body { flex: 1; min-width: 0; }
    .msg-author { font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .msg-content {
      font-size: 14px;
      line-height: 1.65;
      color: var(--text);
      word-break: break-word;
    }
    .msg-content .md-p { margin: 0 0 4px; }
    .msg-content .md-gap { height: 8px; }
    .msg-content .md-h { font-weight: 700; font-size: 15px; margin: 10px 0 4px; }
    .msg-content .md-list { margin: 4px 0 8px; padding-left: 22px; }
    .msg-content .md-list li { margin: 3px 0; }
    .msg-content .md-code {
      background: var(--dark3);
      border: 1px solid var(--border);
      border-radius: 5px;
      padding: 1px 6px;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 12.5px;
      color: var(--accent-cyan);
    }
    .msg-content .md-pre {
      background: #0d1117;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
      overflow-x: auto;
      margin: 8px 0;
      code {
        font-family: 'JetBrains Mono', 'Consolas', monospace;
        font-size: 12.5px;
        line-height: 1.6;
        color: #e6edf3;
        background: none;
        white-space: pre;
      }
    }
    .msg-content a { color: var(--accent-cyan); }

    .cursor-blink {
      display: inline-block;
      width: 8px; height: 15px;
      background: var(--text);
      margin-left: 2px;
      vertical-align: text-bottom;
      animation: blink 1s steps(1) infinite;
    }
    @keyframes blink { 50% { opacity: 0; } }

    .msg-actions {
      display: flex; gap: 6px;
      margin-top: 6px;
      opacity: 0;
      transition: var(--transition);
    }
    .msg-row:hover .msg-actions, .msg-actions.always { opacity: 1; }
    .msg-action-btn {
      display: inline-flex; align-items: center; gap: 5px;
      background: none;
      border: 1px solid var(--border);
      border-radius: 7px;
      color: var(--text-dim);
      font-size: 11px;
      padding: 4px 9px;
      cursor: pointer;
      transition: var(--transition);
      .icon { width: 12px; height: 12px; }
      &:hover { color: var(--text); border-color: var(--accent-cyan); }
    }

    /* typing dots */
    .typing-dots { display: inline-flex; gap: 4px; padding: 6px 0; }
    .typing-dots span {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--text-dim);
      animation: bounce 1.2s infinite ease-in-out;
    }
    .typing-dots span:nth-child(2) { animation-delay: 0.15s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }

    /* ── Composer ── */
    .composer-wrap {
      flex-shrink: 0;
      padding: 10px 20px 14px;
      background: linear-gradient(transparent, var(--dark2) 30%);
    }
    .composer {
      max-width: 780px;
      margin: 0 auto;
      display: flex;
      align-items: flex-end;
      gap: 8px;
      background: var(--dark3);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 8px 8px 8px 16px;
      transition: var(--transition);
      &:focus-within { border-color: var(--accent-cyan); box-shadow: 0 0 0 3px rgba(56,214,199,0.10); }
    }
    .composer textarea {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      resize: none;
      color: var(--text);
      font-size: 14px;
      font-family: inherit;
      line-height: 1.5;
      max-height: 180px;
      padding: 6px 0;
    }
    .composer-btn {
      width: 36px; height: 36px;
      border-radius: 10px;
      border: none;
      background: var(--red);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: var(--transition);
      .icon { width: 16px; height: 16px; color: #fff; }
      &:hover:not(:disabled) { background: var(--red-light, #ff4a5b); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
      &.stop { background: var(--dark2); border: 1px solid var(--border); .icon { color: var(--text); } }
    }
    .composer-hint {
      max-width: 780px;
      margin: 6px auto 0;
      text-align: center;
      font-size: 11px;
      color: var(--text-dim);
    }

    @media (max-width: 900px) {
      .convo-sidebar { display: none; }
      .suggest-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      /* Fit between browser chrome (dvh) and the 64px bottom nav bar */
      .assistant-page { height: calc(100vh - 70px); height: calc(100dvh - 70px); }
      .chat-thread { padding: 16px 12px 8px; gap: 18px; }
      .chat-topbar { padding: 10px 14px; }
      .composer-wrap { padding: 8px 10px 10px; }
      .suggest-grid { width: 100%; }
    }
  `],
  template: `
    <div class="assistant-page">

      <!-- Conversations sidebar -->
      <aside class="convo-sidebar">
        <div class="convo-head">
          <button class="new-chat-btn" (click)="newChat()">
            <span class="icon icon-plus"></span>
            {{ lang.t('chat.newChat') }}
          </button>
        </div>
        <div class="convo-list">
          <div class="convo-label" *ngIf="conversations.length > 0">{{ lang.t('chat.history') }}</div>
          <div class="convo-empty" *ngIf="conversations.length === 0">{{ lang.t('chat.noConvos') }}</div>
          <button *ngFor="let c of conversations"
                  class="convo-item"
                  [class.active]="c.id === activeId"
                  (click)="selectConversation(c.id)">
            <span class="convo-title">{{ c.title }}</span>
            <span class="convo-del" (click)="deleteConversation(c.id, $event)" [title]="lang.t('chat.deleteConvo')">
              <span class="icon icon-trash"></span>
            </span>
          </button>
        </div>
      </aside>

      <!-- Chat area -->
      <section class="chat-area">
        <div class="chat-topbar">
          <div class="bot-avatar"><span class="icon icon-robot"></span></div>
          <div>
            <div class="bot-name">{{ lang.t('chat.title') }}</div>
            <div class="bot-engine">{{ lang.t('chat.status') }}</div>
          </div>
        </div>

        <!-- Empty state -->
        <div class="chat-empty" *ngIf="messages.length === 0">
          <div class="big-avatar"><span class="icon icon-robot"></span></div>
          <h2>{{ lang.t('chat.emptyTitle') }}</h2>
          <p>{{ lang.t('chat.emptySub') }}</p>
          <div class="suggest-grid">
            <button class="suggest-card" (click)="sendSuggestion(lang.t('chat.chips.job'))">{{ lang.t('chat.chips.job') }}</button>
            <button class="suggest-card" (click)="sendSuggestion(lang.t('chat.chips.resources'))">{{ lang.t('chat.chips.resources') }}</button>
            <button class="suggest-card" (click)="sendSuggestion(lang.t('chat.chips.mentor'))">{{ lang.t('chat.chips.mentor') }}</button>
            <button class="suggest-card" (click)="sendSuggestion(lang.t('chat.chips.cv'))">{{ lang.t('chat.chips.cv') }}</button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-scroll" #scrollEl *ngIf="messages.length > 0" (scroll)="onScroll()">
          <div class="chat-thread">
            <div class="msg-row" *ngFor="let msg of messages; let i = index; let last = last">
              <div class="msg-avatar" [ngClass]="msg.role === 'assistant' ? 'bot' : 'user'">
                <span class="icon icon-robot" *ngIf="msg.role === 'assistant'"></span>
                <ng-container *ngIf="msg.role === 'user'">{{ userInitials }}</ng-container>
              </div>
              <div class="msg-body">
                <div class="msg-author">
                  {{ msg.role === 'assistant' ? lang.t('chat.title') : (user?.prenom || 'You') }}
                </div>

                <div class="typing-dots" *ngIf="msg.role === 'assistant' && streaming && last && !msg.content">
                  <span></span><span></span><span></span>
                </div>

                <div class="msg-content" *ngIf="msg.content">
                  <span [innerHTML]="msg.html"></span><span class="cursor-blink" *ngIf="streaming && last && msg.role === 'assistant'"></span>
                </div>

                <div class="msg-actions" *ngIf="msg.role === 'assistant' && msg.content && !(streaming && last)">
                  <button class="msg-action-btn" (click)="copyMessage(msg, i)">
                    <span class="icon" [ngClass]="copiedIndex === i ? 'icon-check' : 'icon-save'"></span>
                    {{ copiedIndex === i ? lang.t('chat.copied') : lang.t('chat.copy') }}
                  </button>
                  <button class="msg-action-btn" *ngIf="last" (click)="regenerate()">
                    <span class="icon icon-refresh"></span>
                    {{ lang.t('chat.regenerate') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Composer -->
        <div class="composer-wrap">
          <div class="composer">
            <textarea #inputEl
                      rows="1"
                      [(ngModel)]="draft"
                      [placeholder]="lang.t('chat.placeholder')"
                      (keydown)="onKeydown($event)"
                      (input)="autoGrow(inputEl)"
                      maxlength="4000"></textarea>
            <button class="composer-btn stop" *ngIf="streaming" (click)="stopGeneration()" [title]="lang.t('chat.stop')">
              <span class="icon icon-x"></span>
            </button>
            <button class="composer-btn" *ngIf="!streaming" (click)="send()" [disabled]="!draft.trim()" [title]="lang.t('chat.send')">
              <span class="icon icon-send"></span>
            </button>
          </div>
          <div class="composer-hint">{{ lang.t('chat.disclaimer') }}</div>
        </div>
      </section>
    </div>
  `
})
export class AssistantComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('scrollEl') scrollEl?: ElementRef<HTMLElement>;

  conversations: Conversation[] = [];
  activeId: string | null = null;
  draft = '';
  streaming = false;
  copiedIndex: number | null = null;

  private streamSub?: Subscription;
  private shouldScroll = false;
  private pinnedToBottom = true;

  constructor(
    private chatbot: ChatbotService,
    private auth: AuthService,
    public lang: LanguageService
  ) {}

  get user() { return this.auth.getCurrentUser(); }

  get userInitials(): string {
    const u = this.user;
    return u ? `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase() : 'U';
  }

  get active(): Conversation | undefined {
    return this.conversations.find(c => c.id === this.activeId);
  }

  get messages(): ConvoMessage[] {
    return this.active?.messages ?? [];
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.streamSub?.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      this.scrollToBottom();
    }
  }

  // ── Conversations ──────────────────────────────────────────────────────

  newChat(): void {
    this.stopGeneration();
    this.activeId = null;
    this.draft = '';
  }

  selectConversation(id: string): void {
    if (id === this.activeId) return;
    this.stopGeneration();
    this.activeId = id;
    this.pinnedToBottom = true;
    this.shouldScroll = true;
    // Re-render markdown for restored messages
    for (const m of this.messages) {
      if (m.role === 'assistant' && !m.html) m.html = renderMarkdown(m.content);
      if (m.role === 'user' && !m.html) m.html = renderMarkdown(m.content);
    }
  }

  deleteConversation(id: string, event: Event): void {
    event.stopPropagation();
    if (id === this.activeId) {
      this.stopGeneration();
      this.activeId = null;
    }
    this.conversations = this.conversations.filter(c => c.id !== id);
    this.save();
  }

  // ── Sending / streaming ────────────────────────────────────────────────

  sendSuggestion(text: string): void {
    this.draft = text;
    this.send();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!this.streaming) this.send();
    }
  }

  send(): void {
    const text = this.draft.trim();
    if (!text || this.streaming) return;

    let convo = this.active;
    if (!convo) {
      convo = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        title: text.length > 42 ? text.slice(0, 42) + '…' : text,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      this.conversations.unshift(convo);
      if (this.conversations.length > MAX_CONVERSATIONS) this.conversations.pop();
      this.activeId = convo.id;
    }

    convo.messages.push({ role: 'user', content: text, html: renderMarkdown(text), ts: Date.now() });
    this.draft = '';
    this.startStream(convo);
  }

  regenerate(): void {
    const convo = this.active;
    if (!convo || this.streaming) return;
    const last = convo.messages[convo.messages.length - 1];
    if (last?.role === 'assistant') convo.messages.pop();
    this.startStream(convo);
  }

  stopGeneration(): void {
    this.streamSub?.unsubscribe();
    this.streamSub = undefined;
    if (this.streaming) {
      this.streaming = false;
      this.save();
    }
  }

  private startStream(convo: Conversation): void {
    const history = convo.messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
    const lastUser = [...convo.messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;

    const botMsg: ConvoMessage = { role: 'assistant', content: '', html: '', ts: Date.now() };
    convo.messages.push(botMsg);
    this.streaming = true;
    this.pinnedToBottom = true;
    this.shouldScroll = true;

    this.streamSub = this.chatbot.chatStream({
      message: lastUser.content,
      // history excludes the just-added empty assistant message and the user message we send separately
      history: history.slice(0, -1),
      user_role: this.user?.role
    }).subscribe({
      next: evt => {
        if (evt.delta) {
          botMsg.content += evt.delta;
          botMsg.html = renderMarkdown(botMsg.content);
          if (this.pinnedToBottom) this.shouldScroll = true;
        }
        if (evt.done) {
          botMsg.engine = evt.engine;
          this.finishStream(convo);
        }
      },
      error: () => {
        if (!botMsg.content) {
          botMsg.content = this.lang.t('chat.error');
          botMsg.html = renderMarkdown(botMsg.content);
        }
        this.finishStream(convo);
      },
      complete: () => {
        if (this.streaming) this.finishStream(convo);
      }
    });
  }

  private finishStream(convo: Conversation): void {
    this.streaming = false;
    this.streamSub?.unsubscribe();
    this.streamSub = undefined;
    convo.updatedAt = Date.now();
    this.save();
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  copyMessage(msg: ConvoMessage, index: number): void {
    navigator.clipboard?.writeText(msg.content).then(() => {
      this.copiedIndex = index;
      setTimeout(() => { this.copiedIndex = null; }, 1500);
    });
  }

  autoGrow(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }

  onScroll(): void {
    const el = this.scrollEl?.nativeElement;
    if (!el) return;
    this.pinnedToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  private scrollToBottom(): void {
    const el = this.scrollEl?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  /** Conversations are stored per user so switching accounts never leaks chats. */
  private storageKey(): string {
    const uid = this.user?.id ?? 'anon';
    return `${STORAGE_KEY}_${uid}`;
  }

  private load(): void {
    // Drop the legacy shared (non-per-user) store if present
    localStorage.removeItem(STORAGE_KEY);
    try {
      const raw = localStorage.getItem(this.storageKey());
      this.conversations = raw ? JSON.parse(raw) : [];
      this.conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      this.conversations = [];
    }
    if (this.conversations.length > 0) {
      this.selectConversation(this.conversations[0].id);
    }
  }

  private save(): void {
    try {
      // Strip rendered html before persisting to keep storage small
      const slim = this.conversations.map(c => ({
        ...c,
        messages: c.messages.map(({ html, ...rest }) => rest)
      }));
      localStorage.setItem(this.storageKey(), JSON.stringify(slim));
    } catch { /* storage full — ignore */ }
  }
}
