import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Mentoring, MentoringSession } from '../../core/models/models';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LanguageService } from '../../core/services/language.service';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-mentoring',
  template: `
    <div class="page-wide">

      <!-- ── Hero ── -->
      <div class="mentoring-hero">
        <div class="mentoring-hero-text">
          <h1>{{ lang.t('nav.mentoring') }}</h1>
          <p>{{ lang.t('mentoring.subtitle') }}</p>
        </div>
        <div class="mentoring-hero-stats">
          <div class="m-kpi">
            <span class="m-kpi-value m-kpi-red">{{ allMentorUsers.length }}</span>
            <span class="m-kpi-label">{{ lang.t('admin.mentors') }}</span>
          </div>
          <div class="m-kpi-sep"></div>
          <div class="m-kpi">
            <span class="m-kpi-value m-kpi-green">{{ activeMentoringCount }}</span>
            <span class="m-kpi-label">{{ lang.t('jobs.statusActive') }}</span>
          </div>
          <div class="m-kpi-sep"></div>
          <div class="m-kpi">
            <span class="m-kpi-value m-kpi-cyan">{{ totalSessionCount }}</span>
            <span class="m-kpi-label">{{ lang.t('jobs.sessions') }}</span>
          </div>
          <div class="m-kpi-sep"></div>
          <div class="m-kpi">
            <span class="m-kpi-value m-kpi-yellow">{{ completedMentoringCount }}</span>
            <span class="m-kpi-label">{{ lang.t('jobs.statusCompleted') }}</span>
          </div>
        </div>
      </div>

      <!-- ── Find a Mentor ── -->
      <div class="section-title">{{ lang.t('jobs.browseMentors') }}</div>
      <p class="muted" style="margin:-8px 0 16px">{{ lang.t('jobs.browseMentorsDesc') }}</p>

      <div class="toolbar" style="margin-bottom:16px">
        <input [(ngModel)]="mentorSearch" [placeholder]="lang.t('jobs.browseMentors') + '…'" style="flex:1" />
        <select [(ngModel)]="mentorSpecialityFilter">
          <option value="">{{ lang.t('jobs.allSpecialities') }}</option>
          <option *ngFor="let s of availableSpecialities" [value]="s">{{ s }}</option>
        </select>
        <button class="btn btn-ghost btn-sm" (click)="loadMentors()">
          <span class="icon icon-refresh"></span>
        </button>
      </div>

      <div *ngIf="loadingMentors" class="empty"><p>{{ lang.t('common.loading') }}</p></div>
      <div *ngIf="!loadingMentors && filteredMentorUsers.length === 0" class="empty">
        <div class="empty-icon">👨‍🏫</div>
        <p>{{ lang.t('jobs.noMentorsAvailable') }}</p>
      </div>

      <div class="mentor-browse-grid" *ngIf="!loadingMentors && filteredMentorUsers.length > 0">
        <div class="mentor-browse-card" *ngFor="let m of filteredMentorUsers">
          <div class="mentor-browse-avatar" [class.avatar-has-img]="m.avatarUrl">
            <img *ngIf="m.avatarUrl" [src]="m.avatarUrl" alt="avatar" />
            <span *ngIf="!m.avatarUrl">{{ initials(m.prenom + ' ' + m.nom) }}</span>
          </div>
          <div class="mentor-browse-info">
            <strong>{{ m.prenom }} {{ m.nom }}</strong>
            <span class="muted" *ngIf="m.specialite">
              <span class="icon icon-tag" style="width:11px;height:11px"></span>
              {{ m.specialite }}<span *ngIf="m.promo"> · {{ m.promo }}</span>
            </span>
            <span class="muted" *ngIf="m.parcours && !m.specialite">{{ m.parcours }}</span>
            <span class="mentor-online-badge" *ngIf="m.online">● Online</span>
          </div>
          <div class="mentor-browse-actions">
            <button class="btn btn-primary btn-sm" style="flex:1"
              (click)="openRequestModal(m)"
              [disabled]="alreadyHasMentor(m.id)">
              <span class="icon icon-user-plus"></span>
              {{ alreadyHasMentor(m.id) ? lang.t('jobs.statusActive') : lang.t('jobs.requestFromMentor') }}
            </button>
            <button class="btn btn-ghost btn-sm mentor-msg-btn"
              (click)="messageMentor(m)" [title]="lang.t('common.message')">
              <span class="icon icon-message"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- ── My Mentorings ── -->
      <div class="section-title" style="margin-top:32px">{{ lang.t('jobs.sectionMentoring') }}</div>

      <!-- Stats row -->
      <div class="mentor-stats-row">
        <div class="mentor-stat">
          <span class="mentor-stat-value mentor-stat-active">{{ activeMentoringCount }}</span>
          <span class="mentor-stat-label">{{ lang.t('jobs.statusActive') }}</span>
        </div>
        <div class="mentor-stat">
          <span class="mentor-stat-value mentor-stat-done">{{ completedMentoringCount }}</span>
          <span class="mentor-stat-label">{{ lang.t('jobs.statusCompleted') }}</span>
        </div>
        <div class="mentor-stat">
          <span class="mentor-stat-value mentor-stat-total">{{ allMentorings.length }}</span>
          <span class="mentor-stat-label">{{ lang.t('jobs.totalMentorings') }}</span>
        </div>
        <div class="mentor-stat">
          <span class="mentor-stat-value mentor-stat-sessions">{{ totalSessionCount }}</span>
          <span class="mentor-stat-label">{{ lang.t('jobs.sessions') }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mentor-tabs">
        <button class="mentor-tab" [class.active]="mentorTab === 'mentee'" (click)="mentorTab = 'mentee'">
          <span class="icon icon-user"></span>{{ lang.t('jobs.menteeTab') }}
          <span class="tab-count" *ngIf="mentorings.length">{{ mentorings.length }}</span>
        </button>
        <button class="mentor-tab" [class.active]="mentorTab === 'mentor'" (click)="mentorTab = 'mentor'">
          <span class="icon icon-star"></span>{{ lang.t('jobs.mentorTab') }}
          <span class="tab-count" *ngIf="mentoringsAsMentor.length">{{ mentoringsAsMentor.length }}</span>
        </button>
      </div>

      <ng-container [ngSwitch]="mentorTab">

        <!-- As Mentee -->
        <ng-container *ngSwitchCase="'mentee'">
          <div *ngIf="mentorings.length === 0" class="mentor-empty">
            <div class="mentor-empty-icon">🎓</div>
            <p>{{ lang.t('jobs.noMentoring') }}</p>
          </div>
          <div class="mentor-grid">
            <div class="mentor-card" *ngFor="let item of mentorings"
                 [class.mentor-card-completed]="item.statut==='COMPLETED'"
                 [class.mentor-card-cancelled]="item.statut==='CANCELLED'">
              <div class="mentor-card-top">
                <div class="mentor-domain-badge">{{ item.domaine }}</div>
                <span class="badge" [ngClass]="mentoringBadge(item.statut)">{{ mentoringStatusLabel(item.statut) }}</span>
              </div>
              <div class="mentor-people">
                <div class="mentor-person">
                  <div class="mentor-avatar">{{ initials(getMentoringUserName(item.mentorUserId)) }}</div>
                  <div>
                    <div class="mentor-person-role">{{ lang.t('jobs.mentor') }}</div>
                    <div class="mentor-person-name">{{ getMentoringUserName(item.mentorUserId) }}</div>
                  </div>
                </div>
                <div class="mentor-arrow">→</div>
                <div class="mentor-person">
                  <div class="mentor-avatar mentor-avatar-you">{{ initials(getMentoringUserName(item.mentoreUserId)) }}</div>
                  <div>
                    <div class="mentor-person-role">{{ lang.t('jobs.mentee') }}</div>
                    <div class="mentor-person-name">{{ getMentoringUserName(item.mentoreUserId) }}</div>
                  </div>
                </div>
              </div>
              <div class="mentor-session-bar">
                <span class="icon icon-calendar" style="width:13px;height:13px"></span>
                {{ item.sessionCount }} {{ lang.t('jobs.sessions') }}
                <button class="mentor-sessions-toggle" (click)="toggleSessions(item.id)">
                  {{ expandedMentoringId === item.id ? '▲' : '▼' }} {{ lang.t('jobs.sessions') }}
                </button>
              </div>
              <div class="mentor-sessions-panel" *ngIf="expandedMentoringId === item.id">
                <div *ngIf="loadingSessions" class="mentor-loading">{{ lang.t('common.loading') }}</div>
                <div *ngIf="!loadingSessions && currentSessions.length === 0" class="mentor-no-sessions">{{ lang.t('jobs.noSessions') }}</div>
                <div class="mentor-session-row" *ngFor="let s of currentSessions">
                  <span class="badge" [ngClass]="sessionBadge(s.statut)" style="font-size:10px">{{ s.statut }}</span>
                  <span>{{ s.date | date:'MMM d, y · HH:mm' }}</span>
                  <span class="muted" *ngIf="s.statut !== 'LIVE'">{{ s.dureeMinutes }} min</span>
                  <span class="session-countdown" [ngClass]="sessionCountdown(s).cls">
                    <span class="countdown-dot" *ngIf="sessionCountdown(s).live"></span>
                    {{ sessionCountdown(s).label }}
                  </span>
                  <button class="btn btn-danger btn-sm session-end-btn"
                    *ngIf="s.statut === 'LIVE' && mentorTab === 'mentor'"
                    (click)="endLive(s.mentoringId, s.id)" [disabled]="saving">
                    <span class="icon icon-check"></span>{{ lang.t('jobs.endSession') }}
                  </button>
                </div>
              </div>
              <div class="mentor-card-actions" *ngIf="item.statut === 'ACTIVE'">
                <button class="btn btn-ghost btn-sm" (click)="completeMentoring(item.id)">
                  <span class="icon icon-check"></span>{{ lang.t('jobs.complete') }}
                </button>
                <button class="btn btn-danger btn-sm" (click)="cancelMentoringItem(item.id)">
                  {{ lang.t('jobs.cancelMentoring') }}
                </button>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- As Mentor -->
        <ng-container *ngSwitchCase="'mentor'">
          <div *ngIf="mentoringsAsMentor.length === 0" class="mentor-empty">
            <div class="mentor-empty-icon">⭐</div>
            <p>{{ lang.t('jobs.noMentoring') }}</p>
          </div>
          <div class="mentor-grid">
            <div class="mentor-card" *ngFor="let item of mentoringsAsMentor"
                 [class.mentor-card-completed]="item.statut==='COMPLETED'"
                 [class.mentor-card-cancelled]="item.statut==='CANCELLED'">
              <div class="mentor-card-top">
                <div class="mentor-domain-badge">{{ item.domaine }}</div>
                <span class="badge" [ngClass]="mentoringBadge(item.statut)">{{ mentoringStatusLabel(item.statut) }}</span>
              </div>
              <div class="mentor-people">
                <div class="mentor-person">
                  <div class="mentor-avatar mentor-avatar-you">{{ initials(getMentoringUserName(item.mentorUserId)) }}</div>
                  <div>
                    <div class="mentor-person-role">{{ lang.t('jobs.mentor') }}</div>
                    <div class="mentor-person-name">{{ getMentoringUserName(item.mentorUserId) }}</div>
                  </div>
                </div>
                <div class="mentor-arrow">→</div>
                <div class="mentor-person">
                  <div class="mentor-avatar">{{ initials(getMentoringUserName(item.mentoreUserId)) }}</div>
                  <div>
                    <div class="mentor-person-role">{{ lang.t('jobs.mentee') }}</div>
                    <div class="mentor-person-name">{{ getMentoringUserName(item.mentoreUserId) }}</div>
                  </div>
                </div>
              </div>
              <div class="mentor-session-bar">
                <span class="icon icon-calendar" style="width:13px;height:13px"></span>
                {{ item.sessionCount }} {{ lang.t('jobs.sessions') }}
                <button class="mentor-sessions-toggle" (click)="toggleSessions(item.id)">
                  {{ expandedMentoringId === item.id ? '▲' : '▼' }} {{ lang.t('jobs.sessions') }}
                </button>
              </div>
              <div class="mentor-sessions-panel" *ngIf="expandedMentoringId === item.id">
                <div *ngIf="loadingSessions" class="mentor-loading">{{ lang.t('common.loading') }}</div>
                <div *ngIf="!loadingSessions && currentSessions.length === 0" class="mentor-no-sessions">{{ lang.t('jobs.noSessions') }}</div>
                <div class="mentor-session-row" *ngFor="let s of currentSessions">
                  <span class="badge" [ngClass]="sessionBadge(s.statut)" style="font-size:10px">{{ s.statut }}</span>
                  <span>{{ s.date | date:'MMM d, y · HH:mm' }}</span>
                  <span class="muted" *ngIf="s.statut !== 'LIVE'">{{ s.dureeMinutes }} min</span>
                  <span class="session-countdown" [ngClass]="sessionCountdown(s).cls">
                    <span class="countdown-dot" *ngIf="sessionCountdown(s).live"></span>
                    {{ sessionCountdown(s).label }}
                  </span>
                  <button class="btn btn-danger btn-sm session-end-btn"
                    *ngIf="s.statut === 'LIVE' && mentorTab === 'mentor'"
                    (click)="endLive(s.mentoringId, s.id)" [disabled]="saving">
                    <span class="icon icon-check"></span>{{ lang.t('jobs.endSession') }}
                  </button>
                </div>
                <div class="add-session-form" *ngIf="item.statut === 'ACTIVE'">
                  <button class="btn btn-sm live-start-btn" (click)="startLive(item.id)"
                    [disabled]="saving || hasLiveSession()">
                    ▶ {{ lang.t('jobs.startSession') }}
                  </button>
                  <div class="live-or-sep">{{ lang.t('jobs.orSchedule') }}</div>
                  <form [formGroup]="sessionForm" (ngSubmit)="addSession(item.id)" class="add-session-inputs">
                    <input type="datetime-local" formControlName="date" class="input-sm" />
                    <input type="number" formControlName="dureeMinutes" [placeholder]="lang.t('jobs.sessionDuration')" class="input-sm" min="15" style="width:130px" />
                    <button class="btn btn-primary btn-sm" type="submit" [disabled]="sessionForm.invalid || saving">
                      <span class="icon icon-plus"></span>{{ lang.t('jobs.addSession') }}
                    </button>
                  </form>
                </div>
              </div>
              <div class="mentor-card-actions" *ngIf="item.statut === 'ACTIVE'">
                <button class="btn btn-ghost btn-sm" (click)="completeMentoring(item.id)">
                  <span class="icon icon-check"></span>{{ lang.t('jobs.complete') }}
                </button>
                <button class="btn btn-danger btn-sm" (click)="cancelMentoringItem(item.id)">
                  {{ lang.t('jobs.cancelMentoring') }}
                </button>
              </div>
            </div>
          </div>
        </ng-container>
      </ng-container>
    </div>

    <!-- ── Request Mentor Modal ── -->
    <div class="modal-overlay" *ngIf="requestMentorModal" (click)="closeRequestModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ lang.t('jobs.requestMentoring') }}</h3>
          <button class="btn btn-icon" (click)="closeRequestModal()"><span class="icon icon-x"></span></button>
        </div>
        <div class="modal-body" *ngIf="requestMentorModal">
          <div class="mentor-modal-profile">
            <div class="mentor-browse-avatar" style="width:56px;height:56px;font-size:18px" [class.avatar-has-img]="requestMentorModal.avatarUrl">
              <img *ngIf="requestMentorModal.avatarUrl" [src]="requestMentorModal.avatarUrl" />
              <span *ngIf="!requestMentorModal.avatarUrl">{{ initials(requestMentorModal.prenom + ' ' + requestMentorModal.nom) }}</span>
            </div>
            <div>
              <strong style="font-size:16px">{{ requestMentorModal.prenom }} {{ requestMentorModal.nom }}</strong>
              <div class="muted" *ngIf="requestMentorModal.specialite">
                {{ lang.t('jobs.mentorSpeciality') }} {{ requestMentorModal.specialite }}
              </div>
            </div>
          </div>
          <div class="field" style="margin-top:20px">
            <label style="display:block;font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">
              {{ lang.t('jobs.chooseDomain') }}
            </label>
            <input [(ngModel)]="requestDomain" [placeholder]="lang.t('jobs.domainPh')" style="width:100%" class="input-styled" />
            <div class="domain-chips" *ngIf="requestMentorModal.specialite">
              <button class="domain-chip" *ngFor="let d of getDomainSuggestions(requestMentorModal.specialite)"
                      (click)="requestDomain = d" [class.active]="requestDomain === d">{{ d }}</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="closeRequestModal()">{{ lang.t('common.cancel') }}</button>
          <button class="btn btn-primary" (click)="submitRequest()" [disabled]="!requestDomain || saving">
            <span class="icon icon-user-plus"></span>{{ lang.t('jobs.sendRequest') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Hero ── */
    .mentoring-hero {
      display:flex; align-items:center; justify-content:space-between; gap:24px;
      flex-wrap:wrap; padding:28px 32px; border-radius:20px; margin-bottom:20px;
      background:linear-gradient(135deg,rgba(227,30,36,.12) 0%,rgba(56,214,199,.08) 100%);
      border:1px solid rgba(227,30,36,.2);
    }
    .mentoring-hero-text h1 { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; margin:0 0 6px; }
    .mentoring-hero-text p { color:var(--text-muted); margin:0; font-size:14px; }
    .mentoring-hero-stats { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .m-kpi { display:flex; flex-direction:column; align-items:center; min-width:72px; }
    .m-kpi-value { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; line-height:1; }
    .m-kpi-label { font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:.6px; margin-top:3px; }
    .m-kpi-sep { width:1px; height:36px; background:var(--border); margin:0 4px; }
    .m-kpi-red { color:var(--red,#e31e24); }
    .m-kpi-green { color:#3ddc84; }
    .m-kpi-cyan { color:#38d6c7; }
    .m-kpi-yellow { color:#ffbd59; }
    :host-context(.light-theme) .mentoring-hero {
      background:linear-gradient(135deg,rgba(227,30,36,.06) 0%,rgba(56,214,199,.05) 100%);
      border-color:rgba(227,30,36,.15);
    }

    /* ── Mentor Browse ── */
    .mentor-browse-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; margin-bottom:32px; }
    .mentor-browse-card {
      display:flex; flex-direction:column; gap:12px; padding:18px;
      border-radius:14px; border:1px solid var(--border); background:var(--card-bg,var(--dark2));
      transition:border-color .2s,box-shadow .2s,transform .15s;
    }
    .mentor-browse-card:hover { border-color:var(--red,#e31e24); box-shadow:0 4px 20px rgba(227,30,36,.12); transform:translateY(-2px); }
    .mentor-browse-avatar {
      width:52px; height:52px; border-radius:50%; flex-shrink:0;
      background:rgba(227,30,36,.15); color:var(--red,#e31e24);
      display:flex; align-items:center; justify-content:center;
      font-size:16px; font-weight:700; border:2px solid rgba(227,30,36,.25); overflow:hidden;
    }
    .avatar-has-img { background:transparent; border-color:var(--border); }
    .mentor-browse-avatar img { width:100%; height:100%; object-fit:cover; }
    .mentor-browse-info { display:flex; flex-direction:column; gap:3px; flex:1; }
    .mentor-browse-info strong { font-size:15px; font-weight:600; }
    .mentor-online-badge { font-size:11px; color:#3ddc84; font-weight:600; }
    .mentor-browse-actions { display:flex; gap:8px; align-items:center; }
    .mentor-msg-btn {
      flex-shrink:0; width:34px; height:34px; padding:0;
      display:flex; align-items:center; justify-content:center;
      border-color:rgba(56,214,199,.3); color:var(--accent-cyan,#38d6c7);
    }
    .mentor-msg-btn:hover { background:rgba(56,214,199,.1); border-color:var(--accent-cyan,#38d6c7); }
    :host-context(.light-theme) .mentor-browse-card { background:#fff; border-color:#e0e0e0; }
    :host-context(.light-theme) .mentor-browse-card:hover { border-color:#e31e24; box-shadow:0 4px 16px rgba(227,30,36,.1); }

    /* ── Stats Row ── */
    .mentor-stats-row { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
    .mentor-stat {
      flex:1; min-width:100px; display:flex; flex-direction:column; align-items:center;
      padding:16px 12px; border-radius:14px; border:1px solid var(--border);
      background:var(--card-bg,var(--dark2)); transition:border-color .2s,transform .2s;
    }
    .mentor-stat:hover { border-color:var(--accent-cyan,#38d6c7); transform:translateY(-2px); }
    .mentor-stat-value { font-size:28px; font-weight:800; font-family:'Syne',sans-serif; line-height:1; }
    .mentor-stat-label { font-size:11px; color:var(--text-muted); margin-top:4px; text-transform:uppercase; letter-spacing:.6px; }
    .mentor-stat-active { color:#3ddc84; }
    .mentor-stat-done { color:var(--accent-cyan,#38d6c7); }
    .mentor-stat-total { color:var(--text); }
    .mentor-stat-sessions { color:#ffbd59; }
    :host-context(.light-theme) .mentor-stat { background:#f8f9fa; border-color:#e0e0e0; }

    /* ── Tabs ── */
    .mentor-tabs { display:flex; gap:6px; margin-bottom:20px; border-bottom:1px solid var(--border); }
    .mentor-tab {
      display:flex; align-items:center; gap:6px; padding:10px 18px 11px;
      border:none; background:transparent; color:var(--text-muted);
      font-size:14px; font-weight:500; cursor:pointer; border-bottom:2px solid transparent;
      margin-bottom:-1px; transition:color .15s,border-color .15s;
    }
    .mentor-tab:hover { color:var(--text); }
    .mentor-tab.active { color:var(--red,#e31e24); border-bottom-color:var(--red,#e31e24); font-weight:600; }
    .tab-count {
      display:inline-flex; align-items:center; justify-content:center;
      width:20px; height:20px; border-radius:50%; font-size:11px; font-weight:700;
      background:var(--red,#e31e24); color:#fff;
    }

    /* ── Mentor Cards ── */
    .mentor-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
    .mentor-card {
      border:1px solid var(--border); border-radius:16px;
      background:var(--card-bg,var(--dark2)); padding:20px;
      transition:border-color .2s,box-shadow .2s;
    }
    .mentor-card:hover { border-color:rgba(56,214,199,.4); box-shadow:0 4px 24px rgba(0,0,0,.2); }
    .mentor-card-completed { opacity:.75; }
    .mentor-card-cancelled { opacity:.6; }
    .mentor-card-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .mentor-domain-badge {
      display:inline-block; padding:4px 12px; border-radius:20px;
      background:rgba(56,214,199,.1); color:var(--accent-cyan,#38d6c7);
      border:1px solid rgba(56,214,199,.25); font-size:13px; font-weight:600;
    }
    .mentor-people { display:flex; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
    .mentor-person { display:flex; align-items:center; gap:10px; flex:1; min-width:120px; }
    .mentor-avatar {
      width:40px; height:40px; border-radius:50%; flex-shrink:0;
      background:rgba(227,30,36,.2); color:var(--red,#e31e24);
      display:flex; align-items:center; justify-content:center;
      font-size:13px; font-weight:700; border:2px solid rgba(227,30,36,.3);
    }
    .mentor-avatar-you { background:rgba(56,214,199,.15); color:var(--accent-cyan,#38d6c7); border-color:rgba(56,214,199,.3); }
    .mentor-person-role { font-size:10px; text-transform:uppercase; letter-spacing:.6px; color:var(--text-muted); }
    .mentor-person-name { font-size:13px; font-weight:600; }
    .mentor-arrow { font-size:18px; color:var(--text-muted); flex-shrink:0; }
    .mentor-session-bar {
      display:flex; align-items:center; gap:8px; padding:8px 0;
      border-top:1px solid var(--border); font-size:13px; color:var(--text-muted);
    }
    .mentor-sessions-toggle {
      margin-left:auto; background:none; border:none; cursor:pointer;
      font-size:12px; color:var(--accent-cyan,#38d6c7); padding:2px 6px; border-radius:6px;
    }
    .mentor-sessions-toggle:hover { background:rgba(56,214,199,.1); }
    .mentor-sessions-panel {
      margin-top:12px; padding:12px; border-radius:10px;
      background:var(--input-bg,rgba(255,255,255,.04)); border:1px solid var(--border);
    }
    .mentor-session-row {
      display:flex; align-items:center; gap:10px; padding:6px 0;
      border-bottom:1px solid var(--border); font-size:13px;
    }
    .mentor-session-row:last-of-type { border-bottom:none; }
    .session-countdown {
      margin-left:auto; display:inline-flex; align-items:center; gap:5px;
      font-size:11px; font-weight:700; padding:2px 9px; border-radius:20px;
      font-variant-numeric:tabular-nums; white-space:nowrap;
    }
    .countdown-dot {
      width:7px; height:7px; border-radius:50%; background:currentColor;
      box-shadow:0 0 0 0 currentColor; animation:countdownPulse 1.4s ease-out infinite;
    }
    @keyframes countdownPulse {
      0% { box-shadow:0 0 0 0 rgba(61,220,132,.5); }
      70% { box-shadow:0 0 0 6px rgba(61,220,132,0); }
      100% { box-shadow:0 0 0 0 rgba(61,220,132,0); }
    }
    .cd-upcoming { background:rgba(255,189,89,.12); color:#ffbd59; border:1px solid rgba(255,189,89,.25); }
    .cd-live { background:rgba(61,220,132,.14); color:#3ddc84; border:1px solid rgba(61,220,132,.35); }
    .cd-ended { background:rgba(148,163,184,.12); color:var(--text-muted); border:1px solid var(--border); }
    .cd-cancelled { background:rgba(227,30,36,.1); color:#e31e24; border:1px solid rgba(227,30,36,.2); }
    .mentor-loading,.mentor-no-sessions { font-size:13px; color:var(--text-muted); padding:8px 0; text-align:center; }
    .add-session-form { margin-top:12px; padding-top:12px; border-top:1px dashed var(--border); }
    .add-session-inputs { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .input-sm {
      padding:6px 10px; border-radius:8px; border:1px solid var(--border);
      background:var(--input-bg,rgba(255,255,255,.06)); color:var(--text); font-size:13px; outline:none;
    }
    .input-sm:focus { border-color:var(--accent-cyan,#38d6c7); }
    .mentor-card-actions { display:flex; gap:8px; margin-top:12px; }
    .mentor-empty { text-align:center; padding:40px 16px; color:var(--text-muted); }
    .mentor-empty-icon { font-size:40px; margin-bottom:12px; }
    :host-context(.light-theme) .mentor-card { background:#fff; border-color:#e0e0e0; }
    :host-context(.light-theme) .mentor-sessions-panel { background:#f5f5f5; border-color:#e0e0e0; }

    /* ── Badges ── */
    .badge-active { background:rgba(61,220,132,.15); color:#3ddc84; border:1px solid rgba(61,220,132,.3); }
    .badge-completed { background:rgba(56,214,199,.12); color:#38d6c7; border:1px solid rgba(56,214,199,.25); }
    .badge-cancelled { background:rgba(227,30,36,.1); color:#e31e24; border:1px solid rgba(227,30,36,.2); }
    .badge-planned { background:rgba(255,189,89,.12); color:#ffbd59; border:1px solid rgba(255,189,89,.25); }
    .badge-done { background:rgba(61,220,132,.12); color:#3ddc84; border:1px solid rgba(61,220,132,.25); }
    .badge-live { background:rgba(227,30,36,.14); color:#e31e24; border:1px solid rgba(227,30,36,.35); }

    /* ── Live session controls ── */
    .live-start-btn {
      background:linear-gradient(135deg,#e31e24,#ff5a4d); color:#fff; border:none; font-weight:600;
    }
    .live-start-btn:hover:not(:disabled) { filter:brightness(1.08); }
    .live-start-btn:disabled { opacity:.5; cursor:not-allowed; }
    .live-or-sep {
      font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:.6px;
      margin:10px 0 8px;
    }
    .session-end-btn { margin-left:8px; padding:3px 10px; }

    /* ── Modal ── */
    .modal-overlay {
      position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:300;
      display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px);
    }
    .modal-box {
      background:linear-gradient(180deg,rgba(28,33,45,.98),rgba(17,21,31,.98));
      border:1px solid var(--border); border-radius:var(--radius-lg);
      width:100%; max-width:500px; box-shadow:var(--shadow); animation:slideUp .2s ease;
    }
    .modal-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:20px 24px 16px; border-bottom:1px solid var(--border);
      h3 { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; }
    }
    .modal-body { padding:20px 24px; }
    .modal-footer { padding:14px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px; }
    .mentor-modal-profile { display:flex; align-items:center; gap:14px; padding:12px 0; border-bottom:1px solid var(--border); }
    .domain-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
    .domain-chip {
      padding:4px 12px; border-radius:20px; font-size:12px; cursor:pointer;
      border:1px solid var(--border); background:transparent; color:var(--text-muted); transition:all .15s;
    }
    .domain-chip:hover,.domain-chip.active { background:rgba(227,30,36,.1); color:var(--red,#e31e24); border-color:rgba(227,30,36,.3); }
    .input-styled {
      padding:10px 14px; border-radius:10px; border:1px solid var(--border);
      background:var(--input-bg,rgba(255,255,255,.06)); color:var(--text); font-size:14px; outline:none;
    }
    .input-styled:focus { border-color:var(--red,#e31e24); }
    :host-context(.light-theme) .modal-box { background:#fff; }
    :host-context(.light-theme) .input-styled,.input-sm { background:#fff; border-color:#d0d0d0; color:#1a1a1a; }
  `]
})
export class MentoringComponent implements OnInit, OnDestroy {
  /** Live clock (epoch ms) — ticked every second to drive session countdowns. */
  now = Date.now();
  private clockTimer?: any;

