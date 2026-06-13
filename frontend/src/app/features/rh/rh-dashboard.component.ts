import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { PostService } from '../../core/services/post.service';
import { ChatbotService } from '../../core/services/chatbot.service';
import { NotificationService } from '../../core/services/notification.service';
import { LanguageService } from '../../core/services/language.service';
import { Job, Application, User, CvAnalysis } from '../../core/models/models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface JobWithStats extends Job {
  avgScore: number;
  acceptedCount: number;
  rejectedCount: number;
  pendingCount: number;
}

interface ApplicantWithUser extends Application {
  userName: string;
  initials: string;
  cvAnalysis?: CvAnalysis;
  analyzing?: boolean;
}

@Component({
  selector: 'app-rh-dashboard',
  template: `
    <div class="rh-layout">

      <!-- ═══════════════════════════════ SIDEBAR ═══════════════════════════════ -->
      <aside class="rh-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <span class="icon-briefcase-icon">💼</span>
            <span>{{ lang.t('rh.title') }}</span>
          </div>
          <p class="sidebar-sub">{{ currentUser?.prenom }} {{ currentUser?.nom }}</p>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item" [class.active]="activeTab === 'analytics'" (click)="activeTab = 'analytics'">
            {{ lang.t('rh.tabAnalytics') }}
          </button>
          <button class="nav-item" [class.active]="activeTab === 'jobs'" (click)="activeTab = 'jobs'">
            {{ lang.t('rh.tabJobs') }}
            <span class="nav-badge" *ngIf="jobs.length > 0">{{ jobs.length }}</span>
          </button>
        </nav>

        <!-- Jobs list in sidebar -->
        <div class="sidebar-jobs" *ngIf="jobs.length > 0">
          <p class="sidebar-section-label">{{ lang.t('rh.myOffers') }}</p>
          <div class="sidebar-job-item"
               *ngFor="let job of jobs"
               [class.active]="selectedJob?.id === job.id"
               (click)="selectJob(job); activeTab = 'jobs'">
            <div class="sji-type" [class]="'sji-' + job.type.toLowerCase()">{{ job.type }}</div>
            <div class="sji-info">
              <div class="sji-title">{{ job.titre }}</div>
              <div class="sji-count">{{ job.applicationCount }} {{ lang.t('rh.applicants') }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ═══════════════════════════════ MAIN ═══════════════════════════════ -->
      <main class="rh-main">

        <!-- ────── ANALYTICS TAB ────── -->
        <div *ngIf="activeTab === 'analytics'" class="tab-content">
          <div class="page-title-row">
            <h1>{{ lang.t('rh.hrAnalytics') }}</h1>
            <p class="page-sub">{{ lang.t('rh.analyticsDesc') }}</p>
          </div>

          <!-- Stat cards -->
          <div class="stats-row">
            <div class="stat-card red">
              <div class="stat-num">{{ totalApplications }}</div>
              <div class="stat-lbl">{{ lang.t('rh.totalApps') }}</div>
            </div>
            <div class="stat-card green">
              <div class="stat-num">{{ avgMatchScore }}%</div>
              <div class="stat-lbl">{{ lang.t('rh.avgScore') }}</div>
            </div>
            <div class="stat-card blue">
              <div class="stat-num">{{ acceptanceRate }}%</div>
              <div class="stat-lbl">{{ lang.t('rh.acceptanceRate') }}</div>
            </div>
            <div class="stat-card orange">
              <div class="stat-num">{{ pendingCount }}</div>
              <div class="stat-lbl">{{ lang.t('rh.pendingReview') }}</div>
            </div>
          </div>

          <!-- Status distribution -->
          <div class="analytics-grid">
            <div class="analytics-panel">
              <h3>{{ lang.t('rh.appPerJob') }}</h3>
              <div class="bar-chart">
                <div class="bar-row" *ngFor="let job of jobsWithStats">
                  <div class="bar-label">{{ job.titre | slice:0:22 }}{{ job.titre.length > 22 ? '…' : '' }}</div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="maxApps > 0 ? (job.applicationCount / maxApps) * 100 : 0"></div>
                  </div>
                  <div class="bar-value">{{ job.applicationCount }}</div>
                </div>
                <div *ngIf="jobsWithStats.length === 0" class="empty-chart">{{ lang.t('rh.noData') }}</div>
              </div>
            </div>

            <div class="analytics-panel">
              <h3>{{ lang.t('rh.statusDist') }}</h3>
              <div class="donut-legend">
                <div class="legend-item green">
                  <span class="legend-dot"></span>
                  <span class="legend-lbl">{{ lang.t('rh.accepted') }}</span>
                  <span class="legend-val">{{ totalAccepted }}</span>
                </div>
                <div class="legend-item orange">
                  <span class="legend-dot"></span>
                  <span class="legend-lbl">{{ lang.t('rh.pending') }}</span>
                  <span class="legend-val">{{ pendingCount }}</span>
                </div>
                <div class="legend-item red">
                  <span class="legend-dot"></span>
                  <span class="legend-lbl">{{ lang.t('rh.rejected') }}</span>
                  <span class="legend-val">{{ totalRejected }}</span>
                </div>
              </div>
              <div class="status-bars">
                <div class="status-bar-row">
                  <span>{{ lang.t('rh.accepted') }}</span>
                  <div class="sbar-track">
                    <div class="sbar-fill green" [style.width.%]="totalApplications > 0 ? (totalAccepted / totalApplications) * 100 : 0"></div>
                  </div>
                  <span>{{ totalApplications > 0 ? ((totalAccepted / totalApplications) * 100 | number:'1.0-0') : 0 }}%</span>
                </div>
                <div class="status-bar-row">
                  <span>{{ lang.t('rh.pending') }}</span>
                  <div class="sbar-track">
                    <div class="sbar-fill orange" [style.width.%]="totalApplications > 0 ? (pendingCount / totalApplications) * 100 : 0"></div>
                  </div>
                  <span>{{ totalApplications > 0 ? ((pendingCount / totalApplications) * 100 | number:'1.0-0') : 0 }}%</span>
                </div>
                <div class="status-bar-row">
                  <span>{{ lang.t('rh.rejected') }}</span>
                  <div class="sbar-track">
                    <div class="sbar-fill red" [style.width.%]="totalApplications > 0 ? (totalRejected / totalApplications) * 100 : 0"></div>
                  </div>
                  <span>{{ totalApplications > 0 ? ((totalRejected / totalApplications) * 100 | number:'1.0-0') : 0 }}%</span>
                </div>
              </div>
            </div>

            <div class="analytics-panel full-width">
              <h3>{{ lang.t('rh.scoreDist') }}</h3>
              <div class="histogram">
                <div class="hist-bar" *ngFor="let bucket of scoreBuckets">
                  <div class="hist-fill" [style.height.%]="maxBucket > 0 ? (bucket.count / maxBucket) * 100 : 0"
                       [title]="bucket.label + ': ' + bucket.count + ' ' + lang.t('rh.candidates')"></div>
                  <div class="hist-label">{{ bucket.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ────── JOBS TAB ────── -->
        <div *ngIf="activeTab === 'jobs'" class="tab-content">
          <div class="page-title-row">
            <div>
              <h1>{{ lang.t('rh.jobOffers') }}</h1>
              <p class="page-sub">{{ lang.t('rh.jobOffersDesc') }}</p>
            </div>
            <button class="btn-primary-rh" (click)="showForm = !showForm">
              {{ showForm ? lang.t('common.cancel') : lang.t('rh.newOffer') }}
            </button>
          </div>

          <!-- Create/Edit job form -->
          <div class="form-card" *ngIf="showForm">
            <h3>{{ editingJob ? lang.t('rh.editJobOffer') : lang.t('rh.newJobOffer') }}</h3>
            <form [formGroup]="jobForm" (ngSubmit)="saveJob()">
              <div class="form-grid-2">
                <div class="field">
                  <label>{{ lang.t('rh.jobTitle') }}</label>
                  <input formControlName="titre" [placeholder]="lang.t('rh.jobTitle')" />
                  <span class="field-error" *ngIf="jobForm.get('titre')?.invalid && jobForm.get('titre')?.touched">{{ lang.t('rh.titleRequired') }}</span>
                </div>
                <div class="field">
                  <label>{{ lang.t('rh.contractType') }}</label>
                  <select formControlName="type">
                    <option value="CDI">{{ lang.t('jobs.cdi') }}</option>
                    <option value="CDD">{{ lang.t('jobs.cdd') }}</option>
                    <option value="STAGE">{{ lang.t('jobs.internship') }}</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label>{{ lang.t('rh.location') }}</label>
                <input formControlName="lieu" [placeholder]="lang.t('rh.location')" />
              </div>
              <div class="field">
                <label>{{ lang.t('rh.description') }}</label>
                <textarea formControlName="description" rows="5" [placeholder]="lang.t('rh.description')"></textarea>
                <span class="field-error" *ngIf="jobForm.get('description')?.invalid && jobForm.get('description')?.touched">{{ lang.t('rh.descRequired') }}</span>
              </div>
              <div class="field">
                <label>{{ lang.t('rh.requiredSkills') }} <span class="field-hint">{{ lang.t('rh.skillsHint') }}</span></label>
                <div class="tag-input-row">
                  <input #skillInput [placeholder]="lang.t('rh.requiredSkills') + '…'"
                         (keydown.enter)="addSkillTag(skillInput.value); skillInput.value = ''; $event.preventDefault()" />
                  <button type="button" class="tag-add-btn" (click)="addSkillTag(skillInput.value); skillInput.value = ''">+</button>
                </div>
                <div class="tags-list" *ngIf="requiredSkills.length > 0">
                  <span class="skill-tag" *ngFor="let skill of requiredSkills; let i = index">
                    {{ skill }} <button type="button" (click)="removeSkillTag(i)">×</button>
                  </span>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-ghost-rh" (click)="cancelForm()">{{ lang.t('common.cancel') }}</button>
                <button type="submit" class="btn-primary-rh" [disabled]="jobForm.invalid || saving">
                  {{ saving ? lang.t('common.saving') : (editingJob ? lang.t('rh.updateOffer') : lang.t('rh.postJob')) }}
                </button>
              </div>
            </form>
          </div>

          <!-- Jobs list (when no job selected) -->
          <div *ngIf="!selectedJob">
            <div class="jobs-grid" *ngIf="!loading">
              <div class="job-card-rh" *ngFor="let job of jobsWithStats"
                   (click)="selectJob(job)">
                <div class="jcr-header">
                  <span class="jcr-type" [class]="'jcr-' + job.type.toLowerCase()">{{ job.type }}</span>
                  <div class="jcr-actions" (click)="$event.stopPropagation()">
                    <button class="icon-btn" [title]="lang.t('common.edit')" (click)="editJob(job)">✏️</button>
                    <button class="icon-btn danger" [title]="lang.t('common.delete')" (click)="deleteJob(job)">🗑️</button>
                  </div>
                </div>
                <h3 class="jcr-title">{{ job.titre }}</h3>
                <p class="jcr-loc" *ngIf="job.lieu">📍 {{ job.lieu }}</p>
                <div class="jcr-stats">
                  <div class="jcr-stat">
                    <span class="jcr-stat-val">{{ job.applicationCount }}</span>
                    <span class="jcr-stat-lbl">{{ lang.t('rh.applicants') }}</span>
                  </div>
                  <div class="jcr-stat">
                    <span class="jcr-stat-val {{ job.avgScore >= 70 ? 'green' : job.avgScore >= 40 ? 'orange' : 'red' }}">{{ job.avgScore }}%</span>
                    <span class="jcr-stat-lbl">{{ lang.t('rh.avgScore') }}</span>
                  </div>
                  <div class="jcr-stat">
                    <span class="jcr-stat-val green">{{ job.acceptedCount }}</span>
                    <span class="jcr-stat-lbl">{{ lang.t('rh.accepted') }}</span>
                  </div>
                  <div class="jcr-stat">
                    <span class="jcr-stat-val orange">{{ job.pendingCount }}</span>
                    <span class="jcr-stat-lbl">{{ lang.t('rh.pending') }}</span>
                  </div>
                </div>
                <div class="jcr-cta">{{ lang.t('rh.viewApplicants') }}</div>
              </div>
              <div class="empty-card" *ngIf="jobsWithStats.length === 0">
                <p>{{ lang.t('rh.noJobsYet') }}</p>
              </div>
            </div>
            <div class="loading-placeholder" *ngIf="loading">{{ lang.t('common.loading') }}</div>
          </div>

          <!-- Ranked applicants for selected job -->
          <div *ngIf="selectedJob" class="applicants-section">
            <div class="applicants-header">
              <button class="back-btn" (click)="selectedJob = null; applicants = []">{{ lang.t('rh.backToOffers') }}</button>
              <div>
                <h2>{{ selectedJob.titre }}</h2>
                <p class="page-sub">{{ applicants.length }} {{ lang.t('rh.candidates') }} · {{ lang.t('rh.rankedByMatch') }}</p>
              </div>
              <div style="display:flex;align-items:center;gap:10px;margin-left:auto">
                <div class="threshold-box" [title]="lang.t('rh.passScoreHint')"
                     (click)="$event.stopPropagation()">
                  <span class="threshold-lbl">{{ lang.t('rh.passScore') }}</span>
                  <button type="button" class="threshold-step" (click)="acceptThreshold = clampScore(acceptThreshold - 5)">−</button>
                  <input type="range" min="0" max="100" step="5" class="threshold-range"
                         [(ngModel)]="acceptThreshold" [ngModelOptions]="{standalone: true}" />
                  <button type="button" class="threshold-step" (click)="acceptThreshold = clampScore(acceptThreshold + 5)">+</button>
                  <span class="threshold-val">{{ acceptThreshold }}%</span>
                </div>
                <button class="btn-ghost-rh auto-decide-btn"
                        style="padding:8px 12px;font-size:13px;display:flex;align-items:center;gap:6px"
                        [disabled]="loadingApplicants || !hasScoredPending"
                        (click)="autoDecideByScore()"
                        [title]="lang.t('rh.autoDecideHint')">
                  {{ lang.t('rh.autoDecide') }}
                </button>
                <button class="btn-ghost-rh" style="padding:8px 12px;font-size:13px;display:flex;align-items:center;gap:6px"
                        [disabled]="loadingApplicants"
                        (click)="loadApplicants(selectedJob!.id)"
                        title="Reload applicants — picks up newly submitted CVs">
                  🔄 Refresh
                </button>
                <span class="badge-type" [class]="'badge-' + selectedJob.type.toLowerCase()">{{ selectedJob.type }}</span>
              </div>
            </div>

            <div class="loading-placeholder" *ngIf="loadingApplicants">{{ lang.t('rh.analyzingCvs') }}</div>

            <div class="applicants-table" *ngIf="!loadingApplicants">
              <div class="app-table-header">
                <span>{{ lang.t('rh.rankCol') }}</span>
                <span>{{ lang.t('rh.candidateCol') }}</span>
                <span>{{ lang.t('rh.cvQualityCol') }}</span>
                <span>{{ lang.t('rh.jobMatchCol') }}</span>
                <span>{{ lang.t('rh.statusCol') }}</span>
                <span>{{ lang.t('rh.actionsCol') }}</span>
              </div>

              <div class="app-row" *ngFor="let app of applicants; let i = index"
                   (click)="openDrawer(app)">
                <div class="app-rank" [class.top3]="i < 3">
                  <span class="rank-num">{{ i + 1 }}</span>
                  <span class="rank-top" *ngIf="i < 3">{{ lang.t('rh.top') }}</span>
                </div>
                <div class="app-candidate">
                  <div class="app-avatar">{{ app.initials }}</div>
                  <div class="app-name">{{ app.userName }}</div>
                </div>
                <div class="app-score-col">
                  <span *ngIf="app.analyzing" class="analyzing-badge">⏳ Analyzing…</span>
                  <!-- No CV at all -->
                  <span *ngIf="!app.analyzing && !app.cvUrl" class="muted-sm" title="Candidate has not submitted a CV yet">No CV</span>
                  <!-- Has CV but not analyzed yet — show inline analyze button -->
                  <button *ngIf="!app.analyzing && app.cvUrl && app.matchScore == null"
                          class="inline-analyze-btn"
                          (click)="$event.stopPropagation(); analyzeSingle(app)"
                          title="Analyze this CV">
                    🔍 Analyze
                  </button>
                  <!-- Scored -->
                  <div *ngIf="!app.analyzing && app.matchScore != null" class="score-bar-wrap">
                    <div class="score-pct" [style.color]="scoreColor(app.matchScore)">{{ app.matchScore }}%</div>
                    <div class="score-track">
                      <div class="score-fill" [style.width.%]="app.matchScore" [style.background-color]="scoreColor(app.matchScore)"></div>
                    </div>
                  </div>
                </div>
                <div class="app-score-col">
                  <div class="score-bar-wrap" *ngIf="app.cvAnalysis?.score != null && requiredSkills.length > 0">
                    <div class="score-pct" [style.color]="scoreColor(jobMatchScore(app))">{{ jobMatchScore(app) }}%</div>
                    <div class="score-track">
                      <div class="score-fill" [style.width.%]="jobMatchScore(app)" [style.background-color]="scoreColor(jobMatchScore(app))"></div>
                    </div>
                  </div>
                  <span class="muted-sm" *ngIf="!app.cvAnalysis?.score">—</span>
                </div>
                <div class="app-status-col">
                  <span class="status-chip" [class]="'chip-' + app.statut.toLowerCase()">{{ app.statut }}</span>
                  <span *ngIf="app.statut === 'PENDING' && recommendation(app) as rec"
                        class="reco-chip" [class.reco-accept]="rec === 'ACCEPTED'" [class.reco-reject]="rec === 'REJECTED'"
                        [title]="lang.t('rh.cvScore') + ' ' + app.matchScore + '% / ' + lang.t('rh.passScore') + ' ' + acceptThreshold + '%'">
                    {{ rec === 'ACCEPTED' ? lang.t('rh.suggestAccept') : lang.t('rh.suggestReject') }}
                  </span>
                </div>
                <div class="app-actions" (click)="$event.stopPropagation()">
                  <button class="action-accept" [title]="lang.t('rh.acceptBtn')"
                          *ngIf="app.statut !== 'ACCEPTED'"
                          (click)="updateStatus(app, 'ACCEPTED')">✓</button>
                  <button class="action-reject" [title]="lang.t('rh.rejectBtn')"
                          *ngIf="app.statut !== 'REJECTED'"
                          (click)="updateStatus(app, 'REJECTED')">✕</button>
                  <button class="action-msg" [title]="lang.t('common.message')" (click)="messageApplicant(app.applicantUserId)">💬</button>
                  <button *ngIf="app.cvUrl" class="action-analyze"
                          [title]="app.analyzing ? 'Analyzing…' : 'Analyze CV'"
                          [disabled]="app.analyzing"
                          (click)="analyzeSingle(app)">
                    {{ app.analyzing ? '⏳' : '🔍' }}
                  </button>
                  <a *ngIf="app.cvUrl" [href]="app.cvUrl" target="_blank" class="action-cv" [title]="lang.t('common.viewCv')">📄</a>
                </div>
              </div>

              <div class="empty-state" *ngIf="applicants.length === 0">
                <p>No applications yet for this offer.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- ═══════════════════════════════ CV DRAWER ═══════════════════════════════ -->
      <div class="drawer-backdrop" *ngIf="drawerApp" (click)="closeDrawer()"></div>
      <aside class="cv-drawer" *ngIf="drawerApp">
        <div class="drawer-header">
          <div class="drawer-name">{{ drawerApp.userName }}</div>
          <button class="drawer-close" (click)="closeDrawer()">✕</button>
        </div>

        <div class="drawer-body" *ngIf="drawerApp.cvAnalysis as cv; else noAnalysis">
          <!-- Dual scores -->
          <div class="dual-scores">
            <div class="score-circle" [style.border-color]="scoreColor(cv.score)">
              <div class="score-big" [style.color]="scoreColor(cv.score)">{{ cv.score }}</div>
              <div class="score-type">CV Quality</div>
            </div>
            <div class="score-circle" [style.border-color]="scoreColor(jobMatchScore(drawerApp))">
              <div class="score-big" [style.color]="scoreColor(jobMatchScore(drawerApp))">{{ jobMatchScore(drawerApp) }}</div>
              <div class="score-type">Job Match</div>
            </div>
          </div>

          <!-- Contact -->
          <div class="drawer-section" *ngIf="cv.contact.email || cv.contact.phone || cv.contact.linkedin">
            <h4>Contact</h4>
            <div class="contact-grid">
              <div *ngIf="cv.contact.email">📧 {{ cv.contact.email }}</div>
              <div *ngIf="cv.contact.phone">📞 {{ cv.contact.phone }}</div>
              <div *ngIf="cv.contact.linkedin">🔗 {{ cv.contact.linkedin }}</div>
              <div *ngIf="cv.contact.github">💻 {{ cv.contact.github }}</div>
            </div>
          </div>

          <!-- Skills breakdown -->
          <div class="drawer-section" *ngIf="cv.all_skills?.length">
            <h4>Skills ({{ cv.all_skills.length }})</h4>
            <div class="skill-grid">
              <div class="skill-group" *ngIf="cv.skills.languages?.length">
                <div class="sg-label">Languages</div>
                <div class="sg-tags">
                  <span class="sg-tag lang" *ngFor="let s of cv.skills.languages">{{ s }}</span>
                </div>
              </div>
              <div class="skill-group" *ngIf="cv.skills.frameworks?.length">
                <div class="sg-label">Frameworks</div>
                <div class="sg-tags">
                  <span class="sg-tag fw" *ngFor="let s of cv.skills.frameworks">{{ s }}</span>
                </div>
              </div>
              <div class="skill-group" *ngIf="cv.skills.databases?.length">
                <div class="sg-label">Databases</div>
                <div class="sg-tags">
                  <span class="sg-tag db" *ngFor="let s of cv.skills.databases">{{ s }}</span>
                </div>
              </div>
              <div class="skill-group" *ngIf="cv.skills.devops?.length">
                <div class="sg-label">DevOps</div>
                <div class="sg-tags">
                  <span class="sg-tag dv" *ngFor="let s of cv.skills.devops">{{ s }}</span>
                </div>
              </div>
              <div class="skill-group" *ngIf="cv.skills.soft_skills?.length">
                <div class="sg-label">Soft Skills</div>
                <div class="sg-tags">
                  <span class="sg-tag soft" *ngFor="let s of cv.skills.soft_skills">{{ s }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Skill Gap -->
          <div class="drawer-section" *ngIf="skillGap(drawerApp).length > 0">
            <h4>⚠️ Missing Skills ({{ skillGap(drawerApp).length }})</h4>
            <div class="sg-tags">
              <span class="sg-tag missing" *ngFor="let s of skillGap(drawerApp)">{{ s }}</span>
            </div>
          </div>

          <!-- Education -->
          <div class="drawer-section" *ngIf="cv.education?.length">
            <h4>Education</h4>
            <ul class="drawer-list">
              <li *ngFor="let e of cv.education">{{ e }}</li>
            </ul>
          </div>

          <!-- Experience -->
          <div class="drawer-section" *ngIf="cv.experience">
            <h4>Experience</h4>
            <div *ngIf="cv.experience.years_estimated">~{{ cv.experience.years_estimated }} year(s) of experience</div>
            <ul class="drawer-list" *ngIf="cv.experience.internships?.length">
              <li *ngFor="let i of cv.experience.internships">{{ i }}</li>
            </ul>
          </div>

          <!-- Languages -->
          <div class="drawer-section" *ngIf="cv.languages?.length">
            <h4>Languages</h4>
            <div class="contact-grid">
              <div *ngFor="let l of cv.languages">🌐 {{ l.language }} — {{ l.level }}</div>
            </div>
          </div>
        </div>

        <ng-template #noAnalysis>
          <div class="drawer-body">
            <div class="empty-state" *ngIf="drawerApp.analyzing">⏳ {{ lang.t('rh.analyzingCvs') }}</div>

            <!-- No CV submitted at all -->
            <div *ngIf="!drawerApp.analyzing && !drawerApp.cvUrl" style="padding:24px;text-align:center">
              <div style="font-size:36px;margin-bottom:12px">📄</div>
              <div style="font-weight:600;margin-bottom:6px">No CV submitted</div>
              <div style="font-size:13px;color:var(--text-muted);line-height:1.5">
                This candidate has not uploaded a CV yet.<br>
                They can add their CV from the Jobs page.
              </div>
            </div>

            <!-- CV uploaded but not yet analyzed -->
            <div *ngIf="!drawerApp.analyzing && drawerApp.cvUrl" style="padding:24px;text-align:center">
              <div style="font-size:36px;margin-bottom:12px">📋</div>
              <div style="font-weight:600;margin-bottom:6px">CV ready to analyze</div>
              <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;line-height:1.5">
                The candidate has submitted their CV.<br>
                Click below to extract skills and compute the score.
              </div>
              <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
                <a [href]="drawerApp.cvUrl" target="_blank" class="btn-ghost-rh" style="font-size:13px;display:inline-flex;align-items:center;gap:6px">
                  📄 View CV
                </a>
                <button class="btn-primary-rh" (click)="analyzeSingle(drawerApp)">
                  🔍 Analyze CV
                </button>
              </div>
            </div>
          </div>
        </ng-template>

        <div class="drawer-reco" *ngIf="recommendation(drawerApp) as rec"
             [class.reco-accept]="rec === 'ACCEPTED'" [class.reco-reject]="rec === 'REJECTED'">
          {{ lang.t('rh.aiSuggestion') }}: {{ lang.t('rh.cvScore') }} {{ drawerApp.matchScore }}% —
          <strong>{{ rec === 'ACCEPTED' ? lang.t('rh.accepted') : lang.t('rh.rejected') }}</strong>
          ({{ lang.t('rh.passScore') }} {{ acceptThreshold }}%)
        </div>
        <div class="drawer-footer">
          <button class="btn-ghost-rh" (click)="closeDrawer()">{{ lang.t('common.close') }}</button>
          <button class="action-accept full" (click)="updateStatus(drawerApp!, 'ACCEPTED'); closeDrawer()"
                  *ngIf="drawerApp.statut !== 'ACCEPTED'">{{ lang.t('rh.acceptBtn') }}</button>
          <button class="action-reject full" (click)="updateStatus(drawerApp!, 'REJECTED'); closeDrawer()"
                  *ngIf="drawerApp.statut !== 'REJECTED'">{{ lang.t('rh.rejectBtn') }}</button>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    /* ── Layout ── */
    .rh-layout { display:flex; min-height:100vh; background:var(--dark); }
    .rh-sidebar { width:260px; min-height:100vh; background:var(--dark2); border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; position:sticky; top:0; }
    .rh-main { flex:1; padding:32px 40px; max-width:1200px; overflow-x:hidden; }

    /* ── Sidebar ── */
    .sidebar-header { padding:24px 20px 16px; border-bottom:1px solid var(--border); }
    .sidebar-logo { display:flex; align-items:center; gap:8px; font-size:16px; font-weight:700; color:var(--text); margin-bottom:4px; }
    .sidebar-sub { font-size:12px; color:var(--text-muted); margin:0; }
    .sidebar-nav { padding:16px 12px 0; display:flex; flex-direction:column; gap:4px; }
    .nav-item { display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:8px; border:none; background:none; cursor:pointer; font-size:14px; color:var(--text-muted); text-align:left; transition:all .15s; }
    .nav-item:hover, .nav-item.active { background:var(--red-glow); color:var(--red); }
    .nav-badge { margin-left:auto; background:var(--red); color:#fff; border-radius:10px; padding:2px 7px; font-size:11px; font-weight:700; }
    .sidebar-jobs { padding:12px; overflow-y:auto; flex:1; }
    .sidebar-section-label { font-size:10px; font-weight:700; letter-spacing:1px; color:var(--text-muted); padding:0 4px; margin-bottom:8px; }
    .sidebar-job-item { display:flex; align-items:center; gap:8px; padding:10px 8px; border-radius:8px; cursor:pointer; transition:background .15s; margin-bottom:4px; }
    .sidebar-job-item:hover, .sidebar-job-item.active { background:var(--dark3); }
    .sji-type { font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; flex-shrink:0; }
    .sji-cdi { color:#4caf50; background:rgba(76,175,80,.15); }
    .sji-cdd { color:#ff9800; background:rgba(255,152,0,.15); }
    .sji-stage { color:#2196f3; background:rgba(33,150,243,.15); }
    .sji-info { min-width:0; }
    .sji-title { font-size:13px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sji-count { font-size:11px; color:var(--text-muted); }

    /* ── Page titles ── */
    .tab-content { }
    .page-title-row { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; gap:16px; }
    .page-title-row h1 { margin:0; font-size:28px; font-weight:800; }
    .page-sub { color:var(--text-muted); font-size:14px; margin:4px 0 0; }

    /* ── Stat cards ── */
    .stats-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:16px; margin-bottom:28px; }
    .stat-card { background:var(--dark2); border:1px solid var(--border); border-radius:16px; padding:24px; text-align:center; }
    .stat-num { font-size:32px; font-weight:800; }
    .stat-lbl { font-size:12px; color:var(--text-muted); margin-top:4px; }
    .stat-card.red .stat-num { color:var(--red); }
    .stat-card.green .stat-num { color:#3ddc84; }
    .stat-card.blue .stat-num { color:#2196f3; }
    .stat-card.orange .stat-num { color:#ff9800; }

    /* ── Analytics grid ── */
    .analytics-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .analytics-panel { background:var(--dark2); border:1px solid var(--border); border-radius:16px; padding:24px; }
    .analytics-panel.full-width { grid-column:1/-1; }
    .analytics-panel h3 { margin:0 0 20px; font-size:15px; font-weight:700; }

    /* bar chart */
    .bar-chart { display:flex; flex-direction:column; gap:12px; }
    .bar-row { display:flex; align-items:center; gap:12px; }
    .bar-label { width:130px; font-size:12px; color:var(--text-muted); flex-shrink:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .bar-track { flex:1; height:8px; background:var(--border); border-radius:4px; overflow:hidden; }
    .bar-fill { height:100%; background:var(--red); border-radius:4px; transition:width .5s; }
    .bar-value { width:24px; font-size:12px; color:var(--text-muted); text-align:right; }

    /* status bars */
    .donut-legend { display:flex; gap:16px; margin-bottom:16px; flex-wrap:wrap; }
    .legend-item { display:flex; align-items:center; gap:6px; font-size:13px; }
    .legend-dot { width:10px; height:10px; border-radius:50%; }
    .legend-item.green .legend-dot { background:#3ddc84; }
    .legend-item.orange .legend-dot { background:#ff9800; }
    .legend-item.red .legend-dot { background:var(--red); }
    .legend-val { font-weight:700; margin-left:auto; }
    .status-bars { display:flex; flex-direction:column; gap:10px; }
    .status-bar-row { display:flex; align-items:center; gap:10px; font-size:12px; }
    .status-bar-row span:first-child { width:55px; flex-shrink:0; color:var(--text-muted); }
    .status-bar-row span:last-child { width:30px; text-align:right; color:var(--text-muted); }
    .sbar-track { flex:1; height:8px; background:var(--border); border-radius:4px; overflow:hidden; }
    .sbar-fill { height:100%; border-radius:4px; transition:width .5s; }
    .sbar-fill.green { background:#3ddc84; }
    .sbar-fill.orange { background:#ff9800; }
    .sbar-fill.red { background:var(--red); }

    /* histogram */
    .histogram { display:flex; align-items:flex-end; gap:8px; height:120px; padding-top:16px; }
    .hist-bar { display:flex; flex-direction:column; align-items:center; flex:1; height:100%; justify-content:flex-end; gap:4px; }
    .hist-fill { width:100%; background:var(--red); border-radius:4px 4px 0 0; min-height:4px; transition:height .4s; }
    .hist-label { font-size:10px; color:var(--text-muted); white-space:nowrap; }

    /* ── Buttons ── */
    .btn-primary-rh { background:var(--red); color:#fff; border:none; border-radius:8px; padding:10px 20px; font-size:14px; font-weight:600; cursor:pointer; transition:opacity .15s; }
    .btn-primary-rh:hover { opacity:.85; }
    .btn-primary-rh:disabled { opacity:.5; cursor:not-allowed; }
    .btn-ghost-rh { background:transparent; border:1px solid var(--border); color:var(--text); border-radius:8px; padding:10px 20px; font-size:14px; cursor:pointer; transition:border-color .15s; }
    .btn-ghost-rh:hover { border-color:var(--red); }
    .back-btn { background:none; border:none; color:var(--red); font-size:14px; cursor:pointer; padding:0; font-weight:600; }

    /* ── Form card ── */
    .form-card { background:var(--dark2); border:1px solid var(--border); border-radius:16px; padding:28px; margin-bottom:28px; }
    .form-card h3 { margin:0 0 24px; font-size:18px; font-weight:700; }
    .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .field { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
    .field label { font-size:13px; font-weight:600; color:var(--text); }
    .field-hint { font-weight:400; color:var(--text-muted); }
    .field input, .field select, .field textarea { background:var(--dark3); border:1px solid var(--border); border-radius:8px; padding:10px 14px; color:var(--text); font-size:14px; width:100%; box-sizing:border-box; }
    .field input:focus, .field select:focus, .field textarea:focus { outline:none; border-color:var(--red); }
    .field-error { font-size:12px; color:var(--red); }
    .form-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:8px; }

    /* tag input */
    .tag-input-row { display:flex; gap:8px; }
    .tag-input-row input { flex:1; }
    .tag-add-btn { background:var(--red); color:#fff; border:none; border-radius:8px; padding:0 14px; font-size:18px; cursor:pointer; }
    .tags-list { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
    .skill-tag { background:rgba(33,150,243,.15); color:#2196f3; border:1px solid rgba(33,150,243,.3); border-radius:20px; padding:4px 10px; font-size:12px; display:flex; align-items:center; gap:6px; }
    .skill-tag button { background:none; border:none; color:#2196f3; cursor:pointer; font-size:14px; padding:0; line-height:1; }

    /* ── Jobs grid ── */
    .jobs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
    .job-card-rh { background:var(--dark2); border:1px solid var(--border); border-radius:16px; padding:24px; cursor:pointer; transition:all .2s; }
    .job-card-rh:hover { border-color:var(--red); transform:translateY(-2px); box-shadow:var(--shadow-red); }
    .jcr-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
    .jcr-type { font-size:10px; font-weight:800; padding:3px 8px; border-radius:6px; text-transform:uppercase; }
    .jcr-cdi { color:#4caf50; background:rgba(76,175,80,.15); }
    .jcr-cdd { color:#ff9800; background:rgba(255,152,0,.15); }
    .jcr-stage { color:#2196f3; background:rgba(33,150,243,.15); }
    .jcr-actions { display:flex; gap:4px; }
    .icon-btn { background:none; border:none; cursor:pointer; padding:4px 6px; border-radius:6px; font-size:15px; transition:background .15s; }
    .icon-btn:hover { background:var(--border); }
    .icon-btn.danger:hover { background:var(--red-glow); }
    .jcr-title { font-size:17px; font-weight:700; margin:0 0 6px; color:var(--text); }
    .jcr-loc { font-size:13px; color:var(--text-muted); margin:0 0 16px; }
    .jcr-stats { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:8px; margin-bottom:16px; }
    .jcr-stat { text-align:center; }
    .jcr-stat-val { display:block; font-size:18px; font-weight:700; }
    .jcr-stat-val.green { color:#3ddc84; }
    .jcr-stat-val.orange { color:#ff9800; }
    .jcr-stat-val.red { color:var(--red); }
    .jcr-stat-lbl { font-size:10px; color:var(--text-muted); }
    .jcr-cta { font-size:12px; color:var(--red); font-weight:600; text-align:right; }

    /* ── Applicants ── */
    .applicants-section { }
    .applicants-header { display:flex; align-items:center; gap:20px; margin-bottom:24px; }
    .applicants-header h2 { margin:0; font-size:22px; font-weight:800; }
    .badge-type { font-size:10px; font-weight:800; padding:3px 8px; border-radius:6px; }
    .badge-cdi { color:#4caf50; background:rgba(76,175,80,.15); }
    .badge-cdd { color:#ff9800; background:rgba(255,152,0,.15); }
    .badge-stage { color:#2196f3; background:rgba(33,150,243,.15); }

    .app-table-header { display:grid; grid-template-columns:64px 1fr 1fr 1fr 120px 130px; gap:12px; padding:10px 16px; font-size:11px; font-weight:700; letter-spacing:.5px; color:var(--text-muted); border-bottom:1px solid var(--border); text-transform:uppercase; }
    .app-row { display:grid; grid-template-columns:64px 1fr 1fr 1fr 120px 130px; gap:12px; align-items:center; padding:14px 16px; border-bottom:1px solid var(--border); cursor:pointer; transition:background .15s; border-radius:8px; }
    .app-row:hover { background:var(--dark3); }

    .app-rank { display:flex; flex-direction:column; align-items:center; gap:2px; }
    .rank-num { font-size:20px; font-weight:800; color:var(--text); }
    .rank-top { font-size:9px; font-weight:800; color:var(--red); letter-spacing:1px; }
    .app-rank.top3 .rank-num { color:var(--red); }
    .app-candidate { display:flex; align-items:center; gap:10px; }
    .app-avatar { width:36px; height:36px; border-radius:50%; background:var(--red); color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; }
    .app-name { font-size:14px; font-weight:600; }

    .app-score-col { }
    .score-bar-wrap { display:flex; flex-direction:column; gap:4px; }
    .score-pct { font-size:14px; font-weight:700; }
    .score-track { height:5px; background:var(--border); border-radius:3px; overflow:hidden; }
    .score-fill { height:100%; border-radius:3px; transition:width .4s; }
    .analyzing-badge { font-size:11px; color:var(--text-muted); }
    .muted-sm { font-size:12px; color:var(--text-dim); }
    .inline-analyze-btn { background:rgba(61,220,132,.12); border:1px solid rgba(61,220,132,.3); color:#3ddc84; border-radius:6px; padding:4px 10px; font-size:12px; cursor:pointer; font-weight:600; transition:opacity .15s; }
    .inline-analyze-btn:hover { opacity:.8; }

    .app-status-col { }
    .status-chip { font-size:11px; font-weight:700; padding:3px 8px; border-radius:20px; }
    .chip-pending { background:rgba(255,152,0,.15); color:#ff9800; }
    .chip-accepted { background:rgba(61,220,132,.15); color:#3ddc84; }
    .chip-rejected { background:var(--red-glow); color:var(--red); }
    .reco-chip { display:inline-block; margin-top:5px; font-size:10px; font-weight:600; padding:2px 7px; border-radius:10px; white-space:nowrap; }
    .reco-accept { background:rgba(61,220,132,.12); color:#3ddc84; border:1px solid rgba(61,220,132,.3); }
    .reco-reject { background:var(--red-glow); color:var(--red); border:1px solid rgba(227,30,36,.3); }
    .threshold-box { display:flex; align-items:center; gap:4px; background:var(--surface-2,rgba(255,255,255,.04)); border:1px solid var(--border); border-radius:8px; padding:5px 9px; }
    .threshold-lbl { font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:.5px; }
    .threshold-range { width:90px; accent-color:#38d6c7; cursor:pointer; }
    .threshold-step { width:22px; height:22px; border:1px solid var(--border); background:transparent; color:var(--text); border-radius:6px; cursor:pointer; font-size:14px; line-height:1; display:flex; align-items:center; justify-content:center; padding:0; }
    .threshold-step:hover { border-color:#38d6c7; color:#38d6c7; }
    .threshold-val { font-size:14px; font-weight:800; color:#38d6c7; min-width:42px; text-align:right; }
    .auto-decide-btn:not(:disabled) { border-color:rgba(56,214,199,.4); color:#38d6c7; }
    .drawer-reco { margin:0 20px 10px; padding:8px 12px; border-radius:8px; font-size:12px; text-align:center; }

    .app-actions { display:flex; gap:6px; align-items:center; }
    .action-accept, .action-reject, .action-msg, .action-cv, .action-analyze { border:none; border-radius:6px; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; transition:opacity .15s; text-decoration:none; }
    .action-analyze { background:rgba(156,39,176,.15); color:#9c27b0; }
    .action-analyze:hover:not(:disabled) { opacity:.8; }
    .action-analyze:disabled { opacity:.4; cursor:not-allowed; }
    .action-accept { background:rgba(61,220,132,.15); color:#3ddc84; }
    .action-accept:hover { opacity:.8; }
    .action-reject { background:var(--red-glow); color:var(--red); }
    .action-reject:hover { opacity:.8; }
    .action-msg { background:rgba(33,150,243,.15); color:#2196f3; }
    .action-cv { background:rgba(255,152,0,.15); color:#ff9800; font-size:16px; }
    .action-accept.full, .action-reject.full { width:auto; padding:8px 16px; font-size:13px; font-weight:600; }

    /* ── CV Drawer ── */
    .drawer-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:100; }
    .cv-drawer { position:fixed; right:0; top:0; bottom:0; width:400px; background:var(--dark2); border-left:1px solid var(--border); z-index:101; display:flex; flex-direction:column; overflow:hidden; }
    .drawer-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid var(--border); flex-shrink:0; }
    .drawer-name { font-size:18px; font-weight:700; }
    .drawer-close { background:none; border:none; color:var(--text-muted); font-size:20px; cursor:pointer; }
    .drawer-body { flex:1; overflow-y:auto; padding:24px; }
    .drawer-footer { display:flex; gap:8px; padding:16px 24px; border-top:1px solid var(--border); flex-shrink:0; }

    .dual-scores { display:flex; gap:16px; justify-content:center; margin-bottom:24px; }
    .score-circle { width:100px; height:100px; border-radius:50%; border:3px solid; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .score-big { font-size:26px; font-weight:800; line-height:1; }
    .score-type { font-size:10px; color:var(--text-muted); margin-top:4px; text-align:center; }

    .drawer-section { margin-bottom:20px; }
    .drawer-section h4 { font-size:13px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.5px; margin:0 0 10px; }
    .contact-grid { display:flex; flex-direction:column; gap:6px; font-size:13px; color:var(--text); }
    .skill-grid { display:flex; flex-direction:column; gap:12px; }
    .skill-group { }
    .sg-label { font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
    .sg-tags { display:flex; flex-wrap:wrap; gap:6px; }
    .sg-tag { font-size:11px; padding:3px 8px; border-radius:12px; }
    .sg-tag.lang { background:rgba(61,220,132,.12); color:#3ddc84; }
    .sg-tag.fw { background:rgba(33,150,243,.12); color:#2196f3; }
    .sg-tag.db { background:rgba(255,152,0,.12); color:#ff9800; }
    .sg-tag.dv { background:rgba(156,39,176,.12); color:#ce93d8; }
    .sg-tag.soft { background:var(--dark3); color:var(--text-muted); }
    .sg-tag.missing { background:var(--red-glow); color:var(--red); }
    .drawer-list { margin:0; padding-left:16px; font-size:13px; color:var(--text); display:flex; flex-direction:column; gap:6px; }

    /* ── Misc ── */
    .loading-placeholder { padding:40px; text-align:center; color:var(--text-muted); }
    .empty-state { padding:40px; text-align:center; color:var(--text-muted); }
    .empty-card { background:var(--dark2); border:1px dashed var(--border); border-radius:16px; padding:40px; text-align:center; color:var(--text-muted); grid-column:1/-1; }
    .green { color:#3ddc84; }
    .orange { color:#ff9800; }
    .red { color:var(--red); }

    @media (max-width: 1024px) {
      .rh-sidebar { display:none; }
      .rh-main { padding:20px; }
      .analytics-grid { grid-template-columns:1fr; }
      .app-table-header, .app-row { grid-template-columns:50px 1fr 80px 80px 100px 100px; gap:8px; }
    }
    @media (max-width: 768px) {
      .cv-drawer { width:100vw; }
      .app-table-header { display:none; }
      .app-row { grid-template-columns:1fr; }
    }
  `]
})
export class RhDashboardComponent implements OnInit {
  activeTab: 'analytics' | 'jobs' = 'analytics';
  jobs: Job[] = [];
  jobsWithStats: JobWithStats[] = [];
  selectedJob: Job | null = null;
  applicants: ApplicantWithUser[] = [];
  drawerApp: ApplicantWithUser | null = null;
  loading = false;
  loadingApplicants = false;
  saving = false;
  showForm = false;
  editingJob: Job | null = null;
  requiredSkills: string[] = [];
  /** Minimum average CV score (moyenne) required to accept a candidate. */
  acceptThreshold = 60;
  jobForm: FormGroup;
  currentUser = this.authService.getCurrentUser();

