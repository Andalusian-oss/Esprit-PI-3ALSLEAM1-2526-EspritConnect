import {
  Component, OnInit, OnDestroy, ElementRef, ViewChild,
  AfterViewChecked, HostListener, ChangeDetectorRef
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LanguageService } from '../../core/services/language.service';
import { Conversation, Message, User, Group, GroupMessage } from '../../core/models/models';

type Tab = 'direct' | 'groups';

@Component({
  selector: 'app-messages',
  template: `
    <div class="ms-root" [class.mobile-chat-open]="activeTab !== null">

      <!-- ═══════════════════════════════ SIDEBAR ═══════════════════════════════ -->
      <aside class="ms-sidebar">

        <!-- Header with tabs -->
        <div class="ms-sidebar-header">
          <h1 class="ms-title">{{ lang.t('msg.title') }}</h1>
          <div class="ms-tabs">
            <button class="ms-tab" [class.active]="tab === 'direct'" (click)="tab='direct'">
              {{ lang.t('msg.tabDirect') }}
            </button>
            <button class="ms-tab" [class.active]="tab === 'groups'" (click)="tab='groups'">
              {{ lang.t('msg.tabGroups') }}
              <span class="tab-count" *ngIf="groups.length">{{ groups.length }}</span>
            </button>
          </div>
        </div>

        <!-- ── DIRECT TAB ── -->
        <ng-container *ngIf="tab === 'direct'">

          <!-- Search -->
          <div class="ms-search-wrap">
            <span class="ms-search-icon icon icon-search"></span>
            <input class="ms-search-input" [(ngModel)]="searchQuery"
              [placeholder]="lang.t('msg.searchPeople')"
              (input)="onSearchInput()" autocomplete="off" />
            <button class="ms-search-clear" *ngIf="searchQuery" (click)="clearSearch()">
              <span class="icon icon-x"></span>
            </button>

            <!-- Search results dropdown -->
            <div class="ms-dropdown" *ngIf="searchResults.length > 0 || searchingUsers">
              <div class="ms-dropdown-loading" *ngIf="searchingUsers">
                <div class="spinner-xs"></div> {{ lang.t('msg.searching') }}
              </div>
              <button class="ms-dropdown-item" *ngFor="let u of searchResults"
                (click)="startConversationWith(u)">
                <div class="ms-av ms-av-sm" [class.has-img]="u.avatarUrl" [style.background]="avatarColor(u.prenom + u.nom)">
                  <img *ngIf="u.avatarUrl" [src]="u.avatarUrl" alt="" />
                  <ng-container *ngIf="!u.avatarUrl">{{ initials(u) }}</ng-container>
                </div>
                <div>
                  <div class="ms-dropdown-name">{{ u.prenom }} {{ u.nom }}</div>
                  <div class="ms-dropdown-sub">{{ u.email }}</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div class="ms-empty" *ngIf="loadingConversations">
            <div class="spinner-sm"></div>
          </div>

          <!-- Conversation list -->
          <div class="ms-list" *ngIf="!loadingConversations">
            <div class="ms-empty" *ngIf="conversations.length === 0">
              <span class="icon icon-message-circle" style="font-size:32px;opacity:.3"></span>
              <p>{{ lang.t('msg.noConversations') }}</p>
            </div>

            <button class="ms-conv-item" *ngFor="let conv of conversations"
              [class.active]="activeTab === 'direct' && activeConvId === conv.id"
              (click)="openConversation(conv)"
              (contextmenu)="openConvMenu($event, conv)">
              <div class="ms-av" [class.has-img]="otherAvatar(conv)" [style.background]="avatarColor(otherName(conv))">
                <img *ngIf="otherAvatar(conv) as a" [src]="a" alt="" />
                <ng-container *ngIf="!otherAvatar(conv)">{{ otherNameInitials(conv) }}</ng-container>
              </div>
              <div class="ms-conv-info">
                <div class="ms-conv-row1">
                  <span class="ms-conv-name">{{ otherName(conv) }}</span>
                  <span class="ms-conv-time">{{ conv.lastMessageAt | date:'HH:mm' }}</span>
                </div>
                <div class="ms-conv-row2">
                  <span class="ms-conv-preview" [class.unread-preview]="conv.unreadCount > 0">
                    {{ conv.lastMessage || '…' }}
                  </span>
                  <span class="ms-badge" *ngIf="conv.unreadCount > 0">{{ conv.unreadCount }}</span>
                </div>
              </div>
            </button>
          </div>
        </ng-container>

        <!-- ── GROUPS TAB ── -->
        <ng-container *ngIf="tab === 'groups'">
          <div class="ms-groups-actions">
            <button class="btn btn-primary btn-sm" (click)="showCreateGroup = true">
              <span class="icon icon-plus"></span> {{ lang.t('msg.newGroup') }}
            </button>
          </div>

          <div class="ms-empty" *ngIf="loadingGroups">
            <div class="spinner-sm"></div>
          </div>

          <div class="ms-list" *ngIf="!loadingGroups">
            <div class="ms-empty" *ngIf="groups.length === 0">
              <span class="icon icon-users" style="font-size:32px;opacity:.3"></span>
              <p>{{ lang.t('msg.noGroups') }}</p>
            </div>

            <button class="ms-conv-item" *ngFor="let g of groups"
              [class.active]="activeTab === 'groups' && activeGroupId === g.id"
              (click)="openGroup(g)">
              <div class="ms-av ms-av-group" [style.background]="avatarColor(g.name)">
                {{ g.name[0].toUpperCase() }}
              </div>
              <div class="ms-conv-info">
                <div class="ms-conv-row1">
                  <span class="ms-conv-name">{{ g.name }}</span>
                  <span class="ms-conv-time">{{ g.lastMessageAt | date:'HH:mm' }}</span>
                </div>
                <div class="ms-conv-row2">
                  <span class="ms-conv-preview">{{ g.lastMessage || (g.memberCount + ' ' + lang.t('msg.members')) }}</span>
                </div>
              </div>
            </button>
          </div>
        </ng-container>
      </aside>

      <!-- ═══════════════════════════════ THREAD ════════════════════════════════ -->
      <main class="ms-thread">

        <!-- Empty state -->
        <div class="ms-thread-empty" *ngIf="activeTab === null">
          <div class="ms-thread-empty-icon">
            <span class="icon icon-message-circle"></span>
          </div>
          <h2>{{ lang.t('msg.emptyTitle') }}</h2>
          <p>{{ lang.t('msg.emptyDesc') }}</p>
        </div>

        <!-- ── DIRECT THREAD ── -->
        <ng-container *ngIf="activeTab === 'direct' && activeConv">

          <!-- Thread header -->
          <div class="ms-thread-header">
            <button class="ms-icon-btn ms-back-btn" (click)="closeThread()" title="Back">
              <span class="icon icon-x"></span>
            </button>
            <div class="ms-av ms-av-sm" [class.has-img]="otherAvatar(activeConv)" [style.background]="avatarColor(otherName(activeConv))">
              <img *ngIf="otherAvatar(activeConv) as a" [src]="a" alt="" />
              <ng-container *ngIf="!otherAvatar(activeConv)">{{ otherNameInitials(activeConv) }}</ng-container>
            </div>
            <div class="ms-thread-header-info">
              <div class="ms-thread-name">{{ otherName(activeConv) }}</div>
              <div class="ms-thread-sub">{{ lang.t('msg.active') }}</div>
            </div>
            <div class="ms-thread-actions">
              <button class="ms-icon-btn" title="Audio call" (click)="startCall('audio')">
                <span class="icon icon-phone"></span>
              </button>
              <button class="ms-icon-btn" title="Video call" (click)="startCall('video')">
                <span class="icon icon-video"></span>
              </button>
              <button class="ms-icon-btn" title="Delete conversation"
                (click)="confirmDeleteConversation(activeConv)">
                <span class="icon icon-trash"></span>
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div class="ms-messages" #scrollContainer>
            <div class="ms-loading" *ngIf="loadingMessages">
              <div class="spinner-sm"></div>
            </div>

            <ng-container *ngFor="let msg of messages; let i = index">
              <!-- Date separator -->
              <div class="ms-date-sep" *ngIf="showDateSep(messages, i)">
                {{ msg.createdAt | date:'EEEE, MMMM d' }}
              </div>

              <!-- Call notification row -->
              <div class="ms-call-notif" *ngIf="msg.contenu?.startsWith('CALL_NOTIF:'); else voiceMsgCheck">
                <span class="ms-call-notif-text">{{ msg.contenu.substring(11) }}</span>
                <span class="ms-call-notif-time">{{ msg.createdAt | date:'HH:mm' }}</span>
              </div>

              <!-- Voice message bubble -->
              <ng-template #voiceMsgCheck>
                <div class="ms-voice-bubble" *ngIf="msg.contenu?.startsWith('VOICE_MSG:'); else normalBubble"
                  [class.mine]="msg.senderUserId === currentUserId"
                  [class.theirs]="msg.senderUserId !== currentUserId">
                  <div class="ms-voice-inner">
                    <audio controls preload="metadata" [src]="getVoiceUrl(msg.contenu)"></audio>
                    <button *ngIf="msg.senderUserId === currentUserId"
                      class="ms-voice-delete-btn" title="Delete"
                      (click)="deleteMsg(msg); $event.stopPropagation()">
                      <span class="icon icon-trash"></span>
                    </button>
                  </div>
                  <div class="ms-bubble-meta">
                    <span class="ms-time">{{ msg.createdAt | date:'HH:mm' }}</span>
                    <span class="ms-read" *ngIf="msg.senderUserId === currentUserId && msg.lu">✓✓</span>
                  </div>
                </div>
              </ng-template>

              <!-- Normal message bubble -->
              <ng-template #normalBubble>
                <div class="ms-msg-wrap"
                  [class.mine]="msg.senderUserId === currentUserId"
                  [class.theirs]="msg.senderUserId !== currentUserId"
                  [class.is-editing]="editingMsgId === msg.id">

                  <!-- Hover actions (own messages only, shown via CSS :hover) -->
                  <div class="ms-msg-actions" *ngIf="msg.senderUserId === currentUserId && editingMsgId !== msg.id">
                    <button class="ms-action-btn" title="Edit" (click)="startEdit(msg); $event.stopPropagation()">
                      <span class="icon icon-edit"></span>
                    </button>
                    <button class="ms-action-btn ms-action-danger" title="Delete" (click)="deleteMsg(msg); $event.stopPropagation()">
                      <span class="icon icon-trash"></span>
                    </button>
                  </div>

                  <!-- Bubble -->
                  <div class="ms-bubble">
                    <ng-container *ngIf="editingMsgId === msg.id">
                      <input class="ms-edit-input" [(ngModel)]="editText"
                        (keydown.enter)="saveEdit(msg)"
                        (keydown.escape)="cancelEdit()"
                        [id]="'edit-' + msg.id"
                        autofocus />
                      <div class="ms-edit-actions">
                        <button class="ms-edit-save" (click)="saveEdit(msg)">{{ lang.t('msg.saveEdit') }}</button>
                        <button class="ms-edit-cancel" (click)="cancelEdit()">{{ lang.t('common.cancel') }}</button>
                      </div>
                    </ng-container>
                    <span *ngIf="editingMsgId !== msg.id" class="ms-bubble-text">{{ msg.contenu }}</span>
                    <div class="ms-bubble-meta">
                      <span class="ms-edited" *ngIf="msg.edited">{{ lang.t('msg.edited') }}</span>
                      <span class="ms-time">{{ msg.createdAt | date:'HH:mm' }}</span>
                      <span class="ms-read" *ngIf="msg.senderUserId === currentUserId && msg.lu">✓✓</span>
                    </div>
                  </div>
                </div>
              </ng-template>
            </ng-container>
          </div>

          <!-- Input -->
          <div class="ms-composer">
            <textarea class="ms-composer-input" [(ngModel)]="newMessage"
              [placeholder]="lang.t('msg.typePlaceholder')" rows="1" #msgInput
              (input)="autoResize(msgInput)"
              (keydown.enter)="handleEnter($event)"
              [disabled]="sending"></textarea>
            <button class="ms-mic-btn" [class.listening]="isListening"
              (click)="toggleVoice()"
              [title]="isListening ? 'Stop recording' : 'Voice message'">
              <span class="icon icon-mic"></span>
            </button>
            <button class="ms-send-btn" (click)="sendMessage()"
              [disabled]="!newMessage.trim() || sending">
              <span class="icon icon-send" *ngIf="!sending"></span>
              <div class="spinner-xs" *ngIf="sending"></div>
            </button>
          </div>
        </ng-container>

        <!-- ── GROUP THREAD ── -->
        <ng-container *ngIf="activeTab === 'groups' && activeGroup">

          <!-- Header -->
          <div class="ms-thread-header">
            <button class="ms-icon-btn ms-back-btn" (click)="closeThread()" title="Back">
              <span class="icon icon-x"></span>
            </button>
            <div class="ms-av ms-av-group" [style.background]="avatarColor(activeGroup.name)">
              {{ activeGroup.name[0].toUpperCase() }}
            </div>
            <div class="ms-thread-header-info">
              <div class="ms-thread-name">{{ activeGroup.name }}</div>
              <div class="ms-thread-sub">{{ activeGroup.memberCount }} {{ lang.t('msg.members') }}</div>
            </div>
            <div class="ms-thread-actions">
              <button class="ms-icon-btn" (click)="showGroupInfo = !showGroupInfo" title="Group info">
                <span class="icon icon-info"></span>
              </button>
              <button class="ms-icon-btn ms-action-danger" title="Delete group"
                *ngIf="activeGroup.creatorUserId === currentUserId"
                (click)="confirmDeleteGroup(activeGroup)">
                <span class="icon icon-trash"></span>
              </button>
            </div>
          </div>

          <!-- Group messages -->
          <div class="ms-messages" #groupScrollContainer>
            <div class="ms-loading" *ngIf="loadingMessages">
              <div class="spinner-sm"></div>
            </div>

            <ng-container *ngFor="let msg of groupMessages; let i = index">
              <div class="ms-date-sep" *ngIf="showGroupDateSep(groupMessages, i)">
                {{ msg.createdAt | date:'EEEE, MMMM d' }}
              </div>

              <div class="ms-msg-wrap"
                [class.mine]="msg.senderUserId === currentUserId"
                [class.theirs]="msg.senderUserId !== currentUserId"
                [class.is-editing]="editingGroupMsgId === msg.id">

                <!-- Sender name above (for "theirs") -->
                <div class="ms-sender-name" *ngIf="msg.senderUserId !== currentUserId">
                  {{ msg.senderName }}
                </div>

                <!-- Hover actions (own messages only, shown via CSS :hover) -->
                <div class="ms-msg-actions" *ngIf="msg.senderUserId === currentUserId && editingGroupMsgId !== msg.id">
                  <button class="ms-action-btn" title="Edit" (click)="startGroupEdit(msg); $event.stopPropagation()">
                    <span class="icon icon-edit"></span>
                  </button>
                  <button class="ms-action-btn ms-action-danger" title="Delete" (click)="deleteGroupMsg(msg); $event.stopPropagation()">
                    <span class="icon icon-trash"></span>
                  </button>
                </div>

                <div class="ms-bubble">
                  <ng-container *ngIf="editingGroupMsgId === msg.id">
                    <input class="ms-edit-input" [(ngModel)]="editText"
                      (keydown.enter)="saveGroupEdit(msg)"
                      (keydown.escape)="cancelEdit()"
                      autofocus />
                    <div class="ms-edit-actions">
                      <button class="ms-edit-save" (click)="saveGroupEdit(msg)">{{ lang.t('msg.saveEdit') }}</button>
                      <button class="ms-edit-cancel" (click)="cancelEdit()">{{ lang.t('common.cancel') }}</button>
                    </div>
                  </ng-container>
                  <span *ngIf="editingGroupMsgId !== msg.id" class="ms-bubble-text">
                    <ng-container *ngIf="msg.contenu?.startsWith('VOICE_MSG:'); else groupText">
                      <audio controls preload="metadata" [src]="getVoiceUrl(msg.contenu)" style="max-width:220px;height:36px"></audio>
                    </ng-container>
                    <ng-template #groupText>{{ msg.contenu }}</ng-template>
                  </span>
                  <div class="ms-bubble-meta">
                    <span class="ms-edited" *ngIf="msg.edited">{{ lang.t('msg.edited') }}</span>
                    <span class="ms-time">{{ msg.createdAt | date:'HH:mm' }}</span>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>

          <!-- Group composer -->
          <div class="ms-composer">
            <textarea class="ms-composer-input" [(ngModel)]="newMessage"
              [placeholder]="lang.t('msg.typePlaceholder')" rows="1" #groupMsgInput
              (input)="autoResize(groupMsgInput)"
              (keydown.enter)="handleGroupEnter($event)"
              [disabled]="sending"></textarea>
            <button class="ms-mic-btn" [class.listening]="isListening"
              (click)="toggleVoice()"
              [title]="isListening ? 'Stop recording' : 'Voice message'">
              <span class="icon icon-mic"></span>
            </button>
            <button class="ms-send-btn" (click)="sendGroupMessage()"
              [disabled]="!newMessage.trim() || sending">
              <span class="icon icon-send" *ngIf="!sending"></span>
              <div class="spinner-xs" *ngIf="sending"></div>
            </button>
          </div>
        </ng-container>
      </main>

      <!-- ═══════════════════════════════ GROUP INFO PANEL ══════════════════════ -->
      <aside class="ms-info-panel" *ngIf="activeTab === 'groups' && activeGroup && showGroupInfo">
        <div class="ms-info-header">
          <h3>{{ lang.t('msg.groupInfo') }}</h3>
          <button class="ms-icon-btn" (click)="showGroupInfo = false">
            <span class="icon icon-x"></span>
          </button>
        </div>

        <div class="ms-info-group-av" [style.background]="avatarColor(activeGroup.name)">
          {{ activeGroup.name[0].toUpperCase() }}
        </div>
        <div class="ms-info-group-name">{{ activeGroup.name }}</div>
        <div class="ms-info-group-meta">{{ activeGroup.memberCount }} {{ lang.t('msg.members') }} · {{ activeGroup.createdAt | date:'mediumDate' }}</div>

        <div class="ms-info-section-title">{{ lang.t('msg.members') }}</div>

        <div class="ms-member-list">
          <div class="ms-member-item" *ngFor="let m of activeGroup.members">
            <div class="ms-av ms-av-xs" [style.background]="avatarColor(m.userName)">
              {{ m.userName[0] }}
            </div>
            <div class="ms-member-info">
              <div class="ms-member-name">{{ m.userName }}</div>
              <div class="ms-member-role" [class.is-admin]="m.role === 'ADMIN'">{{ m.role }}</div>
            </div>
            <button class="ms-icon-btn ms-action-danger"
              *ngIf="activeGroup.creatorUserId === currentUserId && m.userId !== currentUserId"
              (click)="removeMember(m.userId)" title="Remove">
              <span class="icon icon-user-minus"></span>
            </button>
          </div>
        </div>

        <div class="ms-info-add" *ngIf="activeGroup.creatorUserId === currentUserId">
          <div class="ms-info-section-title">{{ lang.t('msg.addMember') }}</div>
          <div class="ms-search-wrap" style="position:relative;margin:0">
            <span class="ms-search-icon icon icon-search"></span>
            <input class="ms-search-input" [(ngModel)]="addMemberQuery"
              [placeholder]="lang.t('msg.searchUser')"
              (input)="onAddMemberSearch()" autocomplete="off" />
            <div class="ms-dropdown" *ngIf="addMemberResults.length > 0">
              <button class="ms-dropdown-item" *ngFor="let u of addMemberResults"
                (click)="addMember(u)">
                <div class="ms-av ms-av-xs" [class.has-img]="u.avatarUrl" [style.background]="avatarColor(u.prenom)"><img *ngIf="u.avatarUrl" [src]="u.avatarUrl" alt="" /><ng-container *ngIf="!u.avatarUrl">{{ initials(u) }}</ng-container></div>
                <div>
                  <div class="ms-dropdown-name">{{ u.prenom }} {{ u.nom }}</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <button class="ms-leave-btn" (click)="leaveGroup(activeGroup)"
          *ngIf="activeGroup.creatorUserId !== currentUserId">
          <span class="icon icon-log-out"></span> {{ lang.t('msg.leaveGroup') }}
        </button>
      </aside>

      <!-- ═══════════════════════════════ ONLINE USERS ══════════════════════════ -->
      <aside class="ms-online-panel" *ngIf="activeTab !== 'groups' || !showGroupInfo">
        <div class="ms-online-header">{{ lang.t('msg.online') }}</div>
        <div class="ms-online-list">
          <button class="ms-online-item" *ngFor="let u of onlineUsers"
            [hidden]="u.id === currentUserId"
            (click)="startConversationWith(u)">
            <div class="ms-av ms-av-sm" [class.has-img]="u.avatarUrl" [style.background]="avatarColor(u.prenom + u.nom)">
              <img *ngIf="u.avatarUrl" [src]="u.avatarUrl" alt="" />
              <ng-container *ngIf="!u.avatarUrl">{{ initials(u) }}</ng-container>
            </div>
            <div class="ms-online-dot"></div>
            <span class="ms-online-name">{{ u.prenom }}</span>
          </button>
        </div>
      </aside>
    </div>

    <!-- ═════════════════════ MODALS ═════════════════════ -->

    <!-- Create group modal -->
    <div class="ms-modal-backdrop" *ngIf="showCreateGroup" (click)="showCreateGroup = false">
      <div class="ms-modal" (click)="$event.stopPropagation()">
        <div class="ms-modal-header">
          <h3>{{ lang.t('msg.newGroup') }}</h3>
          <button class="ms-icon-btn" (click)="showCreateGroup = false"><span class="icon icon-x"></span></button>
        </div>
        <div class="ms-modal-body">
          <div class="field">
            <label>{{ lang.t('msg.groupName') }}</label>
            <input class="ms-modal-input" [(ngModel)]="newGroupName" placeholder="e.g. Study Group" />
          </div>
          <div class="field" style="margin-top:16px">
            <label>{{ lang.t('msg.addMembers') }}</label>
            <div class="ms-search-wrap" style="position:relative">
              <span class="ms-search-icon icon icon-search"></span>
              <input class="ms-search-input" [(ngModel)]="newGroupMemberQuery"
                [placeholder]="lang.t('msg.searchUser')" (input)="onNewGroupMemberSearch()" />
              <div class="ms-dropdown" *ngIf="newGroupMemberResults.length > 0">
                <button class="ms-dropdown-item" *ngFor="let u of newGroupMemberResults"
                  (click)="toggleNewGroupMember(u)">
                  <div class="ms-av ms-av-xs" [class.has-img]="u.avatarUrl" [style.background]="avatarColor(u.prenom)"><img *ngIf="u.avatarUrl" [src]="u.avatarUrl" alt="" /><ng-container *ngIf="!u.avatarUrl">{{ initials(u) }}</ng-container></div>
                  <div class="ms-dropdown-name">{{ u.prenom }} {{ u.nom }}</div>
                  <span class="icon icon-check" style="margin-left:auto;color:var(--red)"
                    *ngIf="isInNewGroup(u)"></span>
                </button>
              </div>
            </div>
            <div class="ms-selected-chips" *ngIf="newGroupMembers.length > 0">
              <div class="ms-chip" *ngFor="let u of newGroupMembers">
                {{ u.prenom }} {{ u.nom }}
                <button (click)="removeNewGroupMember(u)"><span class="icon icon-x"></span></button>
              </div>
            </div>
          </div>
        </div>
        <div class="ms-modal-footer">
          <button class="btn btn-ghost" (click)="showCreateGroup = false">Cancel</button>
          <button class="btn btn-primary" (click)="createGroup()"
            [disabled]="!newGroupName.trim() || creatingGroup">
            {{ creatingGroup ? 'Creating…' : 'Create Group' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Conversation context menu -->
    <div class="ms-ctx-menu" *ngIf="ctxMenu"
      [style.top.px]="ctxMenu.y" [style.left.px]="ctxMenu.x">
      <button class="ms-ctx-item ms-ctx-danger" (click)="deleteConversationFromMenu()">
        <span class="icon icon-trash"></span> Delete conversation
      </button>
    </div>

    <!-- ════ INCOMING CALL ════ -->
    <div class="ms-call-incoming" *ngIf="incomingCall">
      <div class="ms-call-av" [style.background]="avatarColor(incomingCall.fromName)">
        {{ incomingCall.fromName[0] }}
      </div>
      <div class="ms-call-from">{{ incomingCall.fromName }}</div>
      <div class="ms-call-type-lbl">
        {{ incomingCall.callType === 'video' ? '&#x1F4F9; Appel vidéo entrant' : '&#x1F4DE; Appel audio entrant' }}
      </div>
      <div class="ms-call-row">
        <button class="ms-call-btn ms-call-reject" (click)="rejectCall()" title="Refuser">
          <span class="icon icon-phone-off"></span>
        </button>
        <button class="ms-call-btn ms-call-accept" (click)="acceptCall()" title="Accepter">
          <span class="icon icon-phone"></span>
        </button>
      </div>
    </div>

    <!-- ════ ACTIVE CALL OVERLAY ════ -->
    <div class="ms-call-overlay" *ngIf="activeCall">
      <video #remoteVideo class="ms-remote-video" autoplay playsinline></video>
      <video #localVideo class="ms-local-video" autoplay playsinline muted></video>
      <div class="ms-call-hud">
        <div class="ms-call-hud-name">{{ activeCall.peerName }}</div>
        <div class="ms-call-hud-time">{{ callDuration }}</div>
        <div class="ms-call-hud-btns">
          <button class="ms-call-ctrl" [class.off]="micMuted" (click)="toggleMicCall()" title="Mute">
            <span class="icon" [class.icon-mic]="!micMuted" [class.icon-mic-off]="micMuted"></span>
          </button>
          <button class="ms-call-ctrl" *ngIf="activeCall.callType === 'video'"
            [class.off]="camOff" (click)="toggleCam()" title="Camera">
            <span class="icon" [class.icon-video]="!camOff" [class.icon-video-off]="camOff"></span>
          </button>
          <button class="ms-call-ctrl ms-call-end-btn" (click)="endCall()" title="End call">
            <span class="icon icon-phone-off"></span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    /* ── Root layout ── */
    .ms-root {
      display: grid;
      grid-template-columns: 300px 1fr 260px;
      height: calc(100vh - 32px);
      overflow: hidden;
      font-size: 14px;
    }

    /* ── Sidebar ── */
    .ms-sidebar {
      background: var(--dark3);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column; overflow: hidden;
    }
    .ms-sidebar-header {
      padding: 20px 16px 0;
    }
    .ms-title {
      font-family: 'Syne', sans-serif; font-size: 20px;
      font-weight: 800; margin: 0 0 14px;
    }
    .ms-tabs {
      display: flex; gap: 4px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding-bottom: 0;
    }
    .ms-tab {
      flex: 1; padding: 8px 0 10px; background: none; border: none;
      color: var(--text-muted); font-size: 13px; font-weight: 600;
      cursor: pointer; position: relative; display: flex;
      align-items: center; justify-content: center; gap: 6px;
      transition: color 0.2s;
    }
    .ms-tab.active { color: var(--white); }
    .ms-tab.active::after {
      content: '';
      position: absolute; bottom: -1px; left: 0; right: 0;
      height: 2px; background: var(--red); border-radius: 2px 2px 0 0;
    }
    .tab-count {
      background: var(--red); color: #fff; font-size: 9px;
      min-width: 16px; height: 16px; border-radius: 8px;
      display: inline-flex; align-items: center; justify-content: center;
      padding: 0 4px;
    }

    /* ── Search ── */
    .ms-search-wrap {
      padding: 12px 12px 0; position: relative;
    }
    .ms-search-input {
      width: 100%; background: var(--dark);
      border: 1px solid var(--border);
      border-radius: 20px; padding: 8px 32px 8px 36px;
      color: var(--text); font-size: 13px; outline: none;
      transition: border-color 0.2s;
    }
    .ms-search-input:focus { border-color: rgba(227,30,36,0.4); }
    .ms-search-icon {
      position: absolute; left: 24px; top: 50%; transform: translateY(-50%);
      color: var(--text-muted); font-size: 14px; pointer-events: none;
      margin-top: 6px;
    }
    .ms-search-clear {
      position: absolute; right: 20px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: var(--text-muted);
      cursor: pointer; padding: 4px; margin-top: 6px;
    }
    .ms-dropdown {
      position: absolute; top: calc(100% + 4px); left: 12px; right: 12px;
      background: var(--dark3); border: 1px solid var(--border);
      border-radius: 12px; z-index: 200; max-height: 300px; overflow-y: auto;
      box-shadow: 0 16px 48px rgba(0,0,0,0.2); padding: 6px;
    }
    .ms-dropdown-item {
      width: 100%; display: flex; align-items: center; gap: 10px;
      padding: 8px 10px; border: none; background: none; cursor: pointer;
      color: var(--text); text-align: left; border-radius: 8px;
      transition: background 0.15s;
    }
    .ms-dropdown-item:hover { background: rgba(255,255,255,0.08); }
    .ms-dropdown-loading {
      padding: 12px; display: flex; align-items: center; gap: 8px;
      color: var(--text-muted); font-size: 12px;
    }
    .ms-dropdown-name { font-size: 13px; font-weight: 600; }
    .ms-dropdown-sub { font-size: 11px; color: var(--text-muted); }

    /* ── Groups actions ── */
    .ms-groups-actions { padding: 12px 12px 0; }

    /* ── Conversation list ── */
    .ms-list { flex: 1; overflow-y: auto; padding: 8px 0; }
    .ms-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 32px 16px; gap: 8px;
      color: var(--text-muted); font-size: 13px; text-align: center;
    }
    .ms-conv-item {
      width: 100%; display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border: none; background: none;
      cursor: pointer; text-align: left; color: var(--text);
      border-radius: 10px; margin: 1px 6px; width: calc(100% - 12px);
      transition: background 0.15s;
    }
    .ms-conv-item:hover { background: rgba(255,255,255,0.05); }
    .ms-conv-item.active { background: rgba(227,30,36,0.12); }
    .ms-conv-info { flex: 1; min-width: 0; }
    .ms-conv-row1 { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px; }
    .ms-conv-name { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
    .ms-conv-time { font-size: 10px; color: var(--text-muted); flex-shrink: 0; }
    .ms-conv-row2 { display: flex; align-items: center; justify-content: space-between; }
    .ms-conv-preview { font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
    .ms-conv-preview.unread-preview { color: var(--white); font-weight: 600; }
    .ms-badge {
      background: var(--red); color: #fff; font-size: 10px; font-weight: 700;
      min-width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; padding: 0 4px;
      flex-shrink: 0;
    }

    /* ── Avatar ── */
    .ms-av {
      width: 44px; height: 44px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 15px; color: #fff; flex-shrink: 0;
      font-family: 'Syne', sans-serif;
      overflow: hidden;
    }
    .ms-av.has-img { background: transparent !important; }
    .ms-av img { width: 100%; height: 100%; border-radius: inherit; object-fit: cover; display: block; }
    .ms-av-sm { width: 36px; height: 36px; font-size: 13px; }
    .ms-av-xs { width: 28px; height: 28px; font-size: 11px; }
    .ms-av-group { border-radius: 12px; }
    .ms-info-group-av {
      width: 72px; height: 72px; border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; font-weight: 800; color: #fff;
      margin: 0 auto 12px;
    }

    /* ── Thread ── */
    .ms-thread {
      display: flex; flex-direction: column; overflow: hidden;
      background: var(--dark2);
    }
    .ms-thread-empty {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 16px;
      color: var(--text); text-align: center;
      padding: 42px 36px;
      margin: 32px;
      background: var(--dark);
      border: 1px solid var(--border);
      border-radius: 28px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.18);
      position: relative;
    }
    .ms-thread-empty::before {
      content: '';
      position: absolute; inset: 0;
      border-radius: 28px;
      background: linear-gradient(180deg, rgba(255,255,255,0.04), transparent 70%);
      pointer-events: none;
    }
    .ms-thread-empty-icon {
      width: 84px; height: 84px; border-radius: 50%;
      background: rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      font-size: 34px; margin-bottom: 8px;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
      position: relative;
      z-index: 1;
    }
    .ms-thread-empty h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.03em;
      position: relative;
      z-index: 1;
    }
    .ms-thread-empty p {
      font-size: 14px;
      color: var(--text-muted);
      max-width: 340px;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }

    .ms-thread-header {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
      background: var(--dark3);
    }
    .ms-thread-header-info { flex: 1; }
    .ms-thread-name { font-weight: 700; font-size: 15px; }
    .ms-thread-sub { font-size: 11px; color: #4caf50; }
    .ms-thread-actions { display: flex; gap: 4px; }

    /* ── Messages ── */
    .ms-messages {
      flex: 1; overflow-y: auto; padding: 16px 20px;
      display: flex; flex-direction: column; gap: 2px;
    }
    .ms-loading {
      display: flex; justify-content: center; padding: 20px;
    }
    .ms-date-sep {
      text-align: center; font-size: 11px; color: var(--text-muted);
      padding: 12px 0; position: relative;
    }
    .ms-date-sep::before {
      content: ''; position: absolute; left: 0; right: 0; top: 50%;
      height: 1px; background: var(--border);
    }
    .ms-date-sep span {
      background: var(--dark);
      padding: 0 10px; position: relative; z-index: 1;
    }
    .ms-call-notif {
      display: flex; align-items: center; justify-content: center;
      gap: 8px; padding: 8px 0; color: var(--text-muted); font-size: 13px;
    }
    .ms-call-notif-text { font-style: italic; }
    .ms-call-notif-time { font-size: 11px; opacity: 0.6; }

    /* Voice message bubble */
    .ms-voice-bubble {
      display: flex; flex-direction: column; padding: 4px 16px; gap: 2px;
    }
    .ms-voice-bubble.mine { align-items: flex-end; }
    .ms-voice-bubble.theirs { align-items: flex-start; }
    .ms-voice-bubble audio {
      max-width: 280px; height: 40px; border-radius: 20px;
      outline: none; background: transparent;
      accent-color: var(--red);
    }
    .ms-voice-bubble .ms-bubble-meta {
      display: flex; align-items: center; gap: 4px;
      font-size: 10px; opacity: 0.6; padding: 0 6px;
    }
    .ms-voice-bubble.mine .ms-bubble-meta { color: var(--text-muted); }
    .ms-voice-bubble.theirs .ms-bubble-meta { color: var(--text-muted); }
    .ms-voice-inner {
      display: flex; align-items: center; gap: 8px;
    }
    .ms-voice-delete-btn {
      background: none; border: none; cursor: pointer; padding: 4px;
      opacity: 0; transition: opacity 0.15s;
      color: #e53935; display: flex; align-items: center;
    }
    .ms-voice-bubble:hover .ms-voice-delete-btn { opacity: 1; }
    .ms-voice-delete-btn .icon { font-size: 14px; }
    .ms-msg-wrap {
      display: flex; align-items: flex-end; gap: 6px;
      margin-bottom: 4px; position: relative;
    }
    .ms-msg-wrap.mine { flex-direction: row-reverse; }
    .ms-sender-name { font-size: 11px; color: var(--text-muted); margin-bottom: 2px; padding-left: 4px; }
    .ms-bubble {
      max-width: 60%; padding: 10px 14px;
      border-radius: 18px; line-height: 1.5; font-size: 14px;
      position: relative;
    }
    .mine .ms-bubble {
      background: var(--red); color: #fff;
      border-bottom-right-radius: 4px;
    }
    .theirs .ms-bubble {
      background: var(--dark);
      border: 1px solid var(--border);
      color: var(--text);
      border-bottom-left-radius: 4px;
    }
    .ms-bubble-text { word-break: break-word; display: block; }
    .ms-bubble-meta {
      display: flex; align-items: center; gap: 4px;
      font-size: 10px; margin-top: 5px; opacity: 0.6;
    }
    .mine .ms-bubble-meta { color: rgba(255,255,255,0.8); justify-content: flex-end; }
    .theirs .ms-bubble-meta { color: var(--text-muted); }
    .ms-edited { font-style: italic; font-size: 10px; }
    .ms-time {}
    .ms-read { color: rgba(255,255,255,0.9); }

    /* Bubble edit inline */
    .ms-edit-input {
      background: var(--dark);
      border: 1px solid var(--border);
      border-radius: 8px; padding: 6px 10px; color: var(--text); font-size: 14px;
      outline: none; width: 100%; min-width: 180px; font-family: inherit;
    }
    .mine .ms-edit-input { background: var(--dark); border-color: var(--border); }
    .ms-edit-actions { display: flex; gap: 6px; }
    .ms-edit-save {
      padding: 3px 10px; background: rgba(255,255,255,0.12); border: none;
      border-radius: 6px; color: var(--text); font-size: 11px; cursor: pointer;
    }
    .ms-edit-cancel {
      padding: 3px 10px; background: none; border: 1px solid var(--border);
      border-radius: 6px; color: var(--text); font-size: 11px; cursor: pointer;
    }

    /* Hover actions — hidden by default, revealed via CSS :hover on the wrap */
    .ms-msg-actions {
      display: flex; gap: 4px; align-items: center;
      opacity: 0; pointer-events: none;
      transition: opacity 0.15s ease;
      flex-shrink: 0;
    }
    /* Show when hovering the whole bubble row */
    .ms-msg-wrap:hover .ms-msg-actions {
      opacity: 1; pointer-events: all;
    }
    /* Keep hidden while editing */
    .ms-msg-wrap.is-editing .ms-msg-actions {
      opacity: 0 !important; pointer-events: none !important;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .ms-action-btn {
      width: 30px; height: 30px; border-radius: 8px; border: none;
      background: rgba(255,255,255,0.1); color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 14px; transition: all 0.15s;
    }
    .ms-action-btn:hover { background: rgba(255,255,255,0.18); color: #fff; }
    .ms-action-btn.ms-action-danger:hover { background: rgba(244,67,54,0.25); color: #f44336; }

    /* ── Composer ── */
    .ms-composer {
      display: flex; align-items: flex-end; gap: 10px;
      padding: 14px 20px; border-top: 1px solid var(--border);
      background: var(--dark3);
    }
    .ms-composer-input {
      flex: 1; background: var(--dark);
      border: 1px solid var(--border);
      border-radius: 20px; padding: 10px 16px;
      color: var(--text); font-size: 14px; font-family: inherit;
      outline: none; resize: none; max-height: 120px;
      transition: border-color 0.2s;
    }
    .ms-composer-input:focus { border-color: rgba(227,30,36,0.4); }
    .ms-send-btn {
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--red); border: none; color: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; flex-shrink: 0;
      transition: transform 0.2s, opacity 0.2s;
    }
    .ms-send-btn:hover:not(:disabled) { transform: scale(1.1); }
    .ms-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ── Online panel ── */
    .ms-online-panel {
      background: var(--dark3); border-left: 1px solid var(--border);
      display: flex; flex-direction: column; overflow: hidden; padding: 16px;
    }
    .ms-online-header {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: var(--text-muted); margin-bottom: 12px;
    }
    .ms-online-list { display: flex; flex-direction: column; gap: 6px; }
    .ms-online-item {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 8px; border: none; background: none;
      cursor: pointer; color: var(--text); border-radius: 10px;
      transition: background 0.15s; position: relative;
    }
    .ms-online-item:hover { background: rgba(255,255,255,0.05); }
    .ms-online-dot {
      position: absolute; bottom: 6px; left: 34px;
      width: 8px; height: 8px; border-radius: 50%;
      background: #4caf50; border: 2px solid var(--dark3);
    }
    .ms-online-name { font-size: 12px; font-weight: 500; }

    /* ── Group info panel ── */
    .ms-info-panel {
      background: var(--dark3); border-left: 1px solid var(--border);
      display: flex; flex-direction: column; overflow-y: auto; padding: 16px;
    }
    .ms-info-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px;
    }
    .ms-info-header h3 { margin: 0; font-size: 15px; }
    .ms-info-group-name {
      text-align: center; font-weight: 700; font-size: 17px; margin-bottom: 4px;
    }
    .ms-info-group-meta {
      text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 20px;
    }
    .ms-info-section-title {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: var(--text-muted); margin-bottom: 10px;
    }
    .ms-member-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
    .ms-member-item {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 4px;
    }
    .ms-member-info { flex: 1; }
    .ms-member-name { font-size: 13px; font-weight: 600; }
    .ms-member-role { font-size: 10px; color: var(--text-muted); }
    .ms-member-role.is-admin { color: var(--red); }
    .ms-leave-btn {
      width: 100%; padding: 10px; background: rgba(244,67,54,0.1);
      border: 1px solid rgba(244,67,54,0.2); border-radius: 10px;
      color: #f44336; cursor: pointer; display: flex; align-items: center;
      justify-content: center; gap: 8px; font-size: 13px; font-weight: 600;
      transition: background 0.2s; margin-top: auto;
    }
    .ms-leave-btn:hover { background: rgba(244,67,54,0.2); }
    .ms-info-add { margin-bottom: 16px; }

    /* ── Add member search ── */
    .ms-selected-chips {
      display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px 4px;
    }
    .ms-chip {
      display: flex; align-items: center; gap: 4px;
      background: rgba(227,30,36,0.15); border: 1px solid rgba(227,30,36,0.2);
      border-radius: 20px; padding: 3px 10px; font-size: 12px; color: var(--white);
    }
    .ms-chip button { background: none; border: none; color: inherit; cursor: pointer; padding: 0; }

    /* ── Icon button ── */
    .ms-icon-btn {
      width: 32px; height: 32px; border-radius: 8px; border: none;
      background: rgba(255,255,255,0.06); color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 15px; transition: all 0.15s;
    }
    .ms-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .ms-icon-btn.ms-action-danger:hover { background: rgba(244,67,54,0.15); color: #f44336; }

    /* ── Modal ── */
    .ms-modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
      backdrop-filter: blur(4px);
    }
    .ms-modal {
      background: var(--dark3); border: 1px solid var(--border);
      border-radius: 20px; width: 420px; max-width: 95vw;
      box-shadow: 0 24px 64px rgba(0,0,0,0.2);
    }
    .ms-modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--border);
    }
    .ms-modal-header h3 { margin: 0; font-size: 16px; }
    .ms-modal-body { padding: 24px; }
    .ms-modal-footer {
      display: flex; justify-content: flex-end; gap: 10px;
      padding: 16px 24px; border-top: 1px solid var(--border);
    }
    .ms-modal-input {
      width: 100%; background: var(--dark);
      border: 1px solid var(--border); border-radius: 10px;
      padding: 10px 14px; color: var(--text); font-size: 14px; outline: none;
    }

    /* ── Context menu ── */
    .ms-ctx-menu {
      position: fixed; background: var(--dark2);
      border: 1px solid var(--border); border-radius: 10px;
      padding: 6px; z-index: 500; min-width: 180px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    .ms-ctx-item {
      width: 100%; display: flex; align-items: center; gap: 10px;
      padding: 8px 12px; border: none; background: none;
      cursor: pointer; color: var(--text); font-size: 13px;
      border-radius: 7px; transition: background 0.15s;
    }
    .ms-ctx-item:hover { background: rgba(255,255,255,0.07); }
    .ms-ctx-item.ms-ctx-danger { color: #f44336; }
    .ms-ctx-item.ms-ctx-danger:hover { background: rgba(244,67,54,0.1); }

    /* ── Mic button ── */
    .ms-mic-btn {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.08); border: 1px solid var(--border);
      color: var(--text-muted); display: flex; align-items: center;
      justify-content: center; cursor: pointer; flex-shrink: 0;
      transition: all 0.2s; font-size: 16px;
    }
    .ms-mic-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .ms-mic-btn.listening {
      background: rgba(227,30,36,0.2); border-color: var(--red);
      color: var(--red); animation: mic-pulse 1.2s ease-in-out infinite;
    }
    @keyframes mic-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(227,30,36,0.4); }
      50%       { box-shadow: 0 0 0 8px rgba(227,30,36,0); }
    }

    /* ── Call incoming ── */
    .ms-call-incoming {
      position: fixed; bottom: 24px; right: 24px;
      background: var(--dark3); border: 1px solid var(--border);
      border-radius: 20px; padding: 24px 20px; width: 280px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      z-index: 2000; animation: call-slide 0.3s ease;
    }
    @keyframes call-slide {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .ms-call-av {
      width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 26px; font-weight: 800; color: #fff;
      animation: call-ring 1.2s ease-in-out infinite;
    }
    @keyframes call-ring {
      0%, 100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.5); }
      50%       { box-shadow: 0 0 0 12px rgba(76,175,80,0); }
    }
    .ms-call-from { font-weight: 700; font-size: 16px; }
    .ms-call-type-lbl { font-size: 12px; color: var(--text-muted); }
    .ms-call-row { display: flex; gap: 24px; margin-top: 4px; }
    .ms-call-btn {
      width: 52px; height: 52px; border-radius: 50%; border: none;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; cursor: pointer; transition: transform 0.15s;
    }
    .ms-call-btn:hover { transform: scale(1.1); }
    .ms-call-reject { background: #f44336; color: #fff; }
    .ms-call-accept { background: #4caf50; color: #fff; }

    /* ── Active call overlay ── */
    .ms-call-overlay {
      position: fixed; inset: 0; background: #0a0a0a;
      display: flex; align-items: center; justify-content: center;
      z-index: 3000;
    }
    .ms-remote-video { width: 100%; height: 100%; object-fit: cover; opacity: 0.85; }
    .ms-local-video {
      position: absolute; bottom: 110px; right: 24px;
      width: 160px; height: 120px; border-radius: 12px;
      object-fit: cover; border: 2px solid rgba(255,255,255,0.2); background: #111;
    }
    .ms-call-hud {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 20px; display: flex; flex-direction: column;
      align-items: center; gap: 6px;
      background: linear-gradient(transparent, rgba(0,0,0,0.85));
    }
    .ms-call-hud-name { font-size: 20px; font-weight: 700; color: #fff; }
    .ms-call-hud-time { font-size: 13px; color: rgba(255,255,255,0.55); }
    .ms-call-hud-btns { display: flex; gap: 16px; margin-top: 8px; }
    .ms-call-ctrl {
      width: 52px; height: 52px; border-radius: 50%; border: none;
      background: rgba(255,255,255,0.15); color: #fff; font-size: 20px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; backdrop-filter: blur(8px);
    }
    .ms-call-ctrl:hover { background: rgba(255,255,255,0.25); }
    .ms-call-ctrl.off { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); }
    .ms-call-ctrl.ms-call-end-btn { background: #f44336; }
    .ms-call-ctrl.ms-call-end-btn:hover { background: #d32f2f; }

    /* ── Spinners ── */
    .spinner-sm {
      width: 24px; height: 24px; border: 2px solid rgba(255,255,255,0.1);
      border-top-color: var(--red); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner-xs {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Responsive ── */
    .ms-back-btn { display: none; }

    @media (max-width: 1200px) {
      .ms-root { grid-template-columns: 280px 1fr; }
      .ms-online-panel { display: none; }
      .ms-info-panel { display: none; }
    }
    @media (max-width: 768px) {
      /* Phone: show the list OR the chat, with a back button to switch */
      .ms-root { grid-template-columns: 1fr; }
      .ms-root .ms-thread { display: none; }
      .ms-root.mobile-chat-open .ms-thread { display: flex; }
      .ms-root.mobile-chat-open .ms-sidebar { display: none; }
      .ms-back-btn { display: inline-flex; flex-shrink: 0; }
    }
    @media (max-width: 640px) {
      /* Account for the fixed bottom nav bar (~64px + page padding) */
      .ms-root { height: calc(100vh - 100px); }
    }
  `]
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;
  @ViewChild('groupScrollContainer') private groupScrollContainer?: ElementRef;
  @ViewChild('localVideo') private localVideoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') private remoteVideoRef?: ElementRef<HTMLVideoElement>;

  tab: Tab = 'direct';
  activeTab: 'direct' | 'groups' | null = null;

  // Direct
  conversations: Conversation[] = [];
  messages: Message[] = [];
  activeConv: Conversation | null = null;
  activeConvId: number | null = null;

  // Groups
  groups: Group[] = [];
  groupMessages: GroupMessage[] = [];
  activeGroup: Group | null = null;
  activeGroupId: number | null = null;
  showGroupInfo = false;

  // Online users
  onlineUsers: User[] = [];

  // State flags
  currentUserId: number | null = null;
  loadingConversations = true;
  loadingGroups = false;
  loadingMessages = false;
  loadingOnline = false;
  sending = false;
  searchingUsers = false;
  newMessage = '';
  searchQuery = '';
  searchResults: User[] = [];

  // Edit state (direct)
  editingMsgId: number | null = null;
  editText = '';

  // Edit state (group)
  editingGroupMsgId: number | null = null;

  // Group creation
  showCreateGroup = false;
  creatingGroup = false;
  newGroupName = '';
  newGroupMemberQuery = '';
  newGroupMemberResults: User[] = [];
  newGroupMembers: User[] = [];

  // Add member
  addMemberQuery = '';
  addMemberResults: User[] = [];

  // Context menu
  ctxMenu: { x: number; y: number; conv: Conversation } | null = null;

  private shouldScrollDirect = false;
  private shouldScrollGroup = false;
  private searchTimeout: any;
  private addMemberTimeout: any;
  private newGroupMemberTimeout: any;
  private userCache = new Map<number, string>();
  private avatarCache = new Map<number, string>();

  // ── Voice recording ──────────────────────────────────────────────────────
  isListening = false;  // true while MediaRecorder is recording
  voiceLang: 'fr-FR' | 'en-US' = 'fr-FR'; // kept for template compat
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingTimer: any = null;

  // ── WebRTC Call ───────────────────────────────────────────────────────────
  incomingCall: { fromUserId: number; fromName: string; callType: 'audio' | 'video'; sdp: string } | null = null;
  activeCall: { peerUserId: number; peerName: string; callType: 'audio' | 'video' } | null = null;
  callDuration = '00:00';
  micMuted = false;
  camOff = false;
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callTimer: any = null;
  private callSeconds = 0;
  private readonly ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  private pendingLocalStream: MediaStream | null = null;
  private toneInterval: any = null;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private notifications: NotificationService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public lang: LanguageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id ?? null;
    this.loadConversations();
    this.loadGroups();
    this.loadOnlineUsers();

    // Handle deep-link ?userId= or ?startWith=
    this.route.queryParams.subscribe(p => {
      const uidStr = p['userId'] || p['startWith'];
      if (!uidStr) return;
      const uid = Number(uidStr);
      if (!uid) return;

      const openChat = () => {
        const existing = this.conversations.find(c => this.otherParticipantId(c) === uid);
        if (existing) { this.openConversation(existing); return; }
        this.authService.getUserById(uid).subscribe({
          next: u => this.startConversationWith(u),
          error: () => {}
        });
      };

      if (!this.loadingConversations) {
        openChat();
      } else {
        const timer = setInterval(() => {
          if (!this.loadingConversations) { clearInterval(timer); openChat(); }
        }, 100);
        setTimeout(() => clearInterval(timer), 8000);
      }
    });

    // WebSocket
    const token = this.authService.getToken();
    if (token) {
      this.messageService.connectWebSocket(
        token,
        (msg: Message) => {
          if (this.activeConv && msg.conversationId === this.activeConv.id) {
            this.messages.push(msg); this.shouldScrollDirect = true;
          } else {
            const c = this.conversations.find(x => x.id === msg.conversationId);
            if (c) { c.unreadCount++; c.lastMessage = msg.contenu; }
            else { this.loadConversations(); }
          }
          this.cdr.markForCheck();
        },
        (edited: Message) => {
          const idx = this.messages.findIndex(m => m.id === edited.id);
          if (idx !== -1) { this.messages[idx] = edited; this.cdr.markForCheck(); }
        },
        (gmsg: GroupMessage) => {
          if (this.activeGroup && gmsg.groupId === this.activeGroup.id) {
            this.groupMessages.push(gmsg); this.shouldScrollGroup = true;
          } else {
            const g = this.groups.find(x => x.id === gmsg.groupId);
            if (g) { g.lastMessage = gmsg.contenu; g.lastMessageAt = gmsg.createdAt; }
          }
          this.cdr.markForCheck();
        },
        (group: Group) => {
          if (!this.groups.find(g => g.id === group.id)) { this.groups.unshift(group); }
          this.cdr.markForCheck();
        },
        this.groups.map(g => g.id)
      );
      // Subscribe to WebRTC call signaling
      this.messageService.callSignal$.subscribe(({ type, payload }) => {
        if      (type === 'offer')  this.onCallOffer(payload);
        else if (type === 'answer') this.onCallAnswer(payload);
        else if (type === 'ice')    this.onCallIce(payload);
        else if (type === 'end')    this.onCallEnd();
        else if (type === 'reject') this.onCallReject();
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy(): void {
    this.cleanupCall();
    this.messageService.disconnectWebSocket();
    if (this.isListening) {
      this.mediaRecorder?.stop();
      clearTimeout(this.recordingTimer);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollDirect) { this.scrollTo(this.scrollContainer); this.shouldScrollDirect = false; }
    if (this.shouldScrollGroup) { this.scrollTo(this.groupScrollContainer); this.shouldScrollGroup = false; }
    if (this.pendingLocalStream && this.localVideoRef?.nativeElement) {
      this.localVideoRef.nativeElement.srcObject = this.pendingLocalStream;
      this.pendingLocalStream = null;
    }
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadConversations(): void {
    this.loadingConversations = true;
    this.messageService.getConversations().subscribe({
      next: convs => {
        this.conversations = convs;
        this.loadingConversations = false;
        const ids = new Set<number>();
        convs.forEach(c => { ids.add(c.participant1UserId); ids.add(c.participant2UserId); });
        if (ids.size) {
          this.authService.getUsersByIds(Array.from(ids)).subscribe({
            next: users => users.forEach(u => {
              this.userCache.set(u.id, `${u.prenom} ${u.nom}`);
              if (u.avatarUrl) this.avatarCache.set(u.id, u.avatarUrl);
            })
          });
        }
      },
      error: () => { this.loadingConversations = false; }
    });
  }

  loadGroups(): void {
    this.loadingGroups = true;
    this.messageService.getMyGroups().subscribe({
      next: gs => { this.groups = gs; this.loadingGroups = false; },
      error: () => { this.loadingGroups = false; }
    });
  }

  loadOnlineUsers(): void {
    this.authService.getOnlineUsers().subscribe({
      next: users => { this.onlineUsers = users; },
      error: () => {}
    });
  }

  // ── Open conversation / group ─────────────────────────────────────────────

  openConversation(conv: Conversation): void {
    this.activeConv = conv;
    this.activeConvId = conv.id;
    this.activeTab = 'direct';
    this.loadingMessages = true;
    this.messageService.getMessages(conv.id).subscribe({
      next: msgs => {
        this.messages = msgs; this.loadingMessages = false; this.shouldScrollDirect = true;
        if (conv.unreadCount > 0) {
          this.messageService.markAsRead(conv.id).subscribe(() => { conv.unreadCount = 0; });
        }
      },
      error: () => { this.loadingMessages = false; }
    });
  }

  /** Mobile back button: return to the conversation list. */
  closeThread(): void {
    this.activeTab = null;
    this.activeConv = null;
    this.activeConvId = null;
    this.activeGroup = null;
    this.activeGroupId = null;
  }

  openGroup(g: Group): void {
    this.activeGroup = g;
    this.activeGroupId = g.id;
    this.activeTab = 'groups';
    this.loadingMessages = true;
    this.messageService.getGroupMessages(g.id).subscribe({
      next: msgs => {
        this.groupMessages = msgs; this.loadingMessages = false; this.shouldScrollGroup = true;
      },
      error: () => { this.loadingMessages = false; }
    });
    // Subscribe to this group's WS topic
    this.messageService.subscribeGroup(g.id, (gm: GroupMessage) => {
      if (this.activeGroup?.id === gm.groupId) {
        this.groupMessages.push(gm); this.shouldScrollGroup = true; this.cdr.markForCheck();
      }
    });
  }

  // ── Send ──────────────────────────────────────────────────────────────────

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.activeConv) return;
    this.sending = true;
    const recipId = this.otherParticipantId(this.activeConv);
    this.messageService.sendMessage(recipId, this.newMessage).subscribe({
      next: msg => {
        this.messages.push(msg);
        this.activeConv!.lastMessage = msg.contenu;
        this.newMessage = ''; this.sending = false; this.shouldScrollDirect = true;
      },
      error: () => { this.sending = false; }
    });
  }

  sendGroupMessage(): void {
    if (!this.newMessage.trim() || !this.activeGroup) return;
    this.sending = true;
    this.messageService.sendGroupMessage(this.activeGroup.id, this.newMessage).subscribe({
      next: msg => {
        this.groupMessages.push(msg);
        this.activeGroup!.lastMessage = msg.contenu;
        this.newMessage = ''; this.sending = false; this.shouldScrollGroup = true;
      },
      error: () => { this.sending = false; }
    });
  }

  handleEnter(e: Event): void {
    const ke = e as KeyboardEvent;
    if (!ke.shiftKey) { ke.preventDefault(); this.sendMessage(); }
  }

  handleGroupEnter(e: Event): void {
    const ke = e as KeyboardEvent;
    if (!ke.shiftKey) { ke.preventDefault(); this.sendGroupMessage(); }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────

  startEdit(msg: Message): void {
    this.editingGroupMsgId = null;
    this.editingMsgId = msg.id;
    this.editText = msg.contenu;
    setTimeout(() => {
      const el = document.getElementById('edit-' + msg.id) as HTMLInputElement | null;
      if (el) { el.focus(); el.select(); }
    }, 30);
  }

  startGroupEdit(msg: GroupMessage): void {
    this.editingMsgId = null;
    this.editingGroupMsgId = msg.id;
    this.editText = msg.contenu;
  }

  saveEdit(msg: Message): void {
    if (!this.editText.trim()) return;
    this.messageService.editMessage(msg.id, this.editText).subscribe({
      next: updated => {
        const idx = this.messages.findIndex(m => m.id === msg.id);
        if (idx !== -1) this.messages[idx] = updated;
        this.cancelEdit();
      },
      error: () => this.notifications.error('Failed to edit message')
    });
  }

  saveGroupEdit(msg: GroupMessage): void {
    if (!this.editText.trim()) return;
    this.messageService.editGroupMessage(msg.id, this.editText).subscribe({
      next: updated => {
        const idx = this.groupMessages.findIndex(m => m.id === msg.id);
        if (idx !== -1) this.groupMessages[idx] = updated;
        this.cancelEdit();
      },
      error: () => this.notifications.error('Failed to edit message')
    });
  }

  cancelEdit(): void { this.editingMsgId = null; this.editingGroupMsgId = null; this.editText = ''; }

  // ── Voice recording ──────────────────────────────────────────────────────

  toggleVoice(): void {
    if (this.isListening) {
      // Immediately turn off mic button — don't wait for onstop
      this.isListening = false;
      this.cdr.markForCheck();
      this.mediaRecorder?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      this.notifications.error('Microphone not supported in this browser');
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } }).then(stream => {
      this.audioChunks = [];
      const mimeType = this.getSupportedMimeType();
      const options: MediaRecorderOptions = { audioBitsPerSecond: 8000 };
      if (mimeType) options.mimeType = mimeType;
      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        clearTimeout(this.recordingTimer);

        const blob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });

        // Show bubble IMMEDIATELY using blob: URL (no encoding needed)
        const objectUrl = URL.createObjectURL(blob);
        const tempId = -Date.now();

        if (this.activeConv) {
          const tempMsg: Message = {
            id: tempId, conversationId: this.activeConv.id,
            senderUserId: this.currentUserId!, contenu: `VOICE_MSG:${objectUrl}`,
            lu: false, createdAt: new Date().toISOString()
          };
          this.messages = [...this.messages, tempMsg];
          this.activeConv!.lastMessage = '🎤 Voice message';
          this.shouldScrollDirect = true;
          this.cdr.markForCheck();
        } else if (this.activeGroup) {
          const tempMsg: GroupMessage = {
            id: tempId, groupId: this.activeGroup.id,
            senderUserId: this.currentUserId!, senderName: '',
            contenu: `VOICE_MSG:${objectUrl}`, createdAt: new Date().toISOString()
          };
          this.groupMessages = [...this.groupMessages, tempMsg];
          this.activeGroup!.lastMessage = '🎤 Voice message';
          this.shouldScrollGroup = true;
          this.cdr.markForCheck();
        }

        // Encode to base64 and send to server in background
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const contenu = `VOICE_MSG:${dataUrl}`;

          if (this.activeConv) {
            const recipId = this.otherParticipantId(this.activeConv);
            this.messageService.sendMessage(recipId, contenu).subscribe({
              next: msg => {
                this.messages = this.messages.map(m => m.id === tempId ? msg : m);
                URL.revokeObjectURL(objectUrl);
                this.cdr.markForCheck();
              },
              error: () => {
                this.messages = this.messages.filter(m => m.id !== tempId);
                URL.revokeObjectURL(objectUrl);
                this.notifications.error('Failed to send voice message');
                this.cdr.markForCheck();
              }
            });
          } else if (this.activeGroup) {
            this.messageService.sendGroupMessage(this.activeGroup.id, contenu).subscribe({
              next: msg => {
                this.groupMessages = this.groupMessages.map(m => m.id === tempId ? msg : m);
                URL.revokeObjectURL(objectUrl);
                this.cdr.markForCheck();
              },
              error: () => {
                this.groupMessages = this.groupMessages.filter(m => m.id !== tempId);
                URL.revokeObjectURL(objectUrl);
                this.notifications.error('Failed to send voice message');
                this.cdr.markForCheck();
              }
            });
          }
        };
        reader.readAsDataURL(blob);
      };

      // timeslice=100ms: browser flushes encoded chunks every 100ms,
      // so onstop fires in ~100ms instead of seconds after stop()
      this.mediaRecorder.start(100);
      this.isListening = true;
      this.cdr.markForCheck();

      // Auto-stop after 60 seconds
      this.recordingTimer = setTimeout(() => {
        if (this.isListening) this.mediaRecorder?.stop();
      }, 60000);
    }).catch(() => {
      this.notifications.error('Cannot access microphone');
    });
  }

  private getSupportedMimeType(): string {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    return types.find(t => MediaRecorder.isTypeSupported(t)) ?? '';
  }

  getVoiceUrl(contenu: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(contenu.substring(10));
  }

  toggleLang(): void {
    this.voiceLang = this.voiceLang === 'fr-FR' ? 'en-US' : 'fr-FR';
  }

  // ── WebRTC Call ───────────────────────────────────────────────────────────

  startCall(callType: 'audio' | 'video'): void {
    if (!this.activeConv) return;
    const toUserId = this.otherParticipantId(this.activeConv);
    const peerName = this.otherName(this.activeConv);
    const me = this.authService.getCurrentUser();
    const fromName = me ? `${me.prenom} ${me.nom}` : `User #${this.currentUserId}`;

    navigator.mediaDevices.getUserMedia({ video: callType === 'video', audio: true })
      .then(stream => {
        this.localStream = stream;
        this.playTone('dial');
        this.setupPeer(toUserId, peerName, callType, true, stream, fromName);
      })
      .catch(() => this.notifications.error('Cannot access microphone/camera'));
  }

  private async setupPeer(
    toUserId: number, peerName: string, callType: 'audio' | 'video',
    initiator: boolean, stream: MediaStream, fromName: string
  ): Promise<void> {
    this.pc = new RTCPeerConnection(this.ICE);
    stream.getTracks().forEach(t => this.pc!.addTrack(t, stream));

    this.pc.ontrack = ev => {
      const existing = this.remoteStream?.getTracks() ?? [];
      this.remoteStream = new MediaStream([...existing, ev.track]);
      const tryAssignRemote = () => {
        const el = this.remoteVideoRef?.nativeElement;
        if (el) {
          el.srcObject = this.remoteStream;
          el.play().catch(() => {});
        } else {
          setTimeout(tryAssignRemote, 50);
        }
      };
      tryAssignRemote();
    };

    this.pc.onicecandidate = ev => {
      if (ev.candidate) {
        this.messageService.sendCallSignal('ice', toUserId,
          { candidate: ev.candidate, fromUserId: this.currentUserId });
      }
    };

    if (initiator) {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      this.messageService.sendCallSignal('offer', toUserId,
        { sdp: offer.sdp, callType, fromUserId: this.currentUserId, fromName });
      this.activeCall = { peerUserId: toUserId, peerName, callType };
      this.startCallTimer();
      if (callType === 'video') {
        this.pendingLocalStream = stream;
      }
      this.cdr.markForCheck();
    }
  }

  async onCallOffer(payload: any): Promise<void> {
    this.incomingCall = {
      fromUserId: payload.fromUserId,
      fromName:   payload.fromName || `User #${payload.fromUserId}`,
      callType:   payload.callType,
      sdp:        payload.sdp
    };
    this.playTone('ring');
  }

  async acceptCall(): Promise<void> {
    if (!this.incomingCall) return;
    const { fromUserId, fromName, callType, sdp } = this.incomingCall;
    this.incomingCall = null;

    const stream = await navigator.mediaDevices
      .getUserMedia({ video: callType === 'video', audio: true })
      .catch(() => { this.notifications.error('Cannot access microphone/camera'); return null; });
    if (!stream) return;

    this.localStream = stream;
    this.pc = new RTCPeerConnection(this.ICE);
    stream.getTracks().forEach(t => this.pc!.addTrack(t, stream));

    this.pc.ontrack = ev => {
      const existing = this.remoteStream?.getTracks() ?? [];
      this.remoteStream = new MediaStream([...existing, ev.track]);
      const tryAssignRemote = () => {
        const el = this.remoteVideoRef?.nativeElement;
        if (el) {
          el.srcObject = this.remoteStream;
          el.play().catch(() => {});
        } else {
          setTimeout(tryAssignRemote, 50);
        }
      };
      tryAssignRemote();
    };

    this.pc.onicecandidate = ev => {
      if (ev.candidate) {
        this.messageService.sendCallSignal('ice', fromUserId,
          { candidate: ev.candidate, fromUserId: this.currentUserId });
      }
    };

    await this.pc.setRemoteDescription({ type: 'offer', sdp });
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.messageService.sendCallSignal('answer', fromUserId,
      { sdp: answer.sdp, fromUserId: this.currentUserId });

    this.stopTone();
    this.activeCall = { peerUserId: fromUserId, peerName: fromName, callType };
    this.startCallTimer();
    if (callType === 'video') {
      this.pendingLocalStream = stream;
    }
    this.cdr.markForCheck();
  }

  rejectCall(): void {
    if (this.incomingCall) {
      this.messageService.sendCallSignal('reject', this.incomingCall.fromUserId,
        { fromUserId: this.currentUserId });
      this.cleanupCall();
    }
  }

  async onCallAnswer(payload: any): Promise<void> {
    this.stopTone();
    if (this.pc && this.pc.signalingState !== 'stable') {
      await this.pc.setRemoteDescription({ type: 'answer', sdp: payload.sdp });
    }
  }

  async onCallIce(payload: any): Promise<void> {
    if (this.pc && payload.candidate) {
      try { await this.pc.addIceCandidate(payload.candidate); } catch { /* ignore */ }
    }
  }

  onCallEnd(): void {
    this.cleanupCall();
  }

  onCallReject(): void {
    this.addCallNotif('rejected');
    this.cleanupCall();
    this.notifications.error('Call was rejected');
  }

  endCall(): void {
    if (this.activeCall) {
      this.messageService.sendCallSignal('end', this.activeCall.peerUserId,
        { fromUserId: this.currentUserId });
    }
    this.addCallNotif(this.activeCall ? 'ended' : 'cancelled');
    this.cleanupCall();
  }

  toggleMicCall(): void {
    if (!this.localStream) return;
    this.micMuted = !this.micMuted;
    this.localStream.getAudioTracks().forEach(t => t.enabled = !this.micMuted);
  }

  toggleCam(): void {
    if (!this.localStream) return;
    this.camOff = !this.camOff;
    this.localStream.getVideoTracks().forEach(t => t.enabled = !this.camOff);
  }

  private startCallTimer(): void {
    this.callSeconds = 0;
    this.callDuration = '00:00';
    this.callTimer = setInterval(() => {
      this.callSeconds++;
      const m = Math.floor(this.callSeconds / 60).toString().padStart(2, '0');
      const s = (this.callSeconds % 60).toString().padStart(2, '0');
      this.callDuration = `${m}:${s}`;
      this.cdr.markForCheck();
    }, 1000);
  }

  private addCallNotif(status: 'ended' | 'missed' | 'rejected' | 'cancelled'): void {
    if (!this.activeConv) return;
    const callType = this.activeCall?.callType ?? this.incomingCall?.callType ?? 'audio';
    const durSecs = this.callSeconds;
    const m = Math.floor(durSecs / 60).toString().padStart(2, '0');
    const s = (durSecs % 60).toString().padStart(2, '0');
    const typeLabel = callType === 'video' ? 'Video call' : 'Voice call';
    const icon = callType === 'video' ? '📹' : '📞';
    let display: string;
    switch (status) {
      case 'ended':    display = durSecs > 0 ? `${icon} ${typeLabel} · ${m}:${s}` : `${icon} ${typeLabel}`; break;
      case 'missed':   display = `${icon} Missed ${typeLabel.toLowerCase()}`; break;
      case 'rejected': display = `${icon} ${typeLabel} · No answer`; break;
      case 'cancelled':display = `${icon} ${typeLabel} · Cancelled`; break;
      default:         display = `${icon} ${typeLabel}`;
    }
    const contenu = `CALL_NOTIF:${display}`;
    const peerUserId = this.activeCall?.peerUserId
      ?? (this.incomingCall ? this.incomingCall.fromUserId : null)
      ?? this.otherParticipantId(this.activeConv);
    this.messageService.sendMessage(peerUserId, contenu).subscribe({
      next: msg => {
        this.messages = [...this.messages, msg];
        this.shouldScrollDirect = true;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  cleanupCall(): void {
    this.stopTone();
    clearInterval(this.callTimer);
    this.callTimer = null;
    this.callSeconds = 0;
    this.callDuration = '00:00';
    this.pc?.close();
    this.pc = null;
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
    this.remoteStream = null;
    this.pendingLocalStream = null;
    this.activeCall = null;
    this.incomingCall = null;
    this.micMuted = false;
    this.camOff = false;
  }

  private playTone(type: 'ring' | 'dial'): void {
    this.stopTone();
    const beep = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        if (type === 'ring') {
          osc.frequency.value = 480;
          gain.gain.setValueAtTime(0.4, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.7);
          setTimeout(() => ctx.close(), 900);
        } else {
          osc.frequency.value = 440;
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
          setTimeout(() => ctx.close(), 600);
        }
      } catch {}
    };
    beep();
    this.toneInterval = setInterval(beep, type === 'ring' ? 2500 : 3000);
  }

  private stopTone(): void {
    if (this.toneInterval) {
      clearInterval(this.toneInterval);
      this.toneInterval = null;
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  deleteMsg(msg: Message): void {
    this.messageService.deleteMessage(msg.id).subscribe({
      next: () => { this.messages = this.messages.filter(m => m.id !== msg.id); },
      error: () => this.notifications.error('Failed to delete message')
    });
  }

  deleteGroupMsg(msg: GroupMessage): void {
    this.messageService.deleteGroupMessage(msg.id).subscribe({
      next: () => { this.groupMessages = this.groupMessages.filter(m => m.id !== msg.id); },
      error: () => this.notifications.error('Failed to delete message')
    });
  }

  confirmDeleteConversation(conv: Conversation): void {
    if (!confirm(`Delete conversation with ${this.otherName(conv)}? This cannot be undone.`)) return;
    this.messageService.deleteConversation(conv.id).subscribe({
      next: () => {
        this.conversations = this.conversations.filter(c => c.id !== conv.id);
        if (this.activeConv?.id === conv.id) { this.activeConv = null; this.activeConvId = null; this.activeTab = null; }
        this.notifications.success('Conversation deleted');
      },
      error: () => this.notifications.error('Failed to delete conversation')
    });
  }

  openConvMenu(e: MouseEvent, conv: Conversation): void {
    e.preventDefault();
    this.ctxMenu = { x: e.clientX, y: e.clientY, conv };
  }

  deleteConversationFromMenu(): void {
    if (this.ctxMenu) { this.confirmDeleteConversation(this.ctxMenu.conv); this.ctxMenu = null; }
  }

  @HostListener('document:click')
  closeCtxMenu(): void { this.ctxMenu = null; }

  // ── Groups ────────────────────────────────────────────────────────────────

  createGroup(): void {
    if (!this.newGroupName.trim()) return;
    this.creatingGroup = true;
    const memberIds = this.newGroupMembers.map(u => u.id);
    this.messageService.createGroup(this.newGroupName, memberIds).subscribe({
      next: g => {
        this.groups.unshift(g);
        this.showCreateGroup = false;
        this.creatingGroup = false;
        this.newGroupName = '';
        this.newGroupMembers = [];
        this.notifications.success('Group created');
        this.openGroup(g);
        this.tab = 'groups';
      },
      error: () => { this.creatingGroup = false; this.notifications.error('Failed to create group'); }
    });
  }

  addMember(user: User): void {
    if (!this.activeGroup) return;
    this.messageService.addGroupMember(this.activeGroup.id, user.id).subscribe({
      next: updated => {
        this.activeGroup = updated;
        const idx = this.groups.findIndex(g => g.id === updated.id);
        if (idx !== -1) this.groups[idx] = updated;
        this.addMemberQuery = '';
        this.addMemberResults = [];
        this.notifications.success(`${user.prenom} added`);
      },
      error: () => this.notifications.error('Failed to add member')
    });
  }

  removeMember(userId: number): void {
    if (!this.activeGroup) return;
    this.messageService.removeGroupMember(this.activeGroup.id, userId).subscribe({
      next: () => {
        this.activeGroup!.members = this.activeGroup!.members.filter(m => m.userId !== userId);
        this.activeGroup!.memberCount--;
        this.notifications.success('Member removed');
      },
      error: () => this.notifications.error('Failed to remove member')
    });
  }

  leaveGroup(g: Group): void {
    if (!confirm('Leave this group?')) return;
    this.messageService.removeGroupMember(g.id, this.currentUserId!).subscribe({
      next: () => {
        this.groups = this.groups.filter(x => x.id !== g.id);
        this.activeGroup = null; this.activeGroupId = null; this.activeTab = null;
        this.notifications.success('Left group');
      },
      error: () => this.notifications.error('Failed to leave group')
    });
  }

  confirmDeleteGroup(g: Group): void {
    if (!confirm(`Delete group "${g.name}"? This cannot be undone.`)) return;
    this.messageService.deleteGroup(g.id).subscribe({
      next: () => {
        this.groups = this.groups.filter(x => x.id !== g.id);
        this.activeGroup = null; this.activeGroupId = null; this.activeTab = null;
        this.notifications.success('Group deleted');
      },
      error: () => this.notifications.error('Failed to delete group')
    });
  }

  // ── Search ────────────────────────────────────────────────────────────────

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    if (this.searchQuery.length < 2) { this.searchResults = []; return; }
    this.searchingUsers = true;
    this.searchTimeout = setTimeout(() => {
      this.authService.searchUsers(this.searchQuery).subscribe({
        next: us => { this.searchResults = us.filter(u => u.id !== this.currentUserId); this.searchingUsers = false; },
        error: () => { this.searchingUsers = false; }
      });
    }, 350);
  }

  clearSearch(): void { this.searchQuery = ''; this.searchResults = []; this.searchingUsers = false; }

  onAddMemberSearch(): void {
    clearTimeout(this.addMemberTimeout);
    if (this.addMemberQuery.length < 2) { this.addMemberResults = []; return; }
    this.addMemberTimeout = setTimeout(() => {
      this.authService.searchUsers(this.addMemberQuery).subscribe({
        next: us => {
          const memberIds = this.activeGroup?.members.map(m => m.userId) ?? [];
          this.addMemberResults = us.filter(u => !memberIds.includes(u.id));
        }
      });
    }, 350);
  }

  onNewGroupMemberSearch(): void {
    clearTimeout(this.newGroupMemberTimeout);
    if (this.newGroupMemberQuery.length < 2) { this.newGroupMemberResults = []; return; }
    this.newGroupMemberTimeout = setTimeout(() => {
      this.authService.searchUsers(this.newGroupMemberQuery).subscribe({
        next: us => { this.newGroupMemberResults = us.filter(u => u.id !== this.currentUserId); }
      });
    }, 350);
  }

  toggleNewGroupMember(u: User): void {
    const idx = this.newGroupMembers.findIndex(m => m.id === u.id);
    if (idx === -1) this.newGroupMembers.push(u); else this.newGroupMembers.splice(idx, 1);
  }

  isInNewGroup(u: User): boolean { return this.newGroupMembers.some(m => m.id === u.id); }
  removeNewGroupMember(u: User): void { this.newGroupMembers = this.newGroupMembers.filter(m => m.id !== u.id); }

  // ── Start conversation ────────────────────────────────────────────────────

  startConversationWith(user: User): void {
    this.clearSearch();
    const existing = this.conversations.find(c => this.otherParticipantId(c) === user.id);
    if (existing) { this.openConversation(existing); return; }
    this.sending = true;
    this.messageService.sendMessage(user.id, '👋').subscribe({
      next: msg => {
        this.sending = false;
        this.messageService.getConversations().subscribe({
          next: convs => {
            this.conversations = convs;
            this.loadingConversations = false;
            const c = convs.find(x => x.id === msg.conversationId);
            if (c) this.openConversation(c);
          },
          error: () => {}
        });
      },
      error: () => { this.sending = false; }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  otherParticipantId(conv: Conversation): number {
    return conv.participant1UserId === this.currentUserId
      ? conv.participant2UserId : conv.participant1UserId;
  }

  otherName(conv: Conversation): string {
    const id = this.otherParticipantId(conv);
    if (conv.participant1UserId === this.currentUserId) {
      return conv.participant2Name || this.userCache.get(id) || `User #${id}`;
    }
    return conv.participant1Name || this.userCache.get(id) || `User #${id}`;
  }

  otherNameInitials(conv: Conversation): string {
    const n = this.otherName(conv);
    if (n.startsWith('User #')) return 'U';
    const parts = n.split(' ');
    return parts.length >= 2 ? (parts[0][0] || '') + (parts[1][0] || '') : (n[0] || '?');
  }

  /** Avatar image URL of the other participant in a direct conversation, if any. */
  otherAvatar(conv: Conversation): string | undefined {
    return this.avatarCache.get(this.otherParticipantId(conv));
  }

  initials(u: User): string { return (u.prenom?.[0] ?? '') + (u.nom?.[0] ?? ''); }

  avatarColor(seed: string): string {
    const palette = ['#e53935', '#8e24aa', '#1e88e5', '#00897b', '#f4511e', '#3949ab', '#039be5', '#7cb342'];
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % palette.length;
    return palette[Math.abs(h) % palette.length];
  }

  showDateSep(msgs: Message[], i: number): boolean {
    if (i === 0) return true;
    const a = new Date(msgs[i - 1].createdAt).toDateString();
    const b = new Date(msgs[i].createdAt).toDateString();
    return a !== b;
  }

  showGroupDateSep(msgs: GroupMessage[], i: number): boolean {
    if (i === 0) return true;
    const a = new Date(msgs[i - 1].createdAt).toDateString();
    const b = new Date(msgs[i].createdAt).toDateString();
    return a !== b;
  }

  autoResize(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  private scrollTo(ref?: ElementRef): void {
    try { ref?.nativeElement.scrollTo({ top: ref.nativeElement.scrollHeight, behavior: 'smooth' }); } catch {}
  }
}
