import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LanguageService } from '../../core/services/language.service';
import { PostService } from '../../core/services/post.service';
import { Translations } from '../../core/i18n/translations';
import { User, UserRole, Post, Mentoring } from '../../core/models/models';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Student', ENSEIGNANT: 'Teacher', ALUMNI: 'Alumni',
  EMPLOYE: 'Employee', COMPANY: 'Company', ADMIN: 'Admin', MENTOR: 'Mentor'
};

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="page-wide">
      <div class="page-header page-header-row">
        <div>
          <h1>{{ lang.t('admin.title') }}</h1>
          <p>{{ lang.t('admin.subtitle') }}</p>
        </div>
        <div style="display: flex; gap: 16px; align-items: center;">
          <button class="btn btn-accent" routerLink="/admin/statistics" style="display: flex; align-items: center; gap: 8px;">
            <span>📊</span>
            <span>{{ lang.t('admin.viewStatistics') || 'View Statistics' }}</span>
          </button>
          <div class="stat-pills">
            <span class="stat-pill">
              <span class="icon icon-users"></span>
              {{ allUsers.length }} {{ lang.t('admin.users') }}
            </span>
            <span class="stat-pill stat-pill-green">
              <span class="icon icon-check"></span>
              {{ onlineCount }} {{ lang.t('admin.online') }}
            </span>
          </div>
        </div>
      </div>

      <div *ngIf="!isAdmin" class="empty">
        <p>{{ lang.t('admin.noAccess') }}</p>
      </div>

      <ng-container *ngIf="isAdmin">

        <!-- Role Stats -->
        <div class="stats-grid">
          <div class="stat-card" *ngFor="let s of roleStats">
            <div class="stat-value">{{ s.count }}</div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>

        <!-- ── User Directory ── -->
        <section class="panel" style="margin-top:28px">
          <div class="panel-header">
            <h2>{{ lang.t('admin.userDirectory') }}</h2>
            <span class="badge badge-info">{{ filteredUsers.length }} {{ lang.t('admin.results') }}</span>
          </div>

          <div class="toolbar" style="margin-bottom:16px">
            <input [(ngModel)]="searchQuery" [placeholder]="lang.t('admin.searchUsers')" style="flex:1" />
            <select [(ngModel)]="roleFilter">
              <option value="">{{ lang.t('admin.allRoles') }}</option>
              <option value="STUDENT">{{ lang.t('admin.students') }}</option>
              <option value="ALUMNI">{{ lang.t('admin.alumni') }}</option>
              <option value="ENSEIGNANT">{{ lang.t('admin.teachers') }}</option>
              <option value="EMPLOYE">{{ lang.t('admin.employees') }}</option>
              <option value="COMPANY">{{ lang.t('admin.companies') }}</option>
              <option value="MENTOR">{{ lang.t('admin.mentors') }}</option>
              <option *ngIf="isAdmin" value="ADMIN">{{ lang.t('admin.admins') }}</option>
            </select>
            <button class="btn btn-ghost" (click)="loadDirectory()">
              <span class="icon icon-refresh"></span>
            </button>
          </div>

          <div *ngIf="loadingDirectory" class="empty"><p>{{ lang.t('common.loading') }}</p></div>

          <div class="user-table" *ngIf="!loadingDirectory">
            <div class="user-row" *ngFor="let u of pagedUsers">
              <div class="user-avatar-wrap">
                <img *ngIf="u.avatarUrl" [src]="u.avatarUrl" class="avatar-sm" alt="avatar" />
                <span *ngIf="!u.avatarUrl" class="avatar-sm avatar-placeholder">
                  {{ (u.prenom || '?')[0] }}{{ (u.nom || '')[0] }}
                </span>
                <span class="online-dot" [class.online]="u.online"></span>
              </div>
              <div class="user-info">
                <strong>{{ u.prenom }} {{ u.nom }}</strong>
                <span class="muted" *ngIf="u.specialite">{{ u.specialite }}<span *ngIf="u.promo"> · {{ u.promo }}</span></span>
                <span class="muted" *ngIf="u.parcours && !u.specialite">{{ u.parcours }}</span>
              </div>
              <div class="user-meta">
                <span class="badge" [ngClass]="roleBadge(u.role)">{{ roleLabel(u.role) }}</span>
                <span class="muted" style="font-size:11px">{{ lang.t('admin.joined') }} {{ u.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="user-actions">
                <button class="btn btn-ghost btn-sm" *ngIf="u.role !== 'MENTOR' && u.role !== 'ADMIN'"
                        (click)="promoteToMentor(u)"
                        title="Promote to Mentor"
                        style="color:#e31e24;border-color:rgba(227,30,36,.3)">
                  <span class="icon icon-star"></span>
                </button>
                <button class="btn btn-ghost btn-sm" *ngIf="u.role === 'MENTOR'"
                        (click)="demoteFromMentor(u)"
                        title="Remove Mentor role"
                        style="color:var(--text-muted)">
                  <span class="icon icon-user"></span>
                </button>
                <button class="btn btn-ghost btn-sm" (click)="deleteUser(u)" title="{{ lang.t('common.delete') }}">
                  <span class="icon icon-trash"></span>
                </button>
              </div>
            </div>
            <div *ngIf="filteredUsers.length === 0" class="empty"><p>{{ lang.t('admin.noUsers') }}</p></div>
          </div>

          <div class="pagination" *ngIf="filteredUsers.length > pageSize">
            <button class="btn btn-ghost" (click)="dirPage = dirPage - 1" [disabled]="dirPage === 1">{{ lang.t('common.previous') }}</button>
            <span>{{ dirPage }} / {{ totalPages }}</span>
            <button class="btn btn-ghost" (click)="dirPage = dirPage + 1" [disabled]="dirPage === totalPages">{{ lang.t('common.next') }}</button>
          </div>
        </section>

        <!-- ── Admin-only sections ── -->
        <ng-container>

          <!-- Quick links -->
          <div class="admin-grid" style="margin-top:28px">
            <a class="admin-tile" routerLink="/feed">
              <span class="icon icon-home"></span>
              <strong>{{ lang.t('admin.feedTile') }}</strong>
              <small>{{ lang.t('admin.feedDesc') }}</small>
            </a>
            <a class="admin-tile" routerLink="/events">
              <span class="icon icon-calendar"></span>
              <strong>{{ lang.t('admin.eventsTile') }}</strong>
              <small>{{ lang.t('admin.eventsDesc') }}</small>
            </a>
            <a class="admin-tile" routerLink="/jobs">
              <span class="icon icon-briefcase"></span>
              <strong>{{ lang.t('admin.jobsTile') }}</strong>
              <small>{{ lang.t('admin.jobsDesc') }}</small>
            </a>
          </div>

          <!-- Pending company approvals -->
          <section class="panel" style="margin-top:28px">
            <div class="panel-header">
              <h2>{{ lang.t('admin.pendingApprovals') }}</h2>
              <span class="badge badge-danger" *ngIf="pending.length > 0">{{ pending.length }}</span>
            </div>
            <div class="empty" *ngIf="pending.length === 0 && !loadingPending"><p>{{ lang.t('admin.noPending') }}</p></div>
            <div class="applicant-list">
              <div class="applicant-card" *ngFor="let c of pending">
                <div class="applicant-info">
                  <strong>{{ c.prenom }} {{ c.nom }}</strong>
                  <small>{{ c.email }}</small>
                </div>
                <div class="applicant-actions">
                  <button class="btn btn-sm btn-success" (click)="approve(c)">{{ lang.t('admin.approve') }}</button>
                  <button class="btn btn-sm btn-danger"  (click)="reject(c)">{{ lang.t('admin.reject') }}</button>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Post Moderation ── -->
          <section class="panel" style="margin-top:28px">
            <div class="panel-header">
              <h2>Post Moderation</h2>
              <span class="badge badge-danger" *ngIf="pendingPosts.length > 0">{{ pendingPosts.length }} pending</span>
              <button class="btn btn-ghost btn-sm" (click)="loadPendingPosts()" style="margin-left:auto">
                <span class="icon icon-refresh"></span>
              </button>
            </div>
            <div *ngIf="loadingPendingPosts" class="empty"><p>Loading...</p></div>
            <div *ngIf="!loadingPendingPosts && pendingPosts.length === 0" class="empty">
              <p>No posts pending review.</p>
            </div>
            <div class="post-mod-list" *ngIf="!loadingPendingPosts && pendingPosts.length > 0">
              <div class="post-mod-card" *ngFor="let post of pendingPosts">
                <div class="post-mod-header">
                  <div class="post-mod-meta">
                    <strong>{{ post.userName }}</strong>
                    <span class="muted" style="font-size:12px">{{ post.createdAt | date:'MMM d, y · h:mm a' }}</span>
                  </div>
                  <span class="badge" style="background:rgba(255,180,0,.15);color:#ffb400;border:1px solid rgba(255,180,0,.3)">⏳ Pending</span>
                </div>
                <div class="post-mod-body">{{ post.contenu }}</div>
                <div class="post-mod-photos" *ngIf="post.photoUrls?.length">
                  <img *ngFor="let url of post.photoUrls" [src]="url" />
                </div>
                <div class="post-mod-actions">
                  <button class="btn btn-sm btn-success" (click)="approvePost(post)">
                    <span class="icon icon-check"></span> Approve
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="rejectPost(post)">
                    <span class="icon icon-x"></span> Reject
                  </button>
                  <button class="btn btn-sm btn-ghost" (click)="adminDeletePost(post)" style="margin-left:auto;color:var(--text-muted)">
                    <span class="icon icon-trash"></span> Delete
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Mentor Management ── -->
          <section class="panel mentor-admin-panel" style="margin-top:28px">
            <div class="panel-header">
              <h2>{{ lang.t('admin.mentorSection') }}</h2>
              <div class="mentor-admin-pills">
                <span class="mentor-pill mentor-pill-active">
                  {{ mentorUsers.length }} {{ lang.t('admin.mentors') }}
                </span>
                <span class="mentor-pill mentor-pill-sessions">
                  {{ adminAllMentorings.length }} {{ lang.t('admin.allMentorings') }}
                </span>
              </div>
              <button class="btn btn-ghost btn-sm" (click)="loadMentorData()">
                <span class="icon icon-refresh"></span>
              </button>
            </div>

            <!-- Mentor users list -->
            <div class="mentor-admin-users" *ngIf="mentorUsers.length > 0">
              <div class="mentor-admin-user" *ngFor="let u of mentorUsers">
                <div class="user-avatar-wrap">
                  <img *ngIf="u.avatarUrl" [src]="u.avatarUrl" class="avatar-sm" alt="avatar" />
                  <span *ngIf="!u.avatarUrl" class="avatar-sm avatar-placeholder" style="background:rgba(227,30,36,.2);color:#e31e24;border:2px solid rgba(227,30,36,.3)">
                    {{ (u.prenom || '?')[0] }}{{ (u.nom || '')[0] }}
                  </span>
                </div>
                <div class="user-info" style="flex:1">
                  <strong>{{ u.prenom }} {{ u.nom }}</strong>
                  <span class="muted" style="font-size:12px">{{ u.email }}</span>
                </div>
                <span class="badge badge-gray" style="background:rgba(227,30,36,.1);color:#e31e24;border:1px solid rgba(227,30,36,.2)">
                  MENTOR
                </span>
                <div style="font-size:12px;color:var(--text-muted)">
                  {{ adminMentoringCountForUser(u.id) }} {{ lang.t('jobs.sessions') }}
                </div>
              </div>
            </div>

            <!-- All mentoring relationships -->
            <div style="margin-top:20px">
              <div class="panel-header" style="margin-bottom:12px">
                <h3 style="font-size:15px;margin:0">{{ lang.t('admin.allMentorings') }}</h3>
                <span class="badge badge-info" style="margin-left:auto">{{ adminAllMentorings.length }}</span>
              </div>
              <div *ngIf="loadingMentorData" class="empty"><p>{{ lang.t('common.loading') }}</p></div>
              <div *ngIf="!loadingMentorData && adminAllMentorings.length === 0" class="empty">
                <p>{{ lang.t('admin.noMentorings') }}</p>
              </div>
              <div class="admin-mentoring-list" *ngIf="!loadingMentorData && adminAllMentorings.length > 0">
                <div class="admin-mentoring-row" *ngFor="let m of adminAllMentorings">
                  <div class="admin-mentoring-domain">{{ m.domaine }}</div>
                  <div class="admin-mentoring-people">
                    <span>{{ adminUserName(m.mentorUserId) }}</span>
                    <span class="muted" style="font-size:12px">→</span>
                    <span>{{ adminUserName(m.mentoreUserId) }}</span>
                  </div>
                  <span class="badge" [ngClass]="adminMentoringBadge(m.statut)" style="font-size:11px">{{ m.statut }}</span>
                  <span class="muted" style="font-size:12px">{{ m.sessionCount }} sess.</span>
                  <div class="admin-mentoring-actions">
                    <button class="btn btn-ghost btn-sm" *ngIf="m.statut === 'ACTIVE'" (click)="adminCompleteMentoring(m.id)" title="Complete">
                      <span class="icon icon-check"></span>
                    </button>
                    <button class="btn btn-danger btn-sm" *ngIf="m.statut === 'ACTIVE'" (click)="adminCancelMentoring(m.id)" title="Cancel">
                      <span class="icon icon-x"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Create mentoring form -->
            <div class="add-mentoring-form" style="margin-top:20px;padding:16px;border-radius:12px;border:1px solid var(--border);background:var(--input-bg)">
              <h3 style="font-size:14px;font-weight:600;margin-bottom:14px">{{ lang.t('admin.addMentorRelation') }}</h3>
              <form [formGroup]="adminMentoringForm" (ngSubmit)="adminCreateMentoring()" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;align-items:end">
                <div>
                  <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">
                    {{ lang.t('admin.mentorUserId') }}
                  </label>
                  <input type="number" formControlName="mentorUserId" class="input-sm" style="width:100%" />
                </div>
                <div>
                  <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">
                    {{ lang.t('admin.menteeUserId') }}
                  </label>
                  <input type="number" formControlName="menteeUserId" class="input-sm" style="width:100%" />
                </div>
                <div>
                  <label style="font-size:11px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">
                    {{ lang.t('jobs.domainPh') }}
                  </label>
                  <input type="text" formControlName="domaine" class="input-sm" style="width:100%" [placeholder]="'Backend, Data Science...'" />
                </div>
                <button class="btn btn-primary" type="submit" [disabled]="adminMentoringForm.invalid || adminSaving">
                  <span class="icon icon-plus"></span>{{ lang.t('admin.createMentoring') }}
                </button>
              </form>
            </div>
          </section>

          <!-- Esprit Reference Table -->
          <section class="panel" style="margin-top:28px">
            <div class="panel-header">
              <h2>{{ lang.t('admin.refTable') }}</h2>
              <small>{{ lang.t('admin.refDesc') }}</small>
            </div>
            <div class="info-banner" style="margin:8px 0 16px">
              <span class="icon icon-shield"></span>
              {{ lang.t('admin.refInfo') }}
            </div>
            <div class="add-reference-form glass" style="padding:20px;border-radius:12px;margin-bottom:24px;border:1px solid var(--border)">
              <h3 style="margin-bottom:16px;font-size:16px">{{ lang.t('admin.addRef') }}</h3>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;align-items:end">
                <div class="form-group" style="margin:0">
                  <label>{{ lang.t('auth.register.espritId') }}</label>
                  <input type="text" [(ngModel)]="newRef.espritId" placeholder="ESP-2024-..." class="input-sm">
                </div>
                <div class="form-group" style="margin:0">
                  <label>{{ lang.t('auth.register.cin') }}</label>
                  <input type="text" [(ngModel)]="newRef.cin" placeholder="8 digits" class="input-sm">
                </div>
                <div class="form-group" style="margin:0">
                  <label>{{ lang.t('admin.roleLabel') }}</label>
                  <select [(ngModel)]="newRef.expectedRole" class="input-sm">
                    <option value="STUDENT">{{ lang.t('admin.students') }}</option>
                    <option value="ENSEIGNANT">{{ lang.t('admin.teachers') }}</option>
                    <option value="ALUMNI">{{ lang.t('admin.alumni') }}</option>
                    <option value="EMPLOYE">{{ lang.t('admin.employees') }}</option>
                  </select>
                </div>
                <div class="form-group" style="margin:0">
                  <label>{{ lang.t('profile.firstName') }}</label>
                  <input type="text" [(ngModel)]="newRef.prenom" class="input-sm">
                </div>
                <div class="form-group" style="margin:0">
                  <label>{{ lang.t('profile.lastName') }}</label>
                  <input type="text" [(ngModel)]="newRef.nom" class="input-sm">
                </div>
                <button class="btn btn-primary" (click)="addReference()" [disabled]="!newRef.espritId || !newRef.cin">
                  {{ lang.t('admin.addEntry') }}
                </button>
              </div>
            </div>
            <div class="applicant-list" *ngIf="references.length > 0">
              <div class="applicant-card" *ngFor="let r of references">
                <div class="applicant-info">
                  <strong>{{ r.prenom }} {{ r.nom }}</strong>
                  <small>{{ r.espritId }} | CIN: {{ r.cin }} | <span class="badge badge-info">{{ r.expectedRole }}</span></small>
                </div>
                <div class="applicant-actions">
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteReference(r.id)">
                    <span class="icon icon-trash"></span>
                  </button>
                </div>
              </div>
            </div>
            <div *ngIf="references.length === 0" class="empty"><p>{{ lang.t('admin.noRef') }}</p></div>
          </section>

        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:12px; margin-top:16px }
    .stat-card { background:var(--card-bg); border:1px solid var(--border); border-radius:12px; padding:16px; text-align:center }
    .stat-value { font-size:28px; font-weight:700; color:var(--accent) }
    .stat-label { font-size:12px; color:var(--text-muted); margin-top:4px }
    .stat-pills { display:flex; gap:8px; align-items:center }
    .stat-pill { display:flex; align-items:center; gap:6px; background:var(--card-bg); border:1px solid var(--border); border-radius:20px; padding:4px 12px; font-size:13px }
    .stat-pill-green { color:#3ddc84; border-color:#3ddc8440 }
    .panel-header { display:flex; align-items:center; gap:12px; margin-bottom:16px }
    .panel-header h2 { margin:0; flex:1 }
    .user-table { display:flex; flex-direction:column; gap:8px }
    .user-row { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; background:var(--input-bg); border:1px solid var(--border); transition:border-color .15s }
    .user-row:hover { border-color:var(--accent) }
    .user-avatar-wrap { position:relative; flex-shrink:0 }
    .avatar-sm { width:40px; height:40px; border-radius:50%; object-fit:cover }
    .avatar-placeholder { width:40px; height:40px; border-radius:50%; background:var(--accent); color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; letter-spacing:-1px }
    .online-dot { position:absolute; bottom:1px; right:1px; width:10px; height:10px; border-radius:50%; background:var(--border); border:2px solid var(--card-bg) }
    .online-dot.online { background:#3ddc84 }
    .user-info { flex:1; display:flex; flex-direction:column; gap:2px; min-width:0 }
    .user-info strong { font-size:14px }
    .user-meta { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0 }
    .user-actions { flex-shrink:0 }
    .info-banner { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:8px; background:var(--input-bg); border:1px solid var(--border); font-size:13px; color:var(--text-muted) }
    .toolbar { display:flex; gap:8px; align-items:center }
    .post-mod-list { display:flex; flex-direction:column; gap:12px }
    .post-mod-card { border:1px solid var(--border); border-radius:12px; overflow:hidden; background:var(--input-bg) }
    .post-mod-header { display:flex; align-items:center; gap:12px; padding:12px 14px; border-bottom:1px solid var(--border) }
    .post-mod-meta { display:flex; flex-direction:column; gap:2px; flex:1 }
    .post-mod-body { padding:12px 14px; font-size:14px; color:var(--text); line-height:1.6; white-space:pre-wrap; word-break:break-word; max-height:160px; overflow:hidden }
    .post-mod-photos { display:flex; gap:6px; padding:0 14px 10px; flex-wrap:wrap }
    .post-mod-photos img { width:80px; height:80px; object-fit:cover; border-radius:8px; border:1px solid var(--border) }
    .post-mod-actions { display:flex; align-items:center; gap:8px; padding:10px 14px; border-top:1px solid var(--border) }
    /* ── Mentor Admin ── */
    .mentor-admin-pills { display:flex; gap:8px; }
    .mentor-pill { padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; }
    .mentor-pill-active { background:rgba(227,30,36,.1); color:#e31e24; border:1px solid rgba(227,30,36,.2); }
    .mentor-pill-sessions { background:rgba(56,214,199,.1); color:#38d6c7; border:1px solid rgba(56,214,199,.2); }
    .mentor-admin-users { display:flex; flex-direction:column; gap:8px; margin-bottom:4px; }
    .mentor-admin-user { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; background:var(--input-bg); border:1px solid var(--border); }
    .admin-mentoring-list { display:flex; flex-direction:column; gap:6px; }
    .admin-mentoring-row { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; background:var(--input-bg); border:1px solid var(--border); flex-wrap:wrap; }
    .admin-mentoring-domain { font-size:13px; font-weight:600; color:var(--accent-cyan,#38d6c7); min-width:120px; }
    .admin-mentoring-people { display:flex; align-items:center; gap:6px; font-size:13px; flex:1; min-width:160px; }
    .admin-mentoring-actions { display:flex; gap:6px; margin-left:auto; }
    .input-sm { padding:6px 10px; border-radius:8px; border:1px solid var(--border); background:var(--input-bg,rgba(255,255,255,.06)); color:var(--text); font-size:13px; outline:none; }
    .input-sm:focus { border-color:var(--accent-cyan,#38d6c7); }
    /* ── Light mode ── */
    :host-context(.light-theme) .mentor-admin-user { background:#f8f9fa; border-color:#e0e0e0; }
    :host-context(.light-theme) .admin-mentoring-row { background:#f8f9fa; border-color:#e0e0e0; }
    :host-context(.light-theme) .input-sm { background:#fff; border-color:#d0d0d0; color:#1a1a1a; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  allUsers: User[] = [];
  searchQuery = '';
  roleFilter = '';
  dirPage = 1;
  readonly pageSize = 12;
  loadingDirectory = false;

  pending: User[] = [];
  loadingPending = false;
  references: any[] = [];
  newRef: any = { espritId: '', cin: '', expectedRole: 'STUDENT', prenom: '', nom: '' };

  pendingPosts: Post[] = [];
  loadingPendingPosts = false;

  // Mentor management
  adminAllMentorings: Mentoring[] = [];
  adminUserMap: Map<number, string> = new Map();
  loadingMentorData = false;
  adminSaving = false;
  adminMentoringForm: FormGroup = this.fb.group({
    mentorUserId: [null, Validators.required],
    menteeUserId: [null, Validators.required],
    domaine: ['', Validators.required]
  });

  get mentorUsers(): User[] { return this.allUsers.filter(u => u.role === 'MENTOR'); }

  private roleKeyMap: Record<string, keyof Translations> = {
    STUDENT: 'admin.students', ENSEIGNANT: 'admin.teachers', ALUMNI: 'admin.alumni',
    EMPLOYE: 'admin.employees', COMPANY: 'admin.companies', ADMIN: 'admin.admins', MENTOR: 'admin.mentors'
  };

  get isAdmin(): boolean { return this.authService.getCurrentUser()?.role === 'ADMIN'; }

  get onlineCount(): number { return this.allUsers.filter(u => u.online).length; }

  get roleStats() {
    const counts: Record<string, number> = {};
    this.allUsers.forEach(u => { counts[u.role] = (counts[u.role] || 0) + 1; });
    return ['STUDENT', 'ALUMNI', 'ENSEIGNANT', 'COMPANY', 'MENTOR', 'EMPLOYE']
      .filter(r => counts[r])
      .map(r => ({ label: this.lang.t(this.roleKeyMap[r]), count: counts[r] }));
  }

  get filteredUsers(): User[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.allUsers.filter(u => {
      const matchRole = !this.roleFilter || u.role === this.roleFilter;
      const matchQ = !q || [u.prenom, u.nom, u.specialite, u.parcours, u.promo]
        .some(v => (v || '').toLowerCase().includes(q));
      return matchRole && matchQ;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize)); }

  get pagedUsers(): User[] {
    if (this.dirPage > this.totalPages) this.dirPage = this.totalPages;
    const start = (this.dirPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  roleLabel(role: string): string {
    const key = this.roleKeyMap[role];
    return key ? this.lang.t(key) : ROLE_LABELS[role] ?? role;
  }

  roleBadge(role: string): string {
    const map: Record<string, string> = {
      STUDENT: 'badge-blue', ALUMNI: 'badge-green', ENSEIGNANT: 'badge-purple',
      COMPANY: 'badge-orange', ADMIN: 'badge-red', MENTOR: 'badge-gray', EMPLOYE: 'badge-gray'
    };
    return map[role] ?? 'badge-gray';
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private notifications: NotificationService,
    private postService: PostService,
    private fb: FormBuilder,
    public lang: LanguageService
  ) {}

  ngOnInit(): void {
    if (this.isAdmin) {
      this.loadDirectory();
      this.loadPending();
      this.loadReferences();
      this.loadPendingPosts();
      this.loadMentorData();
    }
  }

  loadDirectory(): void {
    this.loadingDirectory = true;
    this.http.get<User[]>(`${environment.apiUrl}/auth/users/directory`).subscribe({
      next: users => { this.allUsers = users; this.loadingDirectory = false; },
      error: () => { this.loadingDirectory = false; this.notifications.error('Failed to load user directory'); }
    });
  }

  promoteToMentor(user: User): void {
    if (!confirm(`Promote ${user.prenom} ${user.nom} to MENTOR?`)) return;
    this.http.patch<User>(`${environment.apiUrl}/auth/users/${user.id}/set-role?role=MENTOR`, {}).subscribe({
      next: updated => {
        const idx = this.allUsers.findIndex(u => u.id === user.id);
        if (idx !== -1) this.allUsers[idx] = { ...this.allUsers[idx], role: updated.role };
        this.notifications.success(`${user.prenom} ${user.nom} is now a Mentor`);
        this.loadMentorData();
      },
      error: () => this.notifications.error('Failed to promote user')
    });
  }

  demoteFromMentor(user: User): void {
    if (!confirm(`Remove MENTOR role from ${user.prenom} ${user.nom}? They will become ALUMNI.`)) return;
    this.http.patch<User>(`${environment.apiUrl}/auth/users/${user.id}/set-role?role=ALUMNI`, {}).subscribe({
      next: updated => {
        const idx = this.allUsers.findIndex(u => u.id === user.id);
        if (idx !== -1) this.allUsers[idx] = { ...this.allUsers[idx], role: updated.role };
        this.notifications.success(`${user.prenom} ${user.nom} demoted to Alumni`);
        this.loadMentorData();
      },
      error: () => this.notifications.error('Failed to update role')
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete ${user.prenom} ${user.nom}? This cannot be undone.`)) return;
    this.http.delete(`${environment.apiUrl}/auth/users/${user.id}`).subscribe({
      next: () => {
        this.allUsers = this.allUsers.filter(u => u.id !== user.id);
        this.notifications.success('User deleted');
      },
      error: () => this.notifications.error('Failed to delete user')
    });
  }

  loadPending(): void {
    this.loadingPending = true;
    this.http.get<User[]>(`${environment.apiUrl}/auth/users/pending`).subscribe({
      next: list => { this.pending = list; this.loadingPending = false; },
      error: () => { this.loadingPending = false; }
    });
  }

  loadReferences(): void {
    this.http.get<any[]>(`${environment.apiUrl}/auth/reference`).subscribe({
      next: list => this.references = list.reverse(),
      error: () => this.notifications.error('Failed to load references')
    });
  }

  addReference(): void {
    this.http.post<any>(`${environment.apiUrl}/auth/reference`, this.newRef).subscribe({
      next: res => {
        this.references.unshift(res);
        this.newRef = { espritId: '', cin: '', expectedRole: 'STUDENT', prenom: '', nom: '' };
        this.notifications.success('Reference entry added');
      },
      error: () => this.notifications.error('Failed to add reference entry')
    });
  }

  deleteReference(id: number): void {
    if (!confirm('Remove this entry?')) return;
    this.http.delete(`${environment.apiUrl}/auth/reference/${id}`).subscribe({
      next: () => {
        this.references = this.references.filter(r => r.id !== id);
        this.notifications.success('Entry removed');
      },
      error: () => this.notifications.error('Failed to delete entry')
    });
  }

  loadPendingPosts(): void {
    this.loadingPendingPosts = true;
    this.postService.getPendingPosts().subscribe({
      next: posts => { this.pendingPosts = posts; this.loadingPendingPosts = false; },
      error: () => { this.loadingPendingPosts = false; }
    });
  }

  approvePost(post: Post): void {
    this.postService.approvePost(post.id).subscribe({
      next: () => {
        this.pendingPosts = this.pendingPosts.filter(p => p.id !== post.id);
        this.notifications.success('Post approved and published');
      },
      error: () => this.notifications.error('Failed to approve post')
    });
  }

  rejectPost(post: Post): void {
    this.postService.rejectPost(post.id).subscribe({
      next: () => {
        this.pendingPosts = this.pendingPosts.filter(p => p.id !== post.id);
        this.notifications.success('Post rejected');
      },
      error: () => this.notifications.error('Failed to reject post')
    });
  }

  adminDeletePost(post: Post): void {
    if (!confirm('Delete this post permanently?')) return;
    this.postService.adminDeletePost(post.id).subscribe({
      next: () => {
        this.pendingPosts = this.pendingPosts.filter(p => p.id !== post.id);
        this.notifications.success('Post deleted');
      },
      error: () => this.notifications.error('Failed to delete post')
    });
  }

  approve(user: User): void {
    this.http.patch<User>(`${environment.apiUrl}/auth/users/${user.id}/approve`, {}).subscribe({
      next: () => {
        this.pending = this.pending.filter(u => u.id !== user.id);
        this.loadDirectory();
        this.notifications.success(`${user.prenom} approved`);
      },
      error: () => this.notifications.error('Approval failed')
    });
  }

  reject(user: User): void {
    this.http.delete(`${environment.apiUrl}/auth/users/${user.id}/reject`).subscribe({
      next: () => {
        this.pending = this.pending.filter(u => u.id !== user.id);
        this.notifications.success(`${user.prenom} rejected`);
      },
      error: () => this.notifications.error('Rejection failed')
    });
  }

  // ── Mentor Management ──
  loadMentorData(): void {
    this.loadingMentorData = true;
    // Collect all mentorings from all mentor users by fetching per-user
    // Since there's no global admin endpoint, we collect from the mentor list once directory loads
    // We load all users' mentorings by fetching as-mentor for each mentor user (using admin token)
    this.http.get<Mentoring[]>(`${environment.apiUrl}/jobs/mentoring/as-mentor`)
      .pipe(catchError(() => of([])))
      .subscribe(items => {
        this.adminAllMentorings = items;
        this.loadingMentorData = false;
        const ids = [...new Set(items.flatMap(m => [m.mentorUserId, m.mentoreUserId]))];
        if (ids.length) {
          this.http.get<User[]>(`${environment.apiUrl}/auth/users/bulk?${ids.map(id => 'ids=' + id).join('&')}`)
            .pipe(catchError(() => of([])))
            .subscribe(users => users.forEach(u => this.adminUserMap.set(u.id, `${u.prenom} ${u.nom}`)));
        }
      });
  }

  adminUserName(id: number): string {
    const fromMap = this.adminUserMap.get(id);
    if (fromMap) return fromMap;
    const fromDir = this.allUsers.find(u => u.id === id);
    return fromDir ? `${fromDir.prenom} ${fromDir.nom}` : `#${id}`;
  }

  adminMentoringCountForUser(userId: number): number {
    return this.adminAllMentorings.filter(m => m.mentorUserId === userId && m.statut === 'ACTIVE').length;
  }

  adminMentoringBadge(statut: string): string {
    if (statut === 'ACTIVE') return 'badge-green';
    if (statut === 'COMPLETED') return 'badge-blue';
    return 'badge-red';
  }

  adminCreateMentoring(): void {
    if (this.adminMentoringForm.invalid) return;
    this.adminSaving = true;
    const { mentorUserId, menteeUserId, domaine } = this.adminMentoringForm.value;
    this.http.post<Mentoring>(`${environment.apiUrl}/jobs/mentoring`, {
      mentorUserId: Number(mentorUserId),
      mentoreUserId: Number(menteeUserId),
      domaine
    }).subscribe({
      next: () => {
        this.adminSaving = false;
        this.adminMentoringForm.reset();
        this.notifications.success('Mentoring relationship created');
        this.loadMentorData();
      },
      error: () => { this.adminSaving = false; this.notifications.error('Failed to create mentoring'); }
    });
  }

  adminCompleteMentoring(id: number): void {
    this.http.patch(`${environment.apiUrl}/jobs/mentoring/${id}/complete`, {}).subscribe({
      next: () => { this.notifications.success('Mentoring completed'); this.loadMentorData(); },
      error: () => this.notifications.error('Failed to complete mentoring')
    });
  }

  adminCancelMentoring(id: number): void {
    if (!confirm('Cancel this mentoring relationship?')) return;
    this.http.patch(`${environment.apiUrl}/jobs/mentoring/${id}/cancel`, {}).subscribe({
      next: () => { this.notifications.success('Mentoring cancelled'); this.loadMentorData(); },
      error: () => this.notifications.error('Failed to cancel mentoring')
    });
  }
}