  // Analytics
  get totalApplications(): number { return this.jobsWithStats.reduce((s, j) => s + j.applicationCount, 0); }
  get totalAccepted(): number { return this.jobsWithStats.reduce((s, j) => s + j.acceptedCount, 0); }
  get totalRejected(): number { return this.jobsWithStats.reduce((s, j) => s + j.rejectedCount, 0); }
  get pendingCount(): number { return this.jobsWithStats.reduce((s, j) => s + j.pendingCount, 0); }
  get avgMatchScore(): number {
    const scored = this.jobsWithStats.filter(j => j.avgScore > 0);
    if (!scored.length) return 0;
    return Math.round(scored.reduce((s, j) => s + j.avgScore, 0) / scored.length);
  }
  get acceptanceRate(): number {
    if (!this.totalApplications) return 0;
    return Math.round((this.totalAccepted / this.totalApplications) * 100);
  }
  get maxApps(): number { return Math.max(...this.jobsWithStats.map(j => j.applicationCount), 1); }
  scoreBuckets = [
    { label: '0–20', count: 0 }, { label: '21–40', count: 0 },
    { label: '41–60', count: 0 }, { label: '61–80', count: 0 }, { label: '81–100', count: 0 }
  ];
  get maxBucket(): number { return Math.max(...this.scoreBuckets.map(b => b.count), 1); }

