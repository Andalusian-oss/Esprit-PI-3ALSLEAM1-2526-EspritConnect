import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';
import { ChatbotService } from '../../core/services/chatbot.service';
import { NotificationService } from '../../core/services/notification.service';
import { LanguageService } from '../../core/services/language.service';
import { User, Post, CvAnalysis } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  template: `
    <div class="page">
      <!-- ── Profile header ── -->
      <div class="profile-header">
        <div class="profile-avatar-lg">{{ initials }}</div>
        <div class="profile-info">
          <h2>{{ user?.prenom }} {{ user?.nom }}</h2>
          <p>{{ user?.email }}</p>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            <span class="badge badge-red">{{ user?.role }}</span>
            <span class="badge badge-gray" *ngIf="user?.promo">{{ user?.promo }}</span>
            <span class="badge badge-gray" *ngIf="user?.specialite">{{ user?.specialite }}</span>
            <span class="badge badge-gray" *ngIf="user?.parcours">{{ user?.parcours }}</span>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-left:auto" (click)="toggleEdit()">
          <span class="icon" [ngClass]="editing ? 'icon-x' : 'icon-edit'"></span>
          {{ editing ? lang.t('common.cancel') : lang.t('profile.editProfile') }}
        </button>
        <a routerLink="/auth/change-password" class="btn btn-ghost btn-sm" style="margin-left:8px">
          <span class="icon icon-lock"></span>
          Change password
        </a>
      </div>

      <!-- ── Edit form ── -->
      <div class="card" *ngIf="editing" style="margin-top:16px">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:20px">
          {{ lang.t('profile.editTitle') }}
        </div>
        <form [formGroup]="editForm" (ngSubmit)="saveProfile()">
          <div class="grid-2">
            <div class="field">
              <label>{{ lang.t('profile.firstName') }}</label>
              <input formControlName="prenom" [placeholder]="lang.t('profile.firstName')" />
            </div>
            <div class="field">
              <label>{{ lang.t('profile.lastName') }}</label>
              <input formControlName="nom" [placeholder]="lang.t('profile.lastName')" />
            </div>
          </div>
          <div class="field">
            <label>{{ lang.t('profile.email') }}</label>
            <input formControlName="email" type="email" placeholder="you@esprit.tn" />
            <div class="field-hint" *ngIf="editForm.get('email')?.errors?.['email']">
              {{ lang.t('profile.invalidEmail') }}
            </div>
          </div>
          <div class="grid-2" *ngIf="user?.role === 'STUDENT' || user?.role === 'ALUMNI'">
            <div class="field">
              <label>{{ lang.t('profile.specialite') }}</label>
              <select formControlName="specialite">
                <option value="">{{ lang.t('profile.noneOption') }}</option>
                <option>Informatique</option>
                <option>Finance</option>
                <option>Télécom</option>
                <option>Génie Civil</option>
                <option>Marketing</option>
              </select>
            </div>
            <div class="field">
              <label>{{ lang.t('profile.parcours') }}</label>
              <input formControlName="parcours" placeholder="e.g. GL, DS, BI" />
            </div>
          </div>
          <div class="field" *ngIf="user?.role === 'ENSEIGNANT'">
            <label>{{ lang.t('profile.dept') }}</label>
            <input formControlName="specialite" placeholder="e.g. Informatique" />
          </div>
          <div class="field" *ngIf="user?.role === 'STUDENT' || user?.role === 'ALUMNI'">
            <label>{{ lang.t('profile.promo') }}</label>
            <input formControlName="promo" placeholder="e.g. 4DS1, 3GL2" />
          </div>
          <div class="field">
            <label>{{ lang.t('profile.avatarUrl') }}</label>
            <input formControlName="avatarUrl" placeholder="https://..." />
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" (click)="toggleEdit()">{{ lang.t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid || saving">
              {{ saving ? lang.t('common.saving') : lang.t('profile.saveChanges') }}
            </button>
          </div>
          <div class="error-msg" *ngIf="saveError">{{ saveError }}</div>
        </form>
      </div>

      <!-- ── Account details (read-only) ── -->
      <div class="card" style="margin-top:16px" *ngIf="!editing">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:16px">
          {{ lang.t('profile.accountDetails') }}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <div class="detail-label">{{ lang.t('profile.firstName') }}</div>
            <div class="detail-value">{{ user?.prenom }}</div>
          </div>
          <div>
            <div class="detail-label">{{ lang.t('profile.lastName') }}</div>
            <div class="detail-value">{{ user?.nom }}</div>
          </div>
          <div>
            <div class="detail-label">{{ lang.t('profile.email') }}</div>
            <div class="detail-value">{{ user?.email }}</div>
          </div>
          <div>
            <div class="detail-label">{{ lang.t('profile.memberSince') }}</div>
            <div class="detail-value">{{ user?.createdAt | date:'mediumDate' }}</div>
          </div>
          <div *ngIf="user?.espritId">
            <div class="detail-label">{{ lang.t('profile.espritId') }}</div>
            <div class="detail-value">{{ user?.espritId }}</div>
          </div>
          <div *ngIf="user?.cin">
            <div class="detail-label">{{ lang.t('profile.cin') }}</div>
            <div class="detail-value">{{ user?.cin }}</div>
          </div>
          <div *ngIf="user?.specialite">
            <div class="detail-label">{{ lang.t('profile.specialite') }}</div>
            <div class="detail-value">{{ user?.specialite }}</div>
          </div>
          <div *ngIf="user?.parcours">
            <div class="detail-label">{{ lang.t('profile.parcours') }}</div>
            <div class="detail-value">{{ user?.parcours }}</div>
          </div>
        </div>
      </div>

      <!-- ── Online status ── -->
      <div class="card" style="margin-top:16px;display:flex;align-items:center;gap:12px">
        <span class="online-dot" [class.online]="user?.online" style="width:10px;height:10px;border-radius:50%;background:var(--text-muted);flex-shrink:0"></span>
        <span style="font-size:14px;color:var(--text-muted)">
          {{ user?.online ? lang.t('profile.online') : lang.t('profile.offline') }}
          <span *ngIf="user?.lastLoginAt"> · {{ lang.t('profile.lastSeen') }} {{ user?.lastLoginAt | date:'medium' }}</span>
        </span>
      </div>

      <!-- ── Avatar upload ── -->
      <div class="card" style="margin-top:16px">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:16px">{{ lang.t('profile.uploadAvatar') }}</div>
        <input type="file" accept="image/*" #avatarInput style="display:none" (change)="onAvatarSelected($event)" />
        <button class="btn btn-ghost btn-sm" (click)="avatarInput.click()" [disabled]="uploadingAvatar">
          {{ uploadingAvatar ? lang.t('common.uploading') : lang.t('profile.chooseImage') }}
        </button>
        <span style="font-size:12px;color:var(--text-muted);margin-left:12px" *ngIf="user?.avatarUrl">
          Current: <a [href]="user?.avatarUrl" target="_blank" style="color:var(--red)">view</a>
        </span>
      </div>

      <!-- ── CV Analyzer ── -->
      <div class="card cv-card" style="margin-top:16px">
        <div class="cv-card-header">
          <div>
            <div class="cv-card-title">CV Analyzer</div>
            <div class="cv-card-sub">Upload your CV to get your score, skills breakdown and tips</div>
          </div>
          <span class="cv-badge" *ngIf="cvAnalysis">{{ cvAnalysis.score }}/100</span>
        </div>

        <!-- Upload controls -->
        <div class="cv-upload-row" *ngIf="!cvAnalysis">
          <div class="cv-job-field">
            <label>Job description <span class="cv-optional">(optional – for match score)</span></label>
            <textarea [(ngModel)]="cvJobDesc" rows="2" placeholder="Paste a job description to get a match score…"></textarea>
          </div>
          <div class="cv-upload-actions">
            <input type="file" accept=".pdf,.docx,.doc" #cvInput style="display:none" (change)="onCvSelected($event)" />
            <button class="btn btn-primary" (click)="cvInput.click()" [disabled]="analyzingCv">
              <span class="icon icon-upload"></span>
              {{ analyzingCv ? 'Analyzing…' : 'Upload & Analyze CV' }}
            </button>
            <span class="cv-hint" *ngIf="cvFileName">{{ cvFileName }}</span>
          </div>
          <div class="error-msg" *ngIf="cvError">{{ cvError }}</div>
        </div>

        <!-- Reset button when results shown -->
        <div *ngIf="cvAnalysis" style="display:flex;justify-content:flex-end;margin-bottom:16px">
          <button class="btn btn-ghost btn-sm" (click)="resetCvAnalysis()">
            <span class="icon icon-refresh"></span> Analyze another CV
          </button>
        </div>

        <!-- ── Results ── -->
        <div *ngIf="cvAnalysis" class="cv-results">

          <!-- Score row -->
          <div class="cv-scores-row">
            <div class="cv-score-box" [style.background]="scoreGradient(cvAnalysis.score)">
              <div class="cv-score-num">{{ cvAnalysis.score }}</div>
              <div class="cv-score-lbl">CV Score</div>
            </div>
            <div class="cv-score-box" *ngIf="cvAnalysis.ats_score != null" [style.background]="scoreGradient(cvAnalysis.ats_score)">
              <div class="cv-score-num">{{ cvAnalysis.ats_score }}</div>
              <div class="cv-score-lbl">ATS Score</div>
            </div>
            <div class="cv-score-box" *ngIf="cvAnalysis.job_match_score != null" [style.background]="scoreGradient(cvAnalysis.job_match_score)">
              <div class="cv-score-num">{{ cvAnalysis.job_match_score }}</div>
              <div class="cv-score-lbl">Job Match</div>
            </div>
            <div class="cv-meta">
              <div class="cv-meta-name">{{ cvAnalysis.name || user?.prenom + ' ' + user?.nom }}</div>
              <div class="cv-meta-sum">{{ cvAnalysis.summary }}</div>
              <div class="cv-meta-words">{{ cvAnalysis.word_count }} words</div>
            </div>
          </div>

          <!-- Skills -->
          <div class="cv-section" *ngIf="cvAnalysis.all_skills?.length">
            <div class="cv-section-title">Skills ({{ cvAnalysis.all_skills.length }})</div>
            <div class="cv-skill-groups">
              <div class="cv-skill-group" *ngIf="cvAnalysis.skills.languages?.length">
                <span class="cv-skill-cat">Languages</span>
                <span class="cv-chip cv-chip-lang" *ngFor="let s of cvAnalysis.skills.languages">{{ s }}</span>
              </div>
              <div class="cv-skill-group" *ngIf="cvAnalysis.skills.frameworks?.length">
                <span class="cv-skill-cat">Frameworks</span>
                <span class="cv-chip cv-chip-fw" *ngFor="let s of cvAnalysis.skills.frameworks">{{ s }}</span>
              </div>
              <div class="cv-skill-group" *ngIf="cvAnalysis.skills.databases?.length">
                <span class="cv-skill-cat">Databases</span>
                <span class="cv-chip cv-chip-db" *ngFor="let s of cvAnalysis.skills.databases">{{ s }}</span>
              </div>
              <div class="cv-skill-group" *ngIf="cvAnalysis.skills.devops?.length">
                <span class="cv-skill-cat">DevOps</span>
                <span class="cv-chip cv-chip-dv" *ngFor="let s of cvAnalysis.skills.devops">{{ s }}</span>
              </div>
              <div class="cv-skill-group" *ngIf="cvAnalysis.skills.tools?.length">
                <span class="cv-skill-cat">Tools</span>
                <span class="cv-chip cv-chip-tool" *ngFor="let s of cvAnalysis.skills.tools">{{ s }}</span>
              </div>
              <div class="cv-skill-group" *ngIf="cvAnalysis.skills.concepts?.length">
                <span class="cv-skill-cat">Concepts</span>
                <span class="cv-chip cv-chip-concept" *ngFor="let s of cvAnalysis.skills.concepts">{{ s }}</span>
              </div>
              <div class="cv-skill-group" *ngIf="cvAnalysis.skills.soft_skills?.length">
                <span class="cv-skill-cat">Soft Skills</span>
                <span class="cv-chip cv-chip-soft" *ngFor="let s of cvAnalysis.skills.soft_skills">{{ s }}</span>
              </div>
            </div>
          </div>

          <!-- Education & Experience row -->
          <div class="cv-two-col">
            <div class="cv-section" *ngIf="cvAnalysis.education?.length">
              <div class="cv-section-title">Education</div>
              <div class="cv-edu-item" *ngFor="let e of cvAnalysis.education">{{ e }}</div>
            </div>
            <div class="cv-section">
              <div class="cv-section-title">Experience</div>
              <div *ngIf="cvAnalysis.experience?.years_estimated" class="cv-exp-years">
                ~{{ cvAnalysis.experience.years_estimated }} year(s)
              </div>
              <div *ngFor="let i of cvAnalysis.experience?.internships" class="cv-edu-item">{{ i }}</div>
              <div *ngIf="!cvAnalysis.experience?.years_estimated && !cvAnalysis.experience?.internships?.length" class="cv-empty-sm">No experience listed</div>
            </div>
          </div>

          <!-- Languages -->
          <div class="cv-section" *ngIf="cvAnalysis.languages?.length">
            <div class="cv-section-title">Languages</div>
            <div class="cv-langs-row">
              <div class="cv-lang-item" *ngFor="let l of cvAnalysis.languages">
                <span class="cv-lang-name">{{ l.language }}</span>
                <span class="cv-chip cv-chip-lang">{{ l.level }}</span>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div class="cv-section" *ngIf="cvAnalysis.tips?.length">
            <div class="cv-section-title cv-tips-title">💡 Improvement Tips</div>
            <ul class="cv-tips-list">
              <li *ngFor="let tip of cvAnalysis.tips">{{ tip }}</li>
            </ul>
          </div>

          <!-- Red flags -->
          <div class="cv-section" *ngIf="cvAnalysis.red_flags?.length">
            <div class="cv-section-title cv-flags-title">⚠️ Red Flags</div>
            <ul class="cv-flags-list">
              <li *ngFor="let flag of cvAnalysis.red_flags">{{ flag }}</li>
            </ul>
          </div>
        </div>

        <!-- Analyzing spinner -->
        <div class="cv-loading" *ngIf="analyzingCv">
          <div class="cv-spinner"></div>
          <span>Analyzing your CV…</span>
        </div>
      </div>

      <!-- ── My Posts ── -->
      <div class="card" style="margin-top:16px">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:16px">
          {{ lang.t('profile.myPosts') }} <span style="font-size:13px;font-weight:400;color:var(--text-muted)">({{ userPosts.length }})</span>
        </div>
        <div *ngIf="loadingPosts" style="color:var(--text-muted);font-size:14px">{{ lang.t('profile.loadingPosts') }}</div>
        <div *ngIf="!loadingPosts && userPosts.length === 0" style="color:var(--text-muted);font-size:14px">{{ lang.t('profile.noPosts') }}</div>
        <div *ngFor="let post of userPosts" style="padding:12px 0;border-bottom:1px solid var(--border)">
          <div style="font-size:14px;margin-bottom:6px">{{ post.contenu }}</div>
          <div style="font-size:12px;color:var(--text-muted)">
            {{ post.createdAt | date:'medium' }} · {{ post.likeCount }} {{ lang.t('profile.likes') }} · {{ post.commentCount }} {{ lang.t('profile.comments') }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-label {
      font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.8px; color: var(--text-muted); margin-bottom: 4px;
    }
    .detail-value { font-size: 15px; }
    .field-hint { font-size: 12px; color: var(--red-light); margin-top: 4px; }

    /* ── CV Analyzer card ── */
    .cv-card { border-color: rgba(61,220,132,0.2); }
    .cv-card-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; }
    .cv-card-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; margin-bottom:4px; }
    .cv-card-sub { font-size:13px; color:var(--text-muted); }
    .cv-badge { background:linear-gradient(135deg,#3ddc84,#2bb56b); color:#fff; font-size:14px; font-weight:800; padding:6px 14px; border-radius:20px; }

    .cv-upload-row { display:flex; flex-direction:column; gap:12px; }
    .cv-job-field { display:flex; flex-direction:column; gap:6px; }
    .cv-job-field label { font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:.5px; }
    .cv-optional { font-weight:400; font-size:11px; }
    .cv-job-field textarea { background:var(--dark3); border:1px solid var(--border); border-radius:8px; padding:10px 12px; color:var(--text); font-size:13px; width:100%; box-sizing:border-box; resize:vertical; }
    .cv-job-field textarea:focus { outline:none; border-color:#3ddc84; }
    .cv-upload-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .cv-hint { font-size:12px; color:var(--text-muted); }

    /* ── Results ── */
    .cv-results { display:flex; flex-direction:column; gap:20px; }
    .cv-scores-row { display:flex; align-items:flex-start; gap:16px; flex-wrap:wrap; }
    .cv-score-box { width:90px; height:90px; border-radius:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
    .cv-score-num { font-size:28px; font-weight:800; color:#fff; line-height:1; }
    .cv-score-lbl { font-size:10px; color:rgba(255,255,255,.8); margin-top:4px; text-align:center; font-weight:600; }
    .cv-meta { flex:1; min-width:0; }
    .cv-meta-name { font-size:16px; font-weight:700; margin-bottom:4px; }
    .cv-meta-sum { font-size:13px; color:var(--text-muted); margin-bottom:6px; line-height:1.5; }
    .cv-meta-words { font-size:11px; color:var(--text-dim); }

    .cv-section { }
    .cv-section-title { font-size:11px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px; }
    .cv-tips-title { color:#ff9800; }
    .cv-flags-title { color:var(--red); }

    .cv-skill-groups { display:flex; flex-direction:column; gap:10px; }
    .cv-skill-group { display:flex; align-items:center; flex-wrap:wrap; gap:6px; }
    .cv-skill-cat { font-size:10px; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:.5px; min-width:70px; flex-shrink:0; }
    .cv-chip { display:inline-block; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:500; }
    .cv-chip-lang { background:rgba(61,220,132,.12); color:#3ddc84; border:1px solid rgba(61,220,132,.25); }
    .cv-chip-fw { background:rgba(33,150,243,.12); color:#2196f3; border:1px solid rgba(33,150,243,.25); }
    .cv-chip-db { background:rgba(255,152,0,.12); color:#ff9800; border:1px solid rgba(255,152,0,.25); }
    .cv-chip-dv { background:rgba(156,39,176,.12); color:#ce93d8; border:1px solid rgba(156,39,176,.25); }
    .cv-chip-tool { background:rgba(0,188,212,.12); color:#00bcd4; border:1px solid rgba(0,188,212,.25); }
    .cv-chip-concept { background:rgba(255,64,129,.12); color:#ff4081; border:1px solid rgba(255,64,129,.25); }
    .cv-chip-soft { background:var(--dark3); color:var(--text-muted); border:1px solid var(--border); }

    .cv-two-col { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .cv-edu-item { font-size:13px; color:var(--text); padding:6px 0; border-bottom:1px solid var(--border); line-height:1.4; }
    .cv-edu-item:last-child { border-bottom:none; }
    .cv-exp-years { font-size:22px; font-weight:800; color:#3ddc84; margin-bottom:8px; }
    .cv-empty-sm { font-size:13px; color:var(--text-dim); }

    .cv-langs-row { display:flex; flex-wrap:wrap; gap:10px; }
    .cv-lang-item { display:flex; align-items:center; gap:6px; }
    .cv-lang-name { font-size:13px; font-weight:600; }

    .cv-tips-list { margin:0; padding-left:18px; display:flex; flex-direction:column; gap:6px; }
    .cv-tips-list li { font-size:13px; color:var(--text); }
    .cv-flags-list { margin:0; padding-left:18px; display:flex; flex-direction:column; gap:6px; }
    .cv-flags-list li { font-size:13px; color:var(--text); }

    .cv-loading { display:flex; align-items:center; gap:12px; padding:20px 0; color:var(--text-muted); font-size:14px; }
    .cv-spinner { width:20px; height:20px; border:2px solid var(--border); border-top-color:#3ddc84; border-radius:50%; animation:spin .8s linear infinite; flex-shrink:0; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .icon-upload { mask-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z'/%3E%3C/svg%3E"); -webkit-mask-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z'/%3E%3C/svg%3E"); }
    .icon-refresh { mask-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/%3E%3C/svg%3E"); -webkit-mask-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/%3E%3C/svg%3E"); }

    @media (max-width: 600px) {
      .cv-two-col { grid-template-columns: 1fr; }
      .cv-scores-row { flex-direction: column; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editing = false;
  saving = false;
  saveError = '';
  editForm!: FormGroup;
  userPosts: Post[] = [];
  loadingPosts = false;
  uploadingAvatar = false;

  // CV Analyzer state
  cvAnalysis: CvAnalysis | null = null;
  analyzingCv = false;
  cvJobDesc = '';
  cvFileName = '';
  cvError = '';

  get initials(): string {
    if (!this.user) return '?';
    const p = this.user.prenom?.[0] ?? '';
    const n = this.user.nom?.[0] ?? '';
    return (p + n).toUpperCase() || '?';
  }

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private chatbotService: ChatbotService,
    private fb: FormBuilder,
    private http: HttpClient,
    private notifications: NotificationService,
    public lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.buildForm();
    if (this.user) this.loadUserPosts(this.user.id);
  }

  loadUserPosts(userId: number): void {
    this.loadingPosts = true;
    this.postService.getPostsByUser(userId).subscribe({
      next: posts => { this.userPosts = posts; this.loadingPosts = false; },
      error: () => { this.loadingPosts = false; }
    });
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.user) return;
    this.uploadingAvatar = true;
    this.authService.uploadAvatar(file).subscribe({
      next: ({ url }) => {
        this.http.put<User>(`${environment.apiUrl}/auth/users/${this.user!.id}`, { avatarUrl: url }).subscribe({
          next: updated => {
            const merged = { ...this.user, ...updated } as User;
            localStorage.setItem('esprit_user', JSON.stringify(merged));
            this.user = merged;
            this.uploadingAvatar = false;
            this.notifications.success('Avatar updated');
          },
          error: () => { this.uploadingAvatar = false; this.notifications.error('Failed to update avatar'); }
        });
      },
      error: () => { this.uploadingAvatar = false; this.notifications.error('Upload failed'); }
    });
  }

  buildForm(): void {
    this.editForm = this.fb.group({
      prenom:    [this.user?.prenom ?? '', Validators.required],
      nom:       [this.user?.nom ?? '', Validators.required],
      email:     [this.user?.email ?? '', [Validators.required, Validators.email]],
      promo:     [this.user?.promo ?? ''],
      specialite:[this.user?.specialite ?? ''],
      parcours:  [this.user?.parcours ?? ''],
      avatarUrl: [this.user?.avatarUrl ?? '']
    });
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    this.saveError = '';
    if (this.editing) this.buildForm();
  }

  saveProfile(): void {
    if (this.editForm.invalid || !this.user) return;
    this.saving = true;
    this.saveError = '';
    this.http.put<User>(
      `${environment.apiUrl}/auth/users/${this.user.id}`,
      this.editForm.value
    ).subscribe({
      next: updated => {
        localStorage.setItem('esprit_user', JSON.stringify({ ...this.user, ...updated }));
        this.user = { ...this.user, ...updated } as User;
        this.saving = false;
        this.editing = false;
        this.notifications.success('Profile updated');
      },
      error: err => {
        this.saveError = err.error?.message || 'Failed to update profile';
        this.saving = false;
      }
    });
  }

  onCvSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.cvFileName = file.name;
    this.cvError = '';
    this.cvAnalysis = null;
    this.analyzingCv = true;
    this.chatbotService.analyzeCv(file, this.cvJobDesc).subscribe({
      next: (analysis: CvAnalysis) => {
        this.cvAnalysis = analysis;
        this.analyzingCv = false;
      },
      error: (err) => {
        this.cvError = err.error?.detail || 'Analysis failed. Please upload a valid PDF or DOCX file.';
        this.analyzingCv = false;
      }
    });
    // reset input so same file can be re-uploaded
    (event.target as HTMLInputElement).value = '';
  }

  resetCvAnalysis(): void {
    this.cvAnalysis = null;
    this.cvError = '';
    this.cvFileName = '';
    this.cvJobDesc = '';
  }

  scoreGradient(score: number): string {
    if (score >= 75) return 'linear-gradient(135deg, #3ddc84, #2bb56b)';
    if (score >= 50) return 'linear-gradient(135deg, #ffbd59, #e0a020)';
    return 'linear-gradient(135deg, #ff6b6b, #e01a27)';
  }
}