  mentorings: Mentoring[] = [];
  mentoringsAsMentor: Mentoring[] = [];
  mentoringUserMap: Map<number, string> = new Map();
  mentorTab: 'mentee' | 'mentor' = 'mentee';
  expandedMentoringId: number | null = null;
  currentSessions: MentoringSession[] = [];
  loadingSessions = false;
  saving = false;

  allMentorUsers: any[] = [];
  loadingMentors = false;
  mentorSearch = '';
  mentorSpecialityFilter = '';
  requestMentorModal: any | null = null;
  requestDomain = '';

  sessionForm: FormGroup = this.fb.group({
    date: ['', Validators.required],
    dureeMinutes: [60, [Validators.required, Validators.min(15)]]
  });

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private notifications: NotificationService,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    public lang: LanguageService
  ) {}

  get allMentorings(): Mentoring[] { return [...this.mentorings, ...this.mentoringsAsMentor]; }
  get activeMentoringCount(): number { return this.allMentorings.filter(m => m.statut === 'ACTIVE').length; }
  get completedMentoringCount(): number { return this.allMentorings.filter(m => m.statut === 'COMPLETED').length; }
  get totalSessionCount(): number { return this.allMentorings.reduce((s, m) => s + (m.sessionCount || 0), 0); }

  get availableSpecialities(): string[] {
    const set = new Set<string>();
    this.allMentorUsers.forEach(m => { if (m.specialite) set.add(m.specialite); if (m.parcours) set.add(m.parcours); });
    return Array.from(set).sort();
  }

  get filteredMentorUsers(): any[] {
    const q = this.mentorSearch.trim().toLowerCase();
    return this.allMentorUsers.filter(m => {
      const matchSpec = !this.mentorSpecialityFilter ||
        m.specialite === this.mentorSpecialityFilter || m.parcours === this.mentorSpecialityFilter;
      const matchQ = !q || [m.prenom, m.nom, m.specialite, m.parcours].some(v => (v || '').toLowerCase().includes(q));
      return matchSpec && matchQ;
    });
  }

  ngOnInit(): void {
    this.loadMentors();
    this.loadMentorings();
    // Tick every second so the session countdowns update dynamically in real time.
    this.clockTimer = setInterval(() => { this.now = Date.now(); }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockTimer) clearInterval(this.clockTimer);
  }

  /**
   * Dynamic, live time-to-end for a session — computed from start date + duration
   * against the ticking `now`, instead of a static "60 min" label.
   * Returns a label plus a status class: upcoming → live (counting down to end) → ended.
   */
  sessionCountdown(s: MentoringSession): { label: string; cls: string; live: boolean } {
    if (s.statut === 'CANCELLED') return { label: this.lang.t('jobs.statusCancelled'), cls: 'cd-cancelled', live: false };

    const start = new Date(s.date).getTime();
    const now = this.now;

    // Live session: no fixed end — count the elapsed time up until the mentor ends it.
    if (s.statut === 'LIVE') {
      return { label: `${this.lang.t('jobs.inProgress')} ${this.humanizeDuration(now - start)}`, cls: 'cd-live', live: true };
    }
    if (s.statut === 'DONE') return { label: this.lang.t('jobs.ended'), cls: 'cd-ended', live: false };

    const end = start + (s.dureeMinutes || 0) * 60_000;

    if (now < start) {
      return { label: `${this.lang.t('jobs.startsIn')} ${this.humanizeDuration(start - now)}`, cls: 'cd-upcoming', live: false };
    }
    if (now < end) {
      // Session is ongoing — live countdown to its end.
      return { label: `${this.lang.t('jobs.endsIn')} ${this.humanizeDuration(end - now)}`, cls: 'cd-live', live: true };
    }
    return { label: this.lang.t('jobs.ended'), cls: 'cd-ended', live: false };
  }

  /** Format a millisecond span as "2d 3h", "3h 12m", or live "12:05" when under an hour. */
  private humanizeDuration(ms: number): string {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  loadMentors(): void {
    this.loadingMentors = true;
    this.http.get<any[]>(`${environment.apiUrl}/auth/users/mentors`)
      .pipe(catchError(() => of([])))
      .subscribe(users => { this.allMentorUsers = users; this.loadingMentors = false; });
  }

  loadMentorings(): void {
    this.jobService.getMentoringAsMentore().subscribe({
      next: items => { this.mentorings = items; this.resolveMentoringNames(items); },
      error: () => {}
    });
    this.jobService.getMentoringAsMentor().subscribe({
      next: items => { this.mentoringsAsMentor = items; this.resolveMentoringNames(items); },
      error: () => {}
    });
  }

  private resolveMentoringNames(items: Mentoring[]): void {
    const ids = [...new Set(items.flatMap(i => [i.mentorUserId, i.mentoreUserId]).filter(Boolean))];
    if (!ids.length) return;
    this.http.get<any[]>(`${environment.apiUrl}/auth/users/bulk?${ids.map(id => 'ids=' + id).join('&')}`)
      .pipe(catchError(() => of([])))
      .subscribe(users => users.forEach((u: any) => this.mentoringUserMap.set(u.id, `${u.prenom} ${u.nom}`)));
  }

  getMentoringUserName(id: number): string { return this.mentoringUserMap.get(id) ?? `User #${id}`; }

  alreadyHasMentor(mentorId: number): boolean {
    return this.mentorings.some(m => m.mentorUserId === mentorId && m.statut === 'ACTIVE');
  }

  openRequestModal(mentor: any): void { this.requestMentorModal = mentor; this.requestDomain = mentor.specialite || ''; }
  closeRequestModal(): void { this.requestMentorModal = null; this.requestDomain = ''; }

  submitRequest(): void {
    if (!this.requestMentorModal || !this.requestDomain.trim()) return;
    this.saving = true;
    this.jobService.requestMentoring(this.requestMentorModal.id, this.requestDomain.trim()).subscribe({
      next: () => {
        this.notifications.success('Mentoring request sent!');
        this.saving = false;
        this.closeRequestModal();
        this.loadMentorings();
        this.loadMentors(); // refresh so alreadyHasMentor() reflects the new relationship
      },
      error: (err) => {
        this.notifications.error(err.error?.message || 'Unable to send request');
        this.saving = false;
      }
    });
  }

  messageMentor(mentor: any): void {
    this.router.navigate(['/messages'], { queryParams: { userId: mentor.id } });
  }

  toggleSessions(mentoringId: number): void {
    if (this.expandedMentoringId === mentoringId) { this.expandedMentoringId = null; this.currentSessions = []; return; }
    this.expandedMentoringId = mentoringId;
    this.loadingSessions = true;
    this.jobService.getSessions(mentoringId).subscribe({
      next: s => { this.currentSessions = s; this.loadingSessions = false; },
      error: () => { this.loadingSessions = false; }
    });
  }

  addSession(mentoringId: number): void {
    if (this.sessionForm.invalid) return;
    this.saving = true;
    const { date, dureeMinutes } = this.sessionForm.value;
    this.jobService.addSession(mentoringId, date, Number(dureeMinutes)).subscribe({
      next: () => {
        this.saving = false;
        this.sessionForm.reset({ dureeMinutes: 60 });
        this.notifications.success('Session added');
        // Reload sessions in-place without closing/reopening the panel
        this.loadingSessions = true;
        this.jobService.getSessions(mentoringId).subscribe({
          next: s => { this.currentSessions = s; this.loadingSessions = false; },
          error: () => { this.loadingSessions = false; }
        });
        this.loadMentorings();
      },
      error: () => { this.saving = false; this.notifications.error('Unable to add session'); }
    });
  }

  completeMentoring(id: number): void {
    this.jobService.completeMentoring(id).subscribe({
      next: () => { this.notifications.success('Mentoring completed'); this.loadMentorings(); },
      error: () => this.notifications.error('Unable to complete mentoring')
    });
  }

  cancelMentoringItem(id: number): void {
    if (!this.notifications.confirm('Cancel this mentoring?')) return;
    this.jobService.cancelMentoring(id).subscribe({
      next: () => { this.notifications.success('Mentoring cancelled'); this.loadMentorings(); },
      error: () => this.notifications.error('Unable to cancel mentoring')
    });
  }

  initials(name: string): string {
    const parts = name.replace('User #', 'U ').split(' ');
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  }

  mentoringBadge(statut: string): string {
    if (statut === 'ACTIVE') return 'badge-active';
    if (statut === 'COMPLETED') return 'badge-completed';
    return 'badge-cancelled';
  }

  mentoringStatusLabel(statut: string): string {
    if (statut === 'ACTIVE') return this.lang.t('jobs.statusActive');
    if (statut === 'COMPLETED') return this.lang.t('jobs.statusCompleted');
    return this.lang.t('jobs.statusCancelled');
  }

  sessionBadge(statut: string): string {
    if (statut === 'PLANNED') return 'badge-planned';
    if (statut === 'LIVE') return 'badge-live';
    if (statut === 'DONE') return 'badge-done';
    return 'badge-cancelled';
  }

  /** Whether this mentoring currently has a running live session (disables the start button). */
  hasLiveSession(): boolean {
    return this.currentSessions.some(s => s.statut === 'LIVE');
  }

  startLive(mentoringId: number): void {
    this.saving = true;
    this.jobService.startLiveSession(mentoringId).subscribe({
      next: () => {
        this.saving = false;
        this.notifications.success(this.lang.t('jobs.sessionStarted'));
        this.reloadSessions(mentoringId);
        this.loadMentorings();
      },
      error: (err) => { this.saving = false; this.notifications.error(err.error?.message || 'Unable to start session'); }
    });
  }

  endLive(mentoringId: number, sessionId: number): void {
    this.saving = true;
    this.jobService.endSession(sessionId).subscribe({
      next: () => {
        this.saving = false;
        this.notifications.success(this.lang.t('jobs.sessionEnded'));
        this.reloadSessions(mentoringId);
        this.loadMentorings();
      },
      error: (err) => { this.saving = false; this.notifications.error(err.error?.message || 'Unable to end session'); }
    });
  }

  private reloadSessions(mentoringId: number): void {
    this.loadingSessions = true;
    this.jobService.getSessions(mentoringId).subscribe({
      next: s => { this.currentSessions = s; this.loadingSessions = false; },
      error: () => { this.loadingSessions = false; }
    });
  }

  getDomainSuggestions(specialite: string): string[] {
    const map: Record<string, string[]> = {
      'GL': ['Software Engineering', 'Clean Code', 'Design Patterns', 'Agile', 'Testing'],
      'BI': ['Data Science', 'Machine Learning', 'Data Analysis', 'Power BI'],
      'Cloud': ['AWS', 'Kubernetes', 'Docker', 'DevOps', 'CI/CD'],
      'SSI': ['Cybersecurity', 'Ethical Hacking', 'Network Security'],
      'TWIN': ['Web Development', 'Mobile', 'UI/UX'],
      'SEMC': ['Embedded Systems', 'IoT', 'Robotics'],
      'DS': ['Data Science', 'Python', 'ML', 'Statistics'],
    };
    const found = Object.keys(map).find(k => specialite.toUpperCase().includes(k.toUpperCase()));
    return found ? map[found] : ['Career Guidance', 'Technical Skills', 'Project Management'];
  }
}