  private userNameMap = new Map<number, string>();

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private postService: PostService,
    private chatbotService: ChatbotService,
    private authService: AuthService,
    private notifications: NotificationService,
    private http: HttpClient,
    private router: Router,
    public lang: LanguageService
  ) {
    this.jobForm = this.fb.group({
      titre: ['', Validators.required],
      type: ['CDI', Validators.required],
      lieu: [''],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.jobService.getJobs().subscribe({
      next: all => {
        const myId = this.currentUser?.id;
        const mine = all.filter(j => j.posterUserId === myId);
        this.jobs = mine;
        this.loadJobStats(mine);
        this.loading = false;
      },
      error: () => { this.loading = false; this.notifications.error('Failed to load jobs'); }
    });
  }

  loadJobStats(jobs: Job[]): void {
    if (!jobs.length) { this.jobsWithStats = []; return; }
    const reqs = jobs.map(j =>
      this.jobService.getApplications(j.id).pipe(catchError(() => of([])))
    );
    forkJoin(reqs).subscribe((appLists: Application[][]) => {
      this.jobsWithStats = jobs.map((j, i) => {
        const apps = appLists[i] as Application[];
        const scored = apps.filter(a => a.matchScore != null);
        const avg = scored.length ? Math.round(scored.reduce((s, a) => s + (a.matchScore ?? 0), 0) / scored.length) : 0;
        return {
          ...j,
          avgScore: avg,
          acceptedCount: apps.filter(a => a.statut === 'ACCEPTED').length,
          rejectedCount: apps.filter(a => a.statut === 'REJECTED').length,
          pendingCount: apps.filter(a => a.statut === 'PENDING').length
        } as JobWithStats;
      });
      this.buildScoreBuckets(appLists.flat());
    });
  }

  buildScoreBuckets(apps: Application[]): void {
    const buckets = [0, 0, 0, 0, 0];
    apps.forEach(a => {
      const s = a.matchScore ?? 0;
      if (s <= 20) buckets[0]++;
      else if (s <= 40) buckets[1]++;
      else if (s <= 60) buckets[2]++;
      else if (s <= 80) buckets[3]++;
      else buckets[4]++;
    });
    this.scoreBuckets = this.scoreBuckets.map((b, i) => ({ ...b, count: buckets[i] }));
  }

  selectJob(job: Job): void {
    this.selectedJob = job;
    this.activeTab = 'jobs';
    this.loadApplicants(job.id);
  }

  loadApplicants(jobId: number): void {
    this.loadingApplicants = true;
    this.applicants = [];
    this.jobService.getRankedApplicants(jobId).pipe(catchError(() => this.jobService.getApplications(jobId))).subscribe({
      next: apps => {
        this.applicants = apps.map(a => ({
          ...a,
          userName: `User #${a.applicantUserId}`,
          initials: '?'
        }));
        this.resolveNames(apps.map(a => a.applicantUserId));
        this.autoAnalyzeMissing();
        this.loadingApplicants = false;
      },
      error: () => { this.loadingApplicants = false; this.notifications.error(this.lang.t('rh.loadApplicantsError')); }
    });
  }

  private resolveNames(ids: number[]): void {
    const unique = [...new Set(ids)];
    if (!unique.length) return;
    this.http.get<any[]>(`${environment.apiUrl}/auth/users/bulk?${unique.map(id => 'ids=' + id).join('&')}`)
      .pipe(catchError(() => of([])))
      .subscribe(users => {
        users.forEach(u => this.userNameMap.set(u.id, `${u.prenom} ${u.nom}`));
        this.applicants = this.applicants.map(a => ({
          ...a,
          userName: this.userNameMap.get(a.applicantUserId) ?? `User #${a.applicantUserId}`,
          initials: this.getInitials(this.userNameMap.get(a.applicantUserId) ?? '#')
        }));
      });
  }

  autoAnalyzeMissing(): void {
    this.applicants
      .filter(a => a.cvUrl && a.matchScore == null)
      .forEach(a => this.analyzeSingle(a));
  }

  analyzeSingle(app: ApplicantWithUser): void {
    if (!app.cvUrl || app.analyzing) return;
    app.analyzing = true;
    const appId = app.id;
    const cvUrl = app.cvUrl;
    this.chatbotService.analyzeCvByUrl(cvUrl).subscribe({
      next: (analysis: CvAnalysis) => {
        // resolveNames() may have replaced this.applicants with new objects — find current reference by id
        const target = this.applicants.find(a => a.id === appId) ?? app;
        target.analyzing = false;
        target.cvAnalysis = analysis;
        if (analysis.score != null) {
          this.jobService.updateMatchScore(appId, analysis.score).subscribe({
            next: updated => {
              const t = this.applicants.find(a => a.id === appId) ?? target;
              t.matchScore = updated.matchScore;
            },
            error: () => {}
          });
        }
      },
      error: () => {
        const target = this.applicants.find(a => a.id === appId) ?? app;
        target.analyzing = false;
      }
    });
  }

  updateStatus(app: ApplicantWithUser, status: Application['statut']): void {
    this.jobService.updateApplicationStatus(app.id, status).subscribe({
      next: () => {
        app.statut = status;
        const messageKey = status === 'ACCEPTED' ? 'rh.applicantAccepted' : 'rh.applicantRejected';
        this.notifications.success(this.lang.t(messageKey));
      },
      error: (err) => {
        const backendMessage = err.error?.message || err.error?.error;
        this.notifications.error(backendMessage || this.lang.t('rh.updateStatusError'));
      }
    });
  }

  /** Clamp a raw input value into the 0–100 range for the pass-score field. */
  clampScore(value: string | number): number {
    const n = Math.round(Number(value));
    if (isNaN(n)) return 0;
    return Math.min(100, Math.max(0, n));
  }

  /**
   * Recommendation based on the candidate's average CV score (moyenne):
   * ACCEPTED if score ≥ pass score, REJECTED if below. Null while no score yet.
   */
  recommendation(app: ApplicantWithUser): Application['statut'] | null {
    const score = app.matchScore;
    if (score == null) return null;
    return score >= this.acceptThreshold ? 'ACCEPTED' : 'REJECTED';
  }

  /** True when at least one pending applicant has a CV score to decide on. */
  get hasScoredPending(): boolean {
    return this.applicants.some(a => a.statut === 'PENDING' && a.matchScore != null);
  }

  /**
   * Auto-accept every pending applicant whose average CV score ≥ pass score,
   * and reject the rest. Drives the accept/reject decision from the score.
   */
  autoDecideByScore(): void {
    const targets = this.applicants.filter(a => a.statut === 'PENDING' && a.matchScore != null);
    if (!targets.length) {
      this.notifications.error(this.lang.t('rh.noScoredPending'));
      return;
    }
    let accepted = 0, rejected = 0;
    targets.forEach(app => {
      const decision = this.recommendation(app);
      if (!decision) return;
      decision === 'ACCEPTED' ? accepted++ : rejected++;
      // Update silently (single summary toast below instead of one per candidate).
      this.jobService.updateApplicationStatus(app.id, decision).subscribe({
        next: () => { app.statut = decision; },
        error: () => {}
      });
    });
    this.notifications.success(
      `${this.lang.t('rh.autoDecideDone')} ${targets.length} — ${accepted} ${this.lang.t('rh.accepted')}, ` +
      `${rejected} ${this.lang.t('rh.rejected')} (${this.lang.t('rh.passScore')} ${this.acceptThreshold}%).`
    );
  }

  messageApplicant(userId: number): void {
    this.router.navigate(['/messages'], { queryParams: { startWith: userId } });
  }

  addSkillTag(value: string): void {
    const v = value.trim();
    if (v && !this.requiredSkills.includes(v)) this.requiredSkills.push(v);
  }

  removeSkillTag(i: number): void {
    this.requiredSkills.splice(i, 1);
  }

  saveJob(): void {
    if (this.jobForm.invalid) return;
    this.saving = true;
    const payload = { ...this.jobForm.value, entreprise: this.currentUser?.nom ?? '' };
    const isCreate = !this.editingJob;
    const req = this.editingJob
      ? this.jobService.updateJob(this.editingJob.id, payload)
      : this.jobService.createJob(payload);
    req.subscribe({
      next: () => {
        if (isCreate) {
          this.publishFeedAnnouncement(`New job offer posted: ${payload.titre} at ${payload.entreprise}`);
        }
        this.saving = false;
        this.showForm = false;
        this.editingJob = null;
        this.requiredSkills = [];
        this.jobForm.reset({ type: 'CDI' });
        this.loadJobs();
        this.notifications.success(isCreate ? 'Job posted' : 'Job updated');
      },
      error: () => { this.saving = false; this.notifications.error('Failed to save job'); }
    });
  }

  editJob(job: Job): void {
    this.editingJob = job;
    this.showForm = true;
    this.jobForm.patchValue({ titre: job.titre, type: job.type, lieu: job.lieu, description: job.description });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingJob = null;
    this.requiredSkills = [];
    this.jobForm.reset({ type: 'CDI' });
  }

  deleteJob(job: Job): void {
    if (!confirm(`Delete "${job.titre}"? This cannot be undone.`)) return;
    this.jobService.deleteJob(job.id).subscribe({
      next: () => { this.loadJobs(); this.notifications.success('Job deleted'); },
      error: () => this.notifications.error('Failed to delete job')
    });
  }

  openDrawer(app: ApplicantWithUser): void {
    this.drawerApp = app;
    if (!app.cvAnalysis && app.cvUrl && !app.analyzing) this.analyzeSingle(app);
  }

  closeDrawer(): void { this.drawerApp = null; }

  jobMatchScore(app: ApplicantWithUser): number {
    if (!app.cvAnalysis || !this.requiredSkills.length) return 0;
    const allSkills = (app.cvAnalysis.all_skills ?? []).map(s => s.toLowerCase());
    const matched = this.requiredSkills.filter(s => allSkills.includes(s.toLowerCase())).length;
    return Math.round((matched / this.requiredSkills.length) * 100);
  }

  skillGap(app: ApplicantWithUser): string[] {
    if (!app.cvAnalysis || !this.requiredSkills.length) return [];
    const allSkills = (app.cvAnalysis.all_skills ?? []).map(s => s.toLowerCase());
    return this.requiredSkills.filter(s => !allSkills.includes(s.toLowerCase()));
  }

  scoreColor(score: number): string {
    if (score >= 80) return '#3ddc84';
    if (score >= 60) return '#8bc34a';
    if (score >= 40) return '#ff9800';
    return '#e31e24';
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  private publishFeedAnnouncement(content: string): void {
    this.postService.createPost({ contenu: content, autoApprove: true }).subscribe({ error: () => undefined });
  }
}
