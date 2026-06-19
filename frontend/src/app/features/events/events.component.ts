import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Club, ClubMember, Event, EventRegistration, EventRequest } from '../../core/models/models';
import { EventService } from '../../core/services/event.service';
import { PostService } from '../../core/services/post.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-events',
  template: `
    <div class="page-wide">
      <div class="page-header page-header-row">
        <div>
          <h1>{{ lang.t('events.title') }}</h1>
          <p>{{ lang.t('events.subtitle') }}</p>
        </div>
        <button class="btn btn-ghost" *ngIf="canManageEvents && activeTab === 'events'" (click)="toggleEventForm()">
          <span class="icon" [ngClass]="showEventForm ? 'icon-x' : 'icon-plus'"></span>
          {{ showEventForm ? lang.t('events.closeEventForm') : lang.t('events.newEvent') }}
        </button>
        <button class="btn btn-ghost" *ngIf="canManageEvents && activeTab === 'clubs'" (click)="toggleClubForm()">
          <span class="icon" [ngClass]="showClubForm ? 'icon-x' : 'icon-plus'"></span>
          {{ showClubForm ? lang.t('events.closeClubForm') : lang.t('events.newClub') }}
        </button>
      </div>

      <div *ngIf="error" class="error-msg">{{ error }}</div>
      <div *ngIf="loading" class="empty"><p>{{ lang.t('common.loading') }}</p></div>

      <div class="events-layout">
        <aside class="events-sidebar">
          <button type="button" class="events-nav-item" [class.active]="activeTab === 'events'" (click)="activeTab = 'events'">
            <span class="icon icon-calendar"></span>
            <span class="events-nav-label">{{ lang.t('events.sectionEvents') }}</span>
            <span class="events-nav-count">{{ events.length }}</span>
          </button>
          <button type="button" class="events-nav-item" [class.active]="activeTab === 'clubs'" (click)="activeTab = 'clubs'">
            <span class="icon icon-users"></span>
            <span class="events-nav-label">{{ lang.t('events.sectionClubs') }}</span>
            <span class="events-nav-count">{{ clubs.length }}</span>
          </button>
        </aside>

        <div class="events-content">
          <!-- ───────────── EVENTS TAB ───────────── -->
          <ng-container *ngIf="activeTab === 'events'">
            <section class="panel" *ngIf="canManageEvents && showEventForm">
              <h2>{{ editingEventId ? lang.t('events.updateEvent') : lang.t('events.createEvent') }}</h2>
              <form [formGroup]="eventForm" (ngSubmit)="saveEvent()" class="stack">
                <input formControlName="titre" [placeholder]="lang.t('events.titlePh')" />
                <textarea formControlName="description" [placeholder]="lang.t('events.descPh')"></textarea>
                <div class="grid-2">
                  <input formControlName="date" type="datetime-local" [min]="editingEventId ? null : minEventDateTime" />
                  <input formControlName="lieu" [placeholder]="lang.t('events.locationPh')" />
                </div>
                <input formControlName="attendeeLimit" type="number" min="1" placeholder="Attendee limit (e.g. 20)" />
                <select formControlName="clubId">
                  <option [ngValue]="null">{{ lang.t('events.noClub') }}</option>
                  <option *ngFor="let club of clubs" [ngValue]="club.id">{{ club.nom }}</option>
                </select>
                <div class="form-actions">
                  <button class="btn btn-primary" type="submit" [disabled]="eventForm.invalid || saving">
                    <span class="icon" [ngClass]="editingEventId ? 'icon-save' : 'icon-plus'"></span>
                    {{ editingEventId ? lang.t('common.update') : lang.t('common.create') }}
                  </button>
                  <button class="btn btn-ghost" type="button" *ngIf="editingEventId" (click)="resetEventForm()">{{ lang.t('common.cancel') }}</button>
                </div>
              </form>
            </section>

            <div class="toolbar">
              <input [(ngModel)]="eventQuery" [placeholder]="lang.t('events.searchEvents')" />
              <select [(ngModel)]="eventClubFilter">
                <option [ngValue]="null">{{ lang.t('events.allClubs') }}</option>
                <option *ngFor="let club of clubs" [ngValue]="club.id">{{ club.nom }}</option>
              </select>
            </div>
            <div *ngIf="!loading && events.length === 0" class="empty"><p>{{ lang.t('events.noEvents') }}</p></div>
            <div class="list-grid">
              <article class="card" *ngFor="let event of pagedEvents">
                <div class="item-head">
                  <div>
                    <h3>{{ event.titre }}</h3>
                    <p>{{ event.date | date:'medium' }}</p>
                  </div>
                  <span class="badge" [ngClass]="isEventFull(event) ? 'badge-gray' : 'badge-red'">
                    {{ event.registrationCount }}<ng-container *ngIf="event.attendeeLimit"> / {{ event.attendeeLimit }}</ng-container>
                    {{ lang.t('events.registered') }}
                  </span>
                </div>
                <p class="muted" *ngIf="event.description">{{ event.description }}</p>
                <div class="meta-row">
                  <span *ngIf="event.lieu">{{ lang.t('events.location') }} {{ event.lieu }}</span>
                  <span *ngIf="event.clubNom">{{ lang.t('events.club') }} {{ event.clubNom }}</span>
                  <span *ngIf="event.attendeeLimit && !isEventFull(event)">{{ event.remainingSpots ?? 0 }} spots left</span>
                  <span *ngIf="isEventFull(event)" class="badge badge-gray">Event full</span>
                </div>
                <div class="card-actions">
                  <button class="btn btn-ghost" (click)="register(event)" [disabled]="loadingInviteEventId === event.id || isEventFull(event)">
                    <span class="icon icon-check"></span>{{ isEventFull(event) ? 'Full' : lang.t('common.register') }}
                  </button>
                  <button class="btn btn-ghost" (click)="openMyInvite(event)" [disabled]="loadingInviteEventId === event.id">
                    <span class="icon icon-qr-code"></span>My Invite
                  </button>
                  <button class="btn btn-ghost" *ngIf="canManageEvents" (click)="viewAttendees(event)">
                    <span class="icon icon-users"></span>Attendees
                  </button>
                  <button class="btn btn-ghost" *ngIf="canManageEvents" (click)="editEvent(event)"><span class="icon icon-edit"></span>{{ lang.t('common.edit') }}</button>
                  <button class="btn btn-danger" *ngIf="canManageEvents" (click)="deleteEvent(event.id)"><span class="icon icon-trash"></span>{{ lang.t('common.delete') }}</button>
                </div>
              </article>
            </div>
            <div class="pagination" *ngIf="filteredEvents.length > pageSize">
              <button class="btn btn-ghost" (click)="eventPage = eventPage - 1" [disabled]="eventPage === 1">{{ lang.t('common.previous') }}</button>
              <span>{{ eventPage }} / {{ eventTotalPages }}</span>
              <button class="btn btn-ghost" (click)="eventPage = eventPage + 1" [disabled]="eventPage === eventTotalPages">{{ lang.t('common.next') }}</button>
            </div>
          </ng-container>

          <!-- ───────────── CLUBS TAB ───────────── -->
          <ng-container *ngIf="activeTab === 'clubs'">
            <section class="panel" *ngIf="canManageEvents && showClubForm">
              <h2>{{ editingClubId ? lang.t('events.updateClub') : lang.t('events.createClub') }}</h2>
              <form [formGroup]="clubForm" (ngSubmit)="saveClub()" class="stack">
                <input formControlName="nom" [placeholder]="lang.t('events.clubNamePh')" />
                <textarea formControlName="description" [placeholder]="lang.t('events.descPh')"></textarea>
                <div class="club-avatar-row">
                  <div class="club-avatar-preview" [class.has-img]="clubForm.value.logoUrl">
                    <img *ngIf="clubForm.value.logoUrl" [src]="clubForm.value.logoUrl" alt="club avatar" />
                    <span *ngIf="!clubForm.value.logoUrl" class="icon icon-building"></span>
                  </div>
                  <div class="club-avatar-actions">
                    <input type="file" accept="image/*" hidden #clubAvatarInput (change)="onClubAvatarSelected($event)" />
                    <button class="btn btn-ghost" type="button" (click)="clubAvatarInput.click()" [disabled]="uploadingClubAvatar">
                      <span class="icon icon-plus"></span>
                      {{ uploadingClubAvatar ? lang.t('common.loading') : lang.t('events.clubAvatar') }}
                    </button>
                    <button class="btn btn-ghost" type="button" *ngIf="clubForm.value.logoUrl && !uploadingClubAvatar" (click)="clubForm.patchValue({ logoUrl: '' })">
                      <span class="icon icon-trash"></span>{{ lang.t('common.delete') }}
                    </button>
                  </div>
                </div>
                <div class="form-actions">
                  <button class="btn btn-primary" type="submit" [disabled]="clubForm.invalid || saving">
                    <span class="icon" [ngClass]="editingClubId ? 'icon-save' : 'icon-plus'"></span>
                    {{ editingClubId ? lang.t('common.update') : lang.t('common.create') }}
                  </button>
                  <button class="btn btn-ghost" type="button" *ngIf="editingClubId" (click)="resetClubForm()">{{ lang.t('common.cancel') }}</button>
                </div>
              </form>
            </section>

            <div class="toolbar">
              <input [(ngModel)]="clubQuery" [placeholder]="lang.t('events.searchClubs')" />
              <div class="club-scope">
                <button type="button" class="club-scope-btn" [class.active]="clubScope === 'all'" (click)="clubScope = 'all'">{{ lang.t('events.allClubs') }}</button>
                <button type="button" class="club-scope-btn" [class.active]="clubScope === 'mine'" (click)="clubScope = 'mine'">{{ lang.t('events.myClubs') }} ({{ myClubsCount }})</button>
              </div>
            </div>
            <div *ngIf="!loading && filteredClubs.length === 0" class="empty">
              <p>{{ clubScope === 'mine' ? lang.t('events.noMyClubs') : lang.t('events.sectionClubs') }}</p>
            </div>
            <div class="list-grid">
              <article class="card" *ngFor="let club of filteredClubs">
                <div class="item-head">
                  <div>
                    <h3>{{ club.nom }}</h3>
                    <p>{{ club.memberCount }} {{ lang.t('events.members') }}</p>
                  </div>
                  <span class="badge badge-gray">{{ lang.t('events.clubBadge') }}</span>
                </div>
                <p class="muted" *ngIf="club.description">{{ club.description }}</p>
                <div class="card-actions">
                  <button class="btn btn-ghost" *ngIf="club.membershipStatus === 'APPROVED'" (click)="leaveClub(club)"><span class="icon icon-check"></span>{{ lang.t('events.member') }}</button>
                  <button class="btn btn-ghost" *ngIf="club.membershipStatus === 'PENDING'" disabled><span class="icon icon-user-plus"></span>{{ lang.t('events.pending') }}</button>
                  <button class="btn btn-ghost" *ngIf="!club.membershipStatus || club.membershipStatus === 'NONE'" (click)="joinClub(club.id)"><span class="icon icon-user-plus"></span>{{ lang.t('common.join') }}</button>
                  <button class="btn btn-ghost" (click)="viewMembers(club)"><span class="icon icon-users"></span>{{ lang.t('events.members') }}</button>
                  <button class="btn btn-ghost" *ngIf="canManageClub(club)" (click)="viewRequests(club)">
                    <span class="icon icon-user-plus"></span>{{ lang.t('events.requests') }}
                    <span class="badge badge-red" *ngIf="club.pendingCount" style="margin-left:6px">{{ club.pendingCount }}</span>
                  </button>
                  <button class="btn btn-ghost" *ngIf="isAdmin || canManageClub(club)" (click)="editClub(club)"><span class="icon icon-edit"></span>{{ lang.t('common.edit') }}</button>
                  <button class="btn btn-danger" *ngIf="isAdmin || canManageClub(club)" (click)="deleteClub(club.id)"><span class="icon icon-trash"></span>{{ lang.t('common.delete') }}</button>
                </div>
              </article>
            </div>
          </ng-container>
        </div>
      </div>

      <div *ngIf="inviteModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000" (click)="closeInviteModal()">
        <div style="width:min(420px,100%);background:var(--dark2);color:var(--text);border:1px solid var(--border);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.35)" (click)="$event.stopPropagation()">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px">
            <div>
              <h3 style="margin:0 0 6px 0">{{ inviteModal.event.titre }}</h3>
              <p style="margin:0;color:var(--text-muted, #aaa)">{{ inviteModal.event.date | date:'medium' }}</p>
            </div>
            <button class="btn btn-ghost" type="button" (click)="closeInviteModal()">Close</button>
          </div>
          <div style="display:flex;justify-content:center;margin:12px 0 18px">
            <img [src]="inviteModal.qrImageUrl" alt="Event invite QR code" style="width:240px;height:240px;background:#fff;border-radius:14px;padding:10px" />
          </div>
          <div style="display:grid;gap:8px;font-size:14px">
            <div *ngIf="inviteModal.event.lieu"><strong>Location:</strong> {{ inviteModal.event.lieu }}</div>
            <div><strong>Attendee:</strong> {{ inviteAttendeeName }}</div>
            <div><strong>Invite code:</strong> {{ inviteModal.registration.inviteCode }}</div>
            <div><strong>Generated:</strong> {{ inviteModal.registration.createdAt | date:'medium' }}</div>
            <div style="color:var(--text-muted, #aaa);line-height:1.5">Scan this QR code to see the event details. Each attendee receives a unique invite.</div>
          </div>
        </div>
      </div>

      <div *ngIf="attendeesModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000" (click)="closeAttendeesModal()">
        <div style="width:min(560px,100%);max-height:80vh;overflow-y:auto;background:var(--dark2);color:var(--text);border:1px solid var(--border);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.35)" (click)="$event.stopPropagation()">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px">
            <div>
              <h3 style="margin:0 0 4px 0">{{ attendeesModal.event.titre }}</h3>
              <p style="margin:0;color:var(--text-muted,#aaa);font-size:13px">
                {{ attendeesModal.registrations.length }} registered
                <ng-container *ngIf="attendeesModal.event.attendeeLimit"> / {{ attendeesModal.event.attendeeLimit }} capacity</ng-container>
              </p>
            </div>
            <button class="btn btn-ghost" type="button" (click)="closeAttendeesModal()">Close</button>
          </div>
          <div *ngIf="attendeesModal.registrations.length === 0" style="color:var(--text-muted,#aaa);text-align:center;padding:24px 0">No registrations yet</div>
          <table *ngIf="attendeesModal.registrations.length > 0" style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
              <tr style="border-bottom:1px solid var(--border)">
                <th style="text-align:left;padding:8px 6px">#</th>
                <th style="text-align:left;padding:8px 6px">Attendee</th>
                <th style="text-align:left;padding:8px 6px">Registered At</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of attendeesModal.registrations; let i = index" style="border-bottom:1px solid var(--border)">
                <td style="padding:8px 6px;color:var(--text-muted,#aaa)">{{ i + 1 }}</td>
                <td style="padding:8px 6px">{{ attendeeName(r.userId) }}</td>
                <td style="padding:8px 6px;color:var(--text-muted,#aaa)">{{ r.createdAt | date:'medium' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="membersModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000" (click)="closeMembersModal()">
        <div style="width:min(520px,100%);max-height:80vh;overflow-y:auto;background:var(--dark2);color:var(--text);border:1px solid var(--border);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.35)" (click)="$event.stopPropagation()">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px">
            <div>
              <h3 style="margin:0 0 4px 0">{{ membersModal.club.nom }}</h3>
              <p style="margin:0;color:var(--text-muted,#aaa);font-size:13px">{{ membersModal.members.length }} {{ lang.t('events.members') }}</p>
            </div>
            <button class="btn btn-ghost" type="button" (click)="closeMembersModal()">Close</button>
          </div>
          <div *ngIf="membersModal.members.length === 0" style="color:var(--text-muted,#aaa);text-align:center;padding:24px 0">No members yet</div>
          <table *ngIf="membersModal.members.length > 0" style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
              <tr style="border-bottom:1px solid var(--border)">
                <th style="text-align:left;padding:8px 6px">#</th>
                <th style="text-align:left;padding:8px 6px">Member</th>
                <th style="text-align:left;padding:8px 6px">Role</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of membersModal.members; let i = index" style="border-bottom:1px solid var(--border)">
                <td style="padding:8px 6px;color:var(--text-muted,#aaa)">{{ i + 1 }}</td>
                <td style="padding:8px 6px">{{ memberName(m.userId) }}</td>
                <td style="padding:8px 6px">
                  <span class="badge" [ngClass]="m.role === 'ADMIN' ? 'badge-red' : 'badge-gray'">{{ m.role }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="requestsModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px;z-index:1000" (click)="closeRequestsModal()">
        <div style="width:min(520px,100%);max-height:80vh;overflow-y:auto;background:var(--dark2);color:var(--text);border:1px solid var(--border);border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.35)" (click)="$event.stopPropagation()">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px">
            <div>
              <h3 style="margin:0 0 4px 0">{{ lang.t('events.requests') }} · {{ requestsModal.club.nom }}</h3>
              <p style="margin:0;color:var(--text-muted,#aaa);font-size:13px">{{ requestsModal.requests.length }} pending</p>
            </div>
            <button class="btn btn-ghost" type="button" (click)="closeRequestsModal()">Close</button>
          </div>
          <div *ngIf="requestsModal.requests.length === 0" style="color:var(--text-muted,#aaa);text-align:center;padding:24px 0">No pending requests</div>
          <div *ngFor="let r of requestsModal.requests" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 4px;border-bottom:1px solid var(--border)">
            <span>{{ requestUserName(r.userId) }}</span>
            <div style="display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" (click)="approveRequest(r.userId)"><span class="icon icon-check"></span>{{ lang.t('events.approve') }}</button>
              <button class="btn btn-danger btn-sm" (click)="rejectRequest(r.userId)"><span class="icon icon-x"></span>{{ lang.t('events.reject') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .events-layout { display: flex; gap: 20px; align-items: flex-start; }
    .events-sidebar {
      flex: 0 0 200px; position: sticky; top: 16px;
      display: flex; flex-direction: column; gap: 6px;
      background: var(--dark2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 8px;
    }
    .events-nav-item {
      display: flex; align-items: center; gap: 10px; width: 100%;
      padding: 10px 12px; border: none; border-radius: var(--radius);
      background: transparent; color: var(--text-muted);
      font-size: 14px; font-weight: 600; cursor: pointer; text-align: left;
      transition: var(--transition);
    }
    .events-nav-item:hover { background: var(--dark3); color: var(--text); }
    .events-nav-item.active { background: var(--red); color: #fff; }
    .events-nav-label { flex: 1; }
    .events-nav-count {
      font-size: 12px; min-width: 22px; text-align: center;
      padding: 1px 7px; border-radius: 999px;
      background: var(--dark3); color: var(--text-muted);
    }
    .events-nav-item.active .events-nav-count { background: rgba(255,255,255,0.25); color: #fff; }
    .events-content { flex: 1; min-width: 0; }
    .club-avatar-row { display: flex; align-items: center; gap: 14px; }
    .club-avatar-preview {
      flex: 0 0 64px; width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; overflow: hidden;
      background: var(--dark3); border: 1px solid var(--border); color: var(--text-muted);
    }
    .club-avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
    .club-avatar-preview .icon { width: 26px; height: 26px; flex: 0 0 26px; }
    .club-avatar-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .club-scope { display: inline-flex; gap: 4px; background: var(--dark3); border: 1px solid var(--border); border-radius: 999px; padding: 3px; }
    .club-scope-btn { border: none; background: transparent; color: var(--text-muted); font-size: 13px; font-weight: 600; padding: 5px 14px; border-radius: 999px; cursor: pointer; transition: var(--transition); }
    .club-scope-btn:hover { color: var(--text); }
    .club-scope-btn.active { background: var(--red); color: #fff; }
    @media (max-width: 760px) {
      .events-layout { flex-direction: column; }
      .events-sidebar { flex: none; width: 100%; position: static; flex-direction: row; }
      .events-nav-item { justify-content: center; }
    }
  `]
})
export class EventsComponent implements OnInit {
  activeTab: 'events' | 'clubs' = 'events';
  events: Event[] = [];
  clubs: Club[] = [];
  loading = true;
  saving = false;
  error = '';
  showEventForm = false;
  showClubForm = false;
  uploadingClubAvatar = false;
  editingEventId: number | null = null;
  editingClubId: number | null = null;
  eventQuery = '';
  clubQuery = '';
  clubScope: 'all' | 'mine' = 'all';
  eventClubFilter: number | null = null;
  eventPage = 1;
  readonly pageSize = 6;
  loadingInviteEventId: number | null = null;
  private registrationsByEventId = new Map<number, EventRegistration>();
  inviteModal: { event: Event; registration: EventRegistration; qrImageUrl: string } | null = null;
  attendeesModal: { event: Event; registrations: EventRegistration[]; names: Map<number, string> } | null = null;
  membersModal: { club: Club; members: ClubMember[]; names: Map<number, string> } | null = null;
  requestsModal: { club: Club; requests: ClubMember[]; names: Map<number, string> } | null = null;

  eventForm: FormGroup = this.fb.group({
    titre: ['', Validators.required],
    description: [''],
    date: ['', Validators.required],
    lieu: [''],
    attendeeLimit: [null],
    clubId: [null]
  });

  clubForm: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    description: [''],
    logoUrl: ['']
  });

  constructor(
    private eventService: EventService,
    private fb: FormBuilder,
    private notifications: NotificationService,
    private postService: PostService,
    private authService: AuthService,
    public lang: LanguageService
  ) {}

  get canManageEvents(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'MENTOR';
  }

  /** Platform admin — can update/delete any club regardless of who created it. */
  get isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'ADMIN';
  }

  /** Name of the current attendee shown on the invite modal. */
  get inviteAttendeeName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.prenom} ${user.nom}`.trim() : (this.inviteModal ? `User #${this.inviteModal.registration.userId}` : '');
  }

  /** Earliest selectable date when creating an event: now, formatted for datetime-local (YYYY-MM-DDTHH:mm). */
  get minEventDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  /** True when the event has a capacity and it has been reached — no new registrations accepted. */
  isEventFull(event: Event): boolean {
    return event.attendeeLimit != null && event.registrationCount >= event.attendeeLimit;
  }

  get filteredEvents(): Event[] {
    const query = this.eventQuery.trim().toLowerCase();
    return this.events.filter(event => {
      const matchesQuery = !query || [event.titre, event.description, event.lieu, event.clubNom]
        .some(value => (value ?? '').toLowerCase().includes(query));
      const matchesClub = !this.eventClubFilter || event.clubId === this.eventClubFilter;
      return matchesQuery && matchesClub;
    });
  }

  get eventTotalPages(): number { return Math.max(1, Math.ceil(this.filteredEvents.length / this.pageSize)); }
  get pagedEvents(): Event[] {
    if (this.eventPage > this.eventTotalPages) this.eventPage = this.eventTotalPages;
    const start = (this.eventPage - 1) * this.pageSize;
    return this.filteredEvents.slice(start, start + this.pageSize);
  }

  get filteredClubs(): Club[] {
    const query = this.clubQuery.trim().toLowerCase();
    return this.clubs.filter(club => {
      const matchesQuery = !query || [club.nom, club.description].some(value => (value ?? '').toLowerCase().includes(query));
      const matchesScope = this.clubScope === 'all' || club.membershipStatus === 'APPROVED';
      return matchesQuery && matchesScope;
    });
  }

  get myClubsCount(): number { return this.clubs.filter(c => c.membershipStatus === 'APPROVED').length; }

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({ next: (events: Event[]) => this.events = events, error: () => this.error = 'Unable to load events' });
    this.eventService.getClubs().subscribe({
      next: (clubs: Club[]) => { this.clubs = clubs; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Unable to load clubs'; }
    });
  }

  saveEvent(): void {
    if (this.eventForm.invalid) return;
    const isCreate = !this.editingEventId;
    if (isCreate && new Date(this.eventForm.value.date).getTime() < Date.now()) {
      this.notifications.error('Event date cannot be before today');
      return;
    }
    this.saving = true;
    const payload = this.eventForm.value as EventRequest;
    const request = this.editingEventId
      ? this.eventService.updateEvent(this.editingEventId, payload)
      : this.eventService.createEvent(payload);
    request.subscribe({
      next: () => {
        if (isCreate) this.publishFeedAnnouncement(`New event posted: ${payload.titre}`);
        this.afterSave(isCreate ? 'Event saved' : 'Event updated');
      },
      error: () => this.failSave('Unable to save event')
    });
  }

  editEvent(event: Event): void {
    this.activeTab = 'events';
    this.showEventForm = true;
    this.editingEventId = event.id;
    this.eventForm.patchValue({ ...event, date: event.date.slice(0, 16), clubId: event.clubId ?? null, attendeeLimit: event.attendeeLimit ?? null });
  }

  deleteEvent(id: number): void {
    if (!this.notifications.confirm('Delete this event?')) return;
    this.eventService.deleteEvent(id).subscribe({ next: () => { this.notifications.success('Event deleted'); this.loadAll(); }, error: () => this.fail('Unable to delete event') });
  }

  register(event: Event): void {
    this.loadingInviteEventId = event.id;
    this.eventService.register(event.id).subscribe({
      next: (registration: EventRegistration) => {
        this.notifications.success('Registration confirmed');
        this.registrationsByEventId.set(event.id, registration);
        this.loadAll();
        void this.showInviteModal(event, registration);
      },
      error: (err: any) => {
        this.loadingInviteEventId = null;
        const msg = err.error?.message || err.message || '';
        if (msg.toLowerCase().includes('already')) {
          this.notifications.info('You are already registered for this event');
        } else if (msg.toLowerCase().includes('limit') || msg.toLowerCase().includes('full')) {
          this.notifications.error('This event is already full');
        } else {
          this.fail('Unable to register for this event');
        }
      }
    });
  }

  openMyInvite(event: Event): void {
    const cached = this.registrationsByEventId.get(event.id);
    if (cached) {
      void this.showInviteModal(event, cached);
      return;
    }
    this.loadingInviteEventId = event.id;
    this.eventService.getMyRegistration(event.id).subscribe({
      next: (registration: EventRegistration) => {
        this.registrationsByEventId.set(event.id, registration);
        void this.showInviteModal(event, registration);
      },
      error: (err: any) => {
        this.loadingInviteEventId = null;
        const msg = err.error?.message || err.message || '';
        if (msg.toLowerCase().includes('not found')) {
          this.notifications.info('Register for the event first to generate your invite QR code');
        } else {
          this.notifications.error('Unable to load your invite');
        }
      }
    });
  }

  saveClub(): void {
    if (this.clubForm.invalid) return;
    this.saving = true;
    const isCreate = !this.editingClubId;
    const request = this.editingClubId
      ? this.eventService.updateClub(this.editingClubId, this.clubForm.value)
      : this.eventService.createClub(this.clubForm.value);
    request.subscribe({
      next: () => {
        if (isCreate) this.publishFeedAnnouncement(`New club created: ${this.clubForm.value.nom}`);
        this.afterSave(isCreate ? 'Club saved' : 'Club updated');
      },
      error: () => this.failSave('Unable to save club')
    });
  }

  editClub(club: Club): void {
    this.activeTab = 'clubs';
    this.showClubForm = true;
    this.editingClubId = club.id;
    this.clubForm.patchValue(club);
  }

  onClubAvatarSelected(event: globalThis.Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingClubAvatar = true;
    this.authService.uploadAvatar(file).subscribe({
      next: ({ url }) => {
        this.clubForm.patchValue({ logoUrl: url });
        this.uploadingClubAvatar = false;
        this.notifications.success('Avatar uploaded');
        input.value = '';
      },
      error: () => { this.uploadingClubAvatar = false; this.notifications.error('Unable to upload avatar'); input.value = ''; }
    });
  }

  deleteClub(id: number): void {
    if (!this.notifications.confirm('Delete this club?')) return;
    this.eventService.deleteClub(id).subscribe({ next: () => { this.notifications.success('Club deleted'); this.loadAll(); }, error: () => this.fail('Unable to delete club') });
  }

  joinClub(id: number): void {
    this.eventService.joinClub(id).subscribe({
      next: () => { this.notifications.success('Join request sent — waiting for admin approval'); this.loadAll(); },
      error: (err: any) => {
        const msg = (err.error?.message || '').toLowerCase();
        if (msg.includes('pending')) this.notifications.info('Your join request is already pending approval');
        else if (msg.includes('already')) this.notifications.info('You are already a member of this club');
        else this.fail('Unable to join club');
      }
    });
  }

  leaveClub(club: Club): void {
    if (!this.notifications.confirm(`Leave "${club.nom}"?`)) return;
    this.eventService.leaveClub(club.id).subscribe({
      next: () => { this.notifications.success('You left the club'); this.loadAll(); },
      error: () => this.fail('Unable to leave club')
    });
  }

  viewRequests(club: Club): void {
    this.eventService.getClubRequests(club.id).subscribe({
      next: (requests: ClubMember[]) => {
        this.requestsModal = { club, requests, names: new Map<number, string>() };
        this.resolveRequestNames(requests);
      },
      error: () => this.notifications.error('Unable to load join requests')
    });
  }

  approveRequest(userId: number): void {
    if (!this.requestsModal) return;
    const clubId = this.requestsModal.club.id;
    this.eventService.approveRequest(clubId, userId).subscribe({
      next: () => { this.notifications.success('Request approved'); this.refreshRequests(clubId); this.loadAll(); },
      error: () => this.notifications.error('Unable to approve request')
    });
  }

  rejectRequest(userId: number): void {
    if (!this.requestsModal) return;
    const clubId = this.requestsModal.club.id;
    this.eventService.rejectRequest(clubId, userId).subscribe({
      next: () => { this.notifications.success('Request rejected'); this.refreshRequests(clubId); this.loadAll(); },
      error: () => this.notifications.error('Unable to reject request')
    });
  }

  private refreshRequests(clubId: number): void {
    this.eventService.getClubRequests(clubId).subscribe({
      next: (requests: ClubMember[]) => { if (this.requestsModal) { this.requestsModal.requests = requests; this.resolveRequestNames(requests); } },
      error: () => undefined
    });
  }

  private resolveRequestNames(requests: ClubMember[]): void {
    const ids = Array.from(new Set(requests.map(r => r.userId)));
    if (ids.length === 0) return;
    this.authService.getUsersByIds(ids).subscribe({
      next: (users) => {
        if (!this.requestsModal) return;
        const names = new Map<number, string>();
        users.forEach(u => names.set(u.id, `${u.prenom} ${u.nom}`.trim()));
        this.requestsModal.names = names;
      },
      error: () => undefined
    });
  }

  requestUserName(userId: number): string {
    return this.requestsModal?.names.get(userId) || `User #${userId}`;
  }

  /** Whether the current user is the club's admin (its creator) — only they manage join requests. */
  canManageClub(club: Club): boolean {
    return this.authService.getCurrentUser()?.id === club.creatorUserId;
  }

  closeRequestsModal(): void { this.requestsModal = null; }

  toggleEventForm(): void { this.showEventForm = !this.showEventForm; if (!this.showEventForm) this.resetEventForm(); }
  toggleClubForm(): void { this.showClubForm = !this.showClubForm; }
  resetEventForm(): void { this.editingEventId = null; this.showEventForm = false; this.eventForm.reset({ clubId: null, attendeeLimit: null }); }
  resetClubForm(): void { this.editingClubId = null; this.clubForm.reset(); }
  closeInviteModal(): void { this.inviteModal = null; }
  closeAttendeesModal(): void { this.attendeesModal = null; }
  closeMembersModal(): void { this.membersModal = null; }

  viewAttendees(event: Event): void {
    this.eventService.getEventRegistrations(event.id).subscribe({
      next: (registrations: EventRegistration[]) => {
        this.attendeesModal = { event, registrations, names: new Map<number, string>() };
        const ids = Array.from(new Set(registrations.map(r => r.userId)));
        if (ids.length === 0) return;
        this.authService.getUsersByIds(ids).subscribe({
          next: (users) => {
            if (!this.attendeesModal) return;
            const names = new Map<number, string>();
            users.forEach(u => names.set(u.id, `${u.prenom} ${u.nom}`.trim()));
            this.attendeesModal.names = names;
          },
          error: () => undefined
        });
      },
      error: () => this.notifications.error('Unable to load attendee list')
    });
  }

  /** Display name for an attendee, falling back gracefully while names are still loading. */
  attendeeName(userId: number): string {
    return this.attendeesModal?.names.get(userId) || `User #${userId}`;
  }

  viewMembers(club: Club): void {
    this.eventService.getClubMembers(club.id).subscribe({
      next: (members: ClubMember[]) => {
        this.membersModal = { club, members, names: new Map<number, string>() };
        const ids = Array.from(new Set(members.map(m => m.userId)));
        if (ids.length === 0) return;
        this.authService.getUsersByIds(ids).subscribe({
          next: (users) => {
            if (!this.membersModal) return;
            const names = new Map<number, string>();
            users.forEach(u => names.set(u.id, `${u.prenom} ${u.nom}`.trim()));
            this.membersModal.names = names;
          },
          error: () => undefined
        });
      },
      error: () => this.notifications.error('Unable to load club members')
    });
  }

  /** Display name for a club member, falling back gracefully while names are still loading. */
  memberName(userId: number): string {
    return this.membersModal?.names.get(userId) || `User #${userId}`;
  }

  private afterSave(message: string): void {
    this.saving = false;
    this.error = '';
    this.resetEventForm();
    this.resetClubForm();
    this.notifications.success(message);
    this.loadAll();
  }

  private publishFeedAnnouncement(content: string): void {
    this.postService.createPost({ contenu: content, autoApprove: true }).subscribe({ error: () => undefined });
  }

  private async showInviteModal(event: Event, registration: EventRegistration): Promise<void> {
    try {
      const qrImageUrl = await QRCode.toDataURL(this.buildInvitePayload(event, registration), {
        width: 240,
        margin: 1,
        errorCorrectionLevel: 'M'
      });
      this.inviteModal = { event, registration, qrImageUrl };
    } catch {
      this.notifications.error('Unable to generate QR code for this invite');
    } finally {
      this.loadingInviteEventId = null;
    }
  }

  /** Human-readable QR content with the full event details + the specific attendee. */
  private buildInvitePayload(event: Event, registration: EventRegistration): string {
    const user = this.authService.getCurrentUser();
    const attendee = user ? `${user.prenom} ${user.nom}`.trim() : `User #${registration.userId}`;
    const when = new Date(event.date).toLocaleString();
    return [
      'ESPRIT Connect — Event Invite',
      `Event: ${event.titre}`,
      `Date: ${when}`,
      `Location: ${event.lieu || 'TBA'}`,
      `Attendee: ${attendee}`,
      `Invite code: ${registration.inviteCode}`,
      `Ref: event=${event.id};user=${registration.userId}`
    ].join('\n');
  }

  private failSave(message: string): void { this.saving = false; this.fail(message); }
  private fail(message: string): void { this.error = message; this.notifications.error(message); }
}
