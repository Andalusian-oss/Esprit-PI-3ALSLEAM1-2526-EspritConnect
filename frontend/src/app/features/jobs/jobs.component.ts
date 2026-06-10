import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Application, Job, JobRequest, CvAnalysis } from '../../core/models/models';
import { JobService } from '../../core/services/job.service';
import { PostService } from '../../core/services/post.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatbotService } from '../../core/services/chatbot.service';
import { LanguageService } from '../../core/services/language.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-jobs',
  template: `
    <div class="page-wide">

      <!-- ── Hero Header ── -->
      <div class="jobs-hero">
        <div class="jobs-hero-text">
          <h1>{{ lang.t('jobs.title') }}</h1>
          <p>{{ lang.t('jobs.subtitle') }}</p>
        </div>
        <div class="jobs-hero-stats">
          <div class="jobs-kpi">
            <span class="jobs-kpi-value">{{ jobs.length }}</span>
            <span class="jobs-kpi-label">{{ lang.t('jobs.sectionOffers') }}</span>
          </div>
          <div class="jobs-kpi-sep"></div>
          <div class="jobs-kpi">
            <span class="jobs-kpi-value jobs-kpi-green">{{ totalAccepted }}</span>
            <span class="jobs-kpi-label">Accepted</span>
          </div>
          <div class="jobs-kpi-sep"></div>
          <div class="jobs-kpi">
            <span class="jobs-kpi-value jobs-kpi-cyan">{{ pendingCount }}</span>
            <span class="jobs-kpi-label">Pending</span>
          </div>
          <div class="jobs-kpi-sep"></div>
          <div class="jobs-kpi">
            <span class="jobs-kpi-value jobs-kpi-yellow">{{ myApplications.length }}</span>
            <span class="jobs-kpi-label">My Applications</span>
          </div>
        </div>
      </div>

      <!-- ── Job type breakdown bar ── -->
      <div class="jobs-type-bar" *ngIf="jobs.length > 0">
        <div class="jobs-type-item">
          <span class="badge badge-green">STAGE</span>
          <div class="jobs-type-track">
            <div class="jobs-type-fill jobs-type-stage" [style.width.%]="pct('STAGE')"></div>
          </div>
          <span class="jobs-type-count">{{ countType('STAGE') }}</span>
        </div>
        <div class="jobs-type-item">
          <span class="badge badge-blue">CDI</span>
          <div class="jobs-type-track">
            <div class="jobs-type-fill jobs-type-cdi" [style.width.%]="pct('CDI')"></div>
          </div>
          <span class="jobs-type-count">{{ countType('CDI') }}</span>
        </div>
        <div class="jobs-type-item">
          <span class="badge badge-gray">CDD</span>
          <div class="jobs-type-track">
            <div class="jobs-type-fill jobs-type-cdd" [style.width.%]="pct('CDD')"></div>
          </div>
          <span class="jobs-type-count">{{ countType('CDD') }}</span>
        </div>
      </div>

      <div class="crud-grid">
        <section class="panel">
          <ng-container *ngIf="canManageJobs; else jobReadonly">
            <h2>{{ editingJobId ? lang.t('jobs.updateOffer') : lang.t('jobs.createOffer') }}</h2>
            <form [formGroup]="jobForm" (ngSubmit)="saveJob()" class="stack">
              <div class="grid-2">
                <input formControlName="titre" placeholder="Title *" />
                <input formControlName="entreprise" placeholder="Company *" />
              </div>
              <textarea formControlName="description" placeholder="Job description"></textarea>
              <div class="grid-2">
                <select formControlName="type">
                  <option value="STAGE">{{ lang.t('jobs.internship') }}</option>
                  <option value="CDI">{{ lang.t('jobs.cdi') }}</option>
                  <option value="CDD">{{ lang.t('jobs.cdd') }}</option>
                </select>
                <input formControlName="lieu" placeholder="Location" />
              </div>
              <div class="form-actions">
                <button class="btn btn-primary" type="submit" [disabled]="jobForm.invalid || saving">
                  <span class="icon" [ngClass]="editingJobId ? 'icon-save' : 'icon-plus'"></span>
                  {{ editingJobId ? lang.t('common.update') : lang.t('jobs.postJob') }}
                </button>
                <button class="btn btn-ghost" type="button" *ngIf="editingJobId" (click)="resetJobForm()">{{ lang.t('common.cancel') }}</button>
              </div>
            </form>
          </ng-container>
          <ng-template #jobReadonly>
            <h2>{{ lang.t('jobs.findOpportunities') }}</h2>
            <p class="muted">{{ lang.t('jobs.findOpportunitiesDesc') }}</p>
          </ng-template>
        </section>

      </div>

      <div *ngIf="error" class="error-msg">{{ error }}</div>
      <div *ngIf="loading" class="empty"><p>{{ lang.t('common.loading') }}</p></div>

      <!-- ── Job Listings ── -->
      <div class="section-title">{{ lang.t('jobs.sectionOffers') }}</div>
      <div class="toolbar">
        <input [(ngModel)]="jobQuery" [placeholder]="lang.t('jobs.searchJobs')" />
        <select [(ngModel)]="jobTypeFilter">
          <option value="">{{ lang.t('jobs.allTypes') }}</option>
          <option value="STAGE">{{ lang.t('jobs.typeInternship') }}</option>
          <option value="CDI">{{ lang.t('jobs.typeCDI') }}</option>
          <option value="CDD">{{ lang.t('jobs.typeCDD') }}</option>
        </select>
      </div>

      <div *ngIf="!loading && jobs.length === 0" class="empty">
        <div class="empty-icon">💼</div>
        <p>{{ lang.t('jobs.noJobs') }}</p>
      </div>

      <div class="list-grid">
        <article class="card" *ngFor="let job of pagedJobs">
          <div class="item-head">
            <div>
              <h3>{{ job.titre }}</h3>
              <p>{{ job.entreprise }}</p>
            </div>
            <span class="badge" [ngClass]="{'badge-green': job.type==='STAGE','badge-blue': job.type==='CDI','badge-gray': job.type==='CDD'}">{{ job.type }}</span>
          </div>
          <p class="muted" *ngIf="job.description">{{ job.description | slice:0:120 }}{{ job.description!.length > 120 ? '...' : '' }}</p>
          <div class="meta-row">
            <span *ngIf="job.lieu"><span class="icon icon-location" style="width:12px;height:12px"></span> {{ job.lieu }}</span>
            <span>{{ job.applicationCount }} {{ lang.t('jobs.applicants') }}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-ghost" (click)="openApplyModal(job)">
              <span class="icon icon-send"></span>{{ lang.t('common.apply') }}
            </button>
            <button class="btn btn-ghost" *ngIf="canManageJobs" (click)="loadApplications(job.id)">
              <span class="icon icon-users"></span>{{ lang.t('jobs.applications') }}
            </button>
            <button class="btn btn-ghost btn-sm" *ngIf="canManageJobs" (click)="editJob(job)">
              <span class="icon icon-edit"></span>
            </button>
            <button class="btn btn-danger btn-sm" *ngIf="canManageJobs" (click)="deleteJob(job.id)">
              <span class="icon icon-trash"></span>
            </button>
          </div>

          <!-- Applications panel -->
          <div class="sub-list" *ngIf="selectedJobId === job.id && applications.length > 0">
            <div class="sub-row" *ngFor="let app of applications">
              <div style="flex:1">
                <div style="font-size:14px;font-weight:500">Applicant #{{ app.applicantUserId }}</div>
                <div style="font-size:12px;color:var(--text-muted)">
                  <span class="badge" [ngClass]="{'badge-green': app.statut==='ACCEPTED','badge-red': app.statut==='REJECTED','badge-gray': app.statut==='PENDING'}">{{ app.statut }}</span>
                  <span *ngIf="app.matchScore !== undefined && app.matchScore !== null" style="margin-left:8px">
                    {{ lang.t('jobs.score') }} <strong style="color:#3ddc84">{{ app.matchScore }}/100</strong>
                  </span>
                </div>
              </div>
              <div class="applicant-actions">
                <a *ngIf="app.cvUrl" [href]="app.cvUrl" target="_blank" class="btn btn-ghost btn-sm">
                  <span class="icon icon-external"></span>CV
                </a>
                <button *ngIf="app.cvUrl" class="btn btn-ghost btn-sm" (click)="analyzeCV(app)" [disabled]="analyzingAppId === app.id">
                  <span class="icon icon-search"></span>{{ analyzingAppId === app.id ? lang.t('jobs.analyzingCv') : lang.t('jobs.analyzeCv') }}
                </button>
                <button class="btn btn-ghost btn-sm" title="Message applicant" (click)="contactApplicant(app.applicantUserId)">
                  <span class="icon icon-message"></span>
                </button>
                <button class="btn btn-sm btn-success" (click)="setApplicationStatus(app, 'ACCEPTED')">
                  <span class="icon icon-check"></span>
                </button>
                <button class="btn btn-sm btn-danger" (click)="setApplicationStatus(app, 'REJECTED')">
                  <span class="icon icon-x"></span>
                </button>
              </div>
            </div>
          </div>
          <div class="empty" style="padding:12px 0" *ngIf="selectedJobId === job.id && applications.length === 0">
            <p style="font-size:13px">{{ lang.t('jobs.noApplications') }}</p>
          </div>
        </article>
      </div>

      <div class="pagination" *ngIf="filteredJobs.length > pageSize">
        <button class="btn btn-ghost" (click)="jobPage = jobPage - 1" [disabled]="jobPage === 1">{{ lang.t('common.previous') }}</button>
        <span>{{ jobPage }} / {{ jobTotalPages }}</span>
        <button class="btn btn-ghost" (click)="jobPage = jobPage + 1" [disabled]="jobPage === jobTotalPages">{{ lang.t('common.next') }}</button>
      </div>

      <!-- ── My Applications (for non-managers) ── -->
      <ng-container *ngIf="!canManageJobs && myApplications.length > 0">
        <div class="section-title">My Applications</div>
        <div class="list-grid">
          <article class="card" *ngFor="let app of myApplications">
            <div class="item-head">
              <div style="flex:1;min-width:0">
                <h3>{{ app.jobTitre }}</h3>
                <div style="display:flex;align-items:center;gap:10px;margin-top:6px;flex-wrap:wrap">
                  <span class="badge"
                    [ngClass]="{'badge-green': app.statut==='ACCEPTED','badge-red': app.statut==='REJECTED','badge-gray': app.statut==='PENDING'}">
                    {{ app.statut }}
                  </span>
                  <ng-container *ngIf="app.matchScore != null">
                    <span style="font-size:13px;font-weight:600" [style.color]="scoreGradientColor(app.matchScore)">
                      Score: {{ app.matchScore }}/100
                    </span>
                  </ng-container>
                  <span *ngIf="app.matchScore == null && app.cvUrl" style="font-size:12px;color:var(--text-muted)">
                    CV pending review
                  </span>
                </div>
              </div>
              <a *ngIf="app.cvUrl" [href]="app.cvUrl" target="_blank" class="btn btn-ghost btn-sm" style="flex-shrink:0">
                <span class="icon icon-external" style="width:12px;height:12px"></span>CV
              </a>
            </div>

            <!-- Score bar (when scored) -->
            <div *ngIf="app.matchScore != null" style="margin-top:10px">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Match Score</div>
              <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
                <div [style.width.%]="app.matchScore" [style.background]="scoreGradientColor(app.matchScore)"
                     style="height:100%;border-radius:3px;transition:width .4s"></div>
              </div>
            </div>

            <!-- Upload CV prompt (no CV attached yet) -->
            <div *ngIf="!app.cvUrl" class="my-app-cv-prompt">
              <span class="icon icon-info" style="width:14px;height:14px;flex-shrink:0"></span>
              <span style="flex:1;font-size:13px;color:var(--text-muted)">
                Add your CV so the recruiter can evaluate your profile
              </span>
              <input type="file" accept=".pdf,.docx,.doc"
                     [id]="'cv-upload-' + app.id"
                     style="display:none"
                     (change)="uploadCvForApplication($event, app)" />
              <label [for]="'cv-upload-' + app.id"
                     class="btn btn-primary btn-sm"
                     [class.disabled]="uploadingCvForApp === app.id"
                     style="cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                <span class="icon icon-upload" style="width:12px;height:12px"></span>
                {{ uploadingCvForApp === app.id ? 'Uploading…' : 'Add CV' }}
              </label>
            </div>

            <!-- CV uploaded → invite RH to analyze -->
            <div *ngIf="app.cvUrl && app.matchScore == null" class="my-app-cv-ready">
              <span class="icon icon-check" style="width:14px;height:14px;color:#3ddc84;flex-shrink:0"></span>
              <span style="font-size:13px;color:var(--text-muted)">CV submitted — waiting for recruiter to evaluate</span>
            </div>
          </article>
        </div>
      </ng-container>

    </div>

    <!-- ── Apply Modal ── -->
    <div class="modal-overlay" *ngIf="applyModal" (click)="closeApplyModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ lang.t('jobs.applyFor') }} {{ applyModal.titre }}</h3>
          <button class="btn btn-icon" (click)="closeApplyModal()"><span class="icon icon-x"></span></button>
        </div>
        <div class="modal-body stack">
          <div class="info-banner">
            <span class="icon icon-info"></span>
            <span>{{ lang.t('jobs.cvBanner') }}</span>
          </div>
          <div class="field">
            <label style="display:block;font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:1px">
              {{ lang.t('jobs.cvLabel') }}
            </label>
            <input type="file" accept=".pdf,.doc,.docx" (change)="onCvSelected($event)" />
            <span class="field-hint" *ngIf="uploadingCv">{{ lang.t('jobs.cvUploading') }}</span>
            <span class="field-hint" *ngIf="cvUrl" style="color:#3ddc84">{{ lang.t('jobs.cvUploaded') }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="closeApplyModal()">{{ lang.t('common.cancel') }}</button>
          <button class="btn btn-primary" (click)="submitApply()" [disabled]="saving || uploadingCv">
            <span class="icon icon-send"></span>
            {{ uploadingCv ? lang.t('jobs.uploadingCvBtn') : lang.t('jobs.submitApplication') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── CV Analysis Modal ── -->
    <div class="modal-overlay" *ngIf="cvAnalysis" (click)="cvAnalysis = null">
      <div class="modal-box modal-box-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ lang.t('jobs.cvAnalysisTitle') }}</h3>
          <button class="btn btn-icon" (click)="cvAnalysis = null"><span class="icon icon-x"></span></button>
        </div>
        <div class="modal-body">
          <div class="cv-score-header">
            <div class="cv-score-circle" [style.background]="scoreGradient(cvAnalysis.score)">
              <strong>{{ cvAnalysis.score }}</strong>
              <small>/100</small>
            </div>
            <div>
              <h4>{{ cvAnalysis.name || lang.t('jobs.candidate') }}</h4>
              <p class="muted">{{ cvAnalysis.summary }}</p>
              <div class="meta-row">
                <span *ngIf="cvAnalysis.contact.email">{{ cvAnalysis.contact.email }}</span>
                <span *ngIf="cvAnalysis.contact.linkedin">{{ cvAnalysis.contact.linkedin }}</span>
                <span *ngIf="cvAnalysis.experience.years_estimated">{{ cvAnalysis.experience.years_estimated }} {{ lang.t('jobs.yrsExp') }}</span>
              </div>
            </div>
          </div>
          <div class="grid-2" style="margin-top:16px;gap:16px">
            <div>
              <div class="section-title" style="font-size:14px;margin:0 0 8px">{{ lang.t('jobs.skillsDetected') }}</div>
              <div class="cv-skills">
                <span class="tag-chip" *ngFor="let s of cvAnalysis.all_skills">{{ s }}</span>
              </div>
            </div>
            <div>
              <div class="section-title" style="font-size:14px;margin:0 0 8px">{{ lang.t('jobs.education') }}</div>
              <div *ngFor="let edu of cvAnalysis.education" class="sub-row" style="margin-bottom:6px">{{ edu }}</div>
              <div class="section-title" style="font-size:14px;margin:12px 0 8px">{{ lang.t('jobs.languages') }}</div>
              <div *ngFor="let lng of cvAnalysis.languages" class="meta-row">
                <span>{{ lng.language }}</span> <span class="badge badge-blue">{{ lng.level }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="cvAnalysis = null">{{ lang.t('common.close') }}</button>
          <button class="btn btn-primary" (click)="saveMatchScore()" *ngIf="analyzingApp">
            <span class="icon icon-save"></span>{{ lang.t('jobs.saveScore') }} ({{ cvAnalysis.score }})
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 300;
      display: flex; align-items: center; justify-content: center; padding: 20px;
      backdrop-filter: blur(4px);
    }
    .modal-box {
      background: linear-gradient(180deg, rgba(28,33,45,0.98), rgba(17,21,31,0.98));
      border: 1px solid var(--border); border-radius: var(--radius-lg);
      width: 100%; max-width: 500px; box-shadow: var(--shadow);
      animation: slideUp 0.2s ease;
    }
    .modal-box-lg { max-width: 760px; max-height: 80vh; overflow-y: auto; }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px 16px; border-bottom: 1px solid var(--border);
      h3 { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }
    }
    .modal-body { padding: 20px 24px; }
    .modal-footer {
      padding: 14px 24px; border-top: 1px solid var(--border);
      display: flex; justify-content: flex-end; gap: 10px;
    }
    .cv-score-header { display: flex; gap: 20px; align-items: flex-start; }
    .cv-score-circle {
      width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      strong { font-size: 24px; font-weight: 800; color: white; line-height: 1; }
      small { font-size: 11px; color: rgba(255,255,255,0.7); }
    }
    .cv-skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag-chip {
      display: inline-block; padding: 3px 8px; border-radius: 20px;
      background: rgba(56,214,199,0.1); color: var(--accent-cyan);
      border: 1px solid rgba(56,214,199,0.2); font-size: 11px;
    }
    .icon-external { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 3h7v7h-2V6.41l-9.3 9.3-1.41-1.41L17.59 5H14V3ZM3 5h8v2H5v12h12v-6h2v8H3V5Z'/%3E%3C/svg%3E"); -webkit-mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 3h7v7h-2V6.41l-9.3 9.3-1.41-1.41L17.59 5H14V3ZM3 5h8v2H5v12h12v-6h2v8H3V5Z'/%3E%3C/svg%3E"); }
    .icon-location { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2C8.69 2 6 4.69 6 8c0 5 6 13 6 13s6-8 6-13c0-3.31-2.69-6-6-6Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z'/%3E%3C/svg%3E"); -webkit-mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2C8.69 2 6 4.69 6 8c0 5 6 13 6 13s6-8 6-13c0-3.31-2.69-6-6-6Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z'/%3E%3C/svg%3E"); }
    .icon-upload { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z'/%3E%3C/svg%3E"); -webkit-mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z'/%3E%3C/svg%3E"); }
    .icon-message { mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Z'/%3E%3C/svg%3E"); -webkit-mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Z'/%3E%3C/svg%3E"); }
    .my-app-cv-prompt {
      display: flex; align-items: center; gap: 10px; margin-top: 12px;
      padding: 10px 14px; border-radius: 10px;
      background: rgba(255,152,0,.07); border: 1px dashed rgba(255,152,0,.3);
      flex-wrap: wrap;
    }
    .my-app-cv-ready {
      display: flex; align-items: center; gap: 8px; margin-top: 12px;
      padding: 8px 12px; border-radius: 10px;
      background: rgba(61,220,132,.07); border: 1px solid rgba(61,220,132,.2);
    }
    .btn.disabled { opacity: .6; pointer-events: none; }

    /* ── Jobs Hero ── */
    .jobs-hero {
      display: flex; align-items: center; justify-content: space-between;
      gap: 24px; flex-wrap: wrap; padding: 28px 32px; border-radius: 20px;
      background: linear-gradient(135deg, rgba(227,30,36,.12) 0%, rgba(56,214,199,.08) 100%);
      border: 1px solid rgba(227,30,36,.2); margin-bottom: 20px;
    }
    .jobs-hero-text h1 { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; margin:0 0 6px; }
    .jobs-hero-text p { color:var(--text-muted); margin:0; font-size:14px; }
    .jobs-hero-stats { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .jobs-kpi { display:flex; flex-direction:column; align-items:center; min-width:72px; }
    .jobs-kpi-value { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; line-height:1; }
    .jobs-kpi-label { font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:.6px; margin-top:3px; }
    .jobs-kpi-sep { width:1px; height:36px; background:var(--border); margin:0 4px; }
    .jobs-kpi-green { color:#3ddc84; }
    .jobs-kpi-cyan { color:#38d6c7; }
    .jobs-kpi-yellow { color:#ffbd59; }

    /* ── Job type breakdown bar ── */
    .jobs-type-bar { display:flex; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
    .jobs-type-item { display:flex; align-items:center; gap:10px; flex:1; min-width:120px; }
    .jobs-type-track { flex:1; height:6px; background:var(--border); border-radius:3px; overflow:hidden; }
    .jobs-type-fill { height:100%; border-radius:3px; transition:width .5s; }
    .jobs-type-stage { background:#3ddc84; }
    .jobs-type-cdi   { background:#38d6c7; }
    .jobs-type-cdd   { background:#ffbd59; }
    .jobs-type-count { font-size:13px; font-weight:700; min-width:16px; text-align:right; }

    /* Light mode hero */
    :host-context(.light-theme) .jobs-hero {
      background: linear-gradient(135deg, rgba(227,30,36,.06) 0%, rgba(56,214,199,.05) 100%);
      border-color: rgba(227,30,36,.15);
    }

    /* ── Mentor Browse ── */
    .mentor-browse-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px;
      margin-bottom: 32px;
    }
    .mentor-browse-card {
      display: flex; flex-direction: column; gap: 12px; padding: 18px;
      border-radius: 14px; border: 1px solid var(--border);
      background: var(--card-bg, var(--dark2));
      transition: border-color .2s, box-shadow .2s, transform .15s;
    }
    .mentor-browse-card:hover { border-color: var(--red, #e31e24); box-shadow: 0 4px 20px rgba(227,30,36,.12); transform: translateY(-2px); }
    .mentor-browse-avatar {
      width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
      background: rgba(227,30,36,.15); color: var(--red, #e31e24);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700; border: 2px solid rgba(227,30,36,.25);
      overflow: hidden;
    }
    .avatar-has-img { background: transparent; border-color: var(--border); }
    .mentor-browse-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .mentor-browse-info { display: flex; flex-direction: column; gap: 3px; flex: 1; }
    .mentor-browse-info strong { font-size: 15px; font-weight: 600; }
    .mentor-online-badge { font-size: 11px; color: #3ddc84; font-weight: 600; }
    .mentor-browse-actions { display:flex; gap:8px; align-items:center; }
    .mentor-msg-btn {
      flex-shrink:0; width:34px; height:34px; padding:0;
      display:flex; align-items:center; justify-content:center;
      border-color:rgba(56,214,199,.3); color:var(--accent-cyan,#38d6c7);
      transition: background .15s, border-color .15s;
    }
    .mentor-msg-btn:hover { background:rgba(56,214,199,.1); border-color:var(--accent-cyan,#38d6c7); }
    .mentor-modal-profile { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border); }
    .domain-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .domain-chip {
      padding: 4px 12px; border-radius: 20px; font-size: 12px; cursor: pointer;
      border: 1px solid var(--border); background: transparent; color: var(--text-muted);
      transition: all .15s;
    }
    .domain-chip:hover, .domain-chip.active {
      background: rgba(227,30,36,.1); color: var(--red, #e31e24);
      border-color: rgba(227,30,36,.3);
    }
    .input-styled {
      padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border);
      background: var(--input-bg, rgba(255,255,255,.06)); color: var(--text);
      font-size: 14px; outline: none; transition: border-color .15s;
    }
    .input-styled:focus { border-color: var(--red, #e31e24); }
    :host-context(.light-theme) .mentor-browse-card { background: #fff; border-color: #e0e0e0; }
    :host-context(.light-theme) .mentor-browse-card:hover { border-color: #e31e24; box-shadow: 0 4px 16px rgba(227,30,36,.1); }
    :host-context(.light-theme) .input-styled { background: #fff; border-color: #d0d0d0; color: #1a1a1a; }

    /* ── Mentor Stats Row ── */
    .mentor-stats-row {
      display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
    }
    .mentor-stat {
      flex: 1; min-width: 100px; display: flex; flex-direction: column; align-items: center;
      padding: 16px 12px; border-radius: 14px; border: 1px solid var(--border);
      background: var(--card-bg, var(--dark2));
      transition: border-color .2s, transform .2s;
    }
    .mentor-stat:hover { border-color: var(--accent-cyan); transform: translateY(-2px); }
    .mentor-stat-value { font-size: 28px; font-weight: 800; font-family: 'Syne', sans-serif; line-height: 1; }
    .mentor-stat-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; text-transform: uppercase; letter-spacing: .6px; }
    .mentor-stat-active { color: #3ddc84; }
    .mentor-stat-done   { color: var(--accent-cyan, #38d6c7); }
    .mentor-stat-total  { color: var(--text); }
    .mentor-stat-sessions { color: #ffbd59; }

    /* ── Mentor Tabs ── */
    .mentor-tabs { display: flex; gap: 6px; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
    .mentor-tab {
      display: flex; align-items: center; gap: 6px; padding: 10px 18px 11px;
      border: none; background: transparent; color: var(--text-muted);
      font-size: 14px; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent;
      margin-bottom: -1px; transition: color .15s, border-color .15s;
    }
    .mentor-tab:hover { color: var(--text); }
    .mentor-tab.active { color: var(--red, #e31e24); border-bottom-color: var(--red, #e31e24); font-weight: 600; }
    .tab-count {
      display: inline-flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border-radius: 50%; font-size: 11px; font-weight: 700;
      background: var(--red, #e31e24); color: #fff;
    }

    /* ── Mentor Cards Grid ── */
    .mentor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .mentor-card {
      border: 1px solid var(--border); border-radius: 16px;
      background: var(--card-bg, var(--dark2)); padding: 20px;
      transition: border-color .2s, box-shadow .2s;
    }
    .mentor-card:hover { border-color: rgba(56,214,199,.4); box-shadow: 0 4px 24px rgba(0,0,0,.2); }
    .mentor-card-completed { opacity: .75; }
    .mentor-card-cancelled { opacity: .6; }

    .mentor-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .mentor-domain-badge {
      display: inline-block; padding: 4px 12px; border-radius: 20px;
      background: rgba(56,214,199,.1); color: var(--accent-cyan, #38d6c7);
      border: 1px solid rgba(56,214,199,.25); font-size: 13px; font-weight: 600;
    }

    /* ── Mentor People ── */
    .mentor-people { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .mentor-person { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 120px; }
    .mentor-avatar {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: rgba(227,30,36,.2); color: var(--red, #e31e24);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; border: 2px solid rgba(227,30,36,.3);
    }
    .mentor-avatar-you {
      background: rgba(56,214,199,.15); color: var(--accent-cyan, #38d6c7);
      border-color: rgba(56,214,199,.3);
    }
    .mentor-person-role { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; color: var(--text-muted); }
    .mentor-person-name { font-size: 13px; font-weight: 600; color: var(--text); }
    .mentor-arrow { font-size: 18px; color: var(--text-muted); flex-shrink: 0; }

    /* ── Session bar ── */
    .mentor-session-bar {
      display: flex; align-items: center; gap: 8px; padding: 8px 0;
      border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted);
    }
    .mentor-sessions-toggle {
      margin-left: auto; background: none; border: none; cursor: pointer;
      font-size: 12px; color: var(--accent-cyan, #38d6c7); padding: 2px 6px;
      border-radius: 6px; transition: background .15s;
    }
    .mentor-sessions-toggle:hover { background: rgba(56,214,199,.1); }

    /* ── Sessions panel ── */
    .mentor-sessions-panel {
      margin-top: 12px; padding: 12px; border-radius: 10px;
      background: var(--input-bg, rgba(255,255,255,.04)); border: 1px solid var(--border);
    }
    .mentor-session-row {
      display: flex; align-items: center; gap: 10px; padding: 6px 0;
      border-bottom: 1px solid var(--border); font-size: 13px;
    }
    .mentor-session-row:last-of-type { border-bottom: none; }
    .mentor-loading { font-size: 13px; color: var(--text-muted); padding: 8px 0; }
    .mentor-no-sessions { font-size: 13px; color: var(--text-muted); padding: 8px 0; text-align: center; }

    /* ── Add session form ── */
    .add-session-form { margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border); }
    .add-session-inputs { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .input-sm {
      padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--input-bg, rgba(255,255,255,.06)); color: var(--text);
      font-size: 13px; outline: none;
    }
    .input-sm:focus { border-color: var(--accent-cyan, #38d6c7); }

    /* ── Card actions ── */
    .mentor-card-actions { display: flex; gap: 8px; margin-top: 12px; }

    /* ── Empty state ── */
    .mentor-empty { text-align: center; padding: 40px 16px; color: var(--text-muted); }
    .mentor-empty-icon { font-size: 40px; margin-bottom: 12px; }

    /* ── Badge helpers ── */
    .badge-active { background: rgba(61,220,132,.15); color: #3ddc84; border: 1px solid rgba(61,220,132,.3); }
    .badge-completed { background: rgba(56,214,199,.12); color: #38d6c7; border: 1px solid rgba(56,214,199,.25); }
    .badge-cancelled { background: rgba(227,30,36,.1); color: #e31e24; border: 1px solid rgba(227,30,36,.2); }
    .badge-planned { background: rgba(255,189,89,.12); color: #ffbd59; border: 1px solid rgba(255,189,89,.25); }
    .badge-done { background: rgba(61,220,132,.12); color: #3ddc84; border: 1px solid rgba(61,220,132,.25); }

    /* ── Light mode overrides ── */
    :host-context(.light-theme) .mentor-stat { background: #f8f9fa; border-color: #e0e0e0; }
    :host-context(.light-theme) .mentor-stat:hover { border-color: #38d6c7; }
    :host-context(.light-theme) .mentor-card { background: #ffffff; border-color: #e0e0e0; }
    :host-context(.light-theme) .mentor-card:hover { border-color: #38d6c7; box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    :host-context(.light-theme) .mentor-sessions-panel { background: #f5f5f5; border-color: #e0e0e0; }
    :host-context(.light-theme) .input-sm { background: #fff; border-color: #d0d0d0; color: #1a1a1a; }
    :host-context(.light-theme) .modal-box { background: #ffffff; }
  `]
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  applications: Application[] = [];
  myApplications: Application[] = [];
  uploadingCvForApp: number | null = null;
  selectedJobId: number | null = null;
  editingJobId: number | null = null;
  jobQuery = '';
  jobTypeFilter = '';
  jobPage = 1;
  readonly pageSize = 6;
  loading = true;
  saving = false;
  error = '';

  applyModal: Job | null = null;
  cvUrl: string | null = null;
  uploadingCv = false;

  cvAnalysis: CvAnalysis | null = null;
  analyzingAppId: number | null = null;
  analyzingApp: Application | null = null;

  jobForm: FormGroup = this.fb.group({
    titre: ['', Validators.required],
    entreprise: ['', Validators.required],
    description: [''],
    type: ['STAGE', Validators.required],
    lieu: ['']
  });


  constructor(
    private jobService: JobService,
    private fb: FormBuilder,
    private notifications: NotificationService,
    private postService: PostService,
    private authService: AuthService,
    private chatbotService: ChatbotService,
    private http: HttpClient,
    private router: Router,
    public lang: LanguageService
  ) {}

  get canManageJobs(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'MENTOR' || role === 'COMPANY' || role === 'EMPLOYE';
  }

  get filteredJobs(): Job[] {
    const query = this.jobQuery.trim().toLowerCase();
    return this.jobs.filter(job => {
      const matchesQuery = !query || [job.titre, job.entreprise, job.description, job.lieu]
        .some(value => (value ?? '').toLowerCase().includes(query));
      const matchesType = !this.jobTypeFilter || job.type === this.jobTypeFilter;
      return matchesQuery && matchesType;
    });
  }

  get jobTotalPages(): number { return Math.max(1, Math.ceil(this.filteredJobs.length / this.pageSize)); }
  get pagedJobs(): Job[] {
    if (this.jobPage > this.jobTotalPages) this.jobPage = this.jobTotalPages;
    const start = (this.jobPage - 1) * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  get totalAccepted(): number {
    return this.myApplications.filter(a => a.statut === 'ACCEPTED').length;
  }

  get pendingCount(): number {
    return this.myApplications.filter(a => a.statut === 'PENDING').length;
  }

  countType(type: string): number { return this.jobs.filter(j => j.type === type).length; }
  pct(type: string): number { return this.jobs.length ? Math.round(this.countType(type) / this.jobs.length * 100) : 0; }

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.jobService.getJobs().subscribe({
      next: (jobs: Job[]) => { this.jobs = jobs; this.loading = false; },
      error: () => this.fail('Unable to load jobs')
    });
    this.jobService.getMyApplications().subscribe({
      next: (apps: Application[]) => { this.myApplications = apps; },
      error: () => undefined
    });
  }

  saveJob(): void {
    if (this.jobForm.invalid) return;
    this.saving = true;
    const payload = this.jobForm.value as JobRequest;
    const isCreate = !this.editingJobId;
    const request = this.editingJobId ? this.jobService.updateJob(this.editingJobId, payload) : this.jobService.createJob(payload);
    request.subscribe({
      next: () => {
        if (isCreate) {
          this.publishFeedAnnouncement(`New job offer posted: ${payload.titre} at ${payload.entreprise}`);
        }
        this.afterSave(isCreate ? 'Job posted' : 'Job updated');
      },
      error: () => this.failSave('Unable to save job')
    });
  }

  editJob(job: Job): void { this.editingJobId = job.id; this.jobForm.patchValue(job); }

  deleteJob(id: number): void {
    if (!this.notifications.confirm('Delete this job offer?')) return;
    this.jobService.deleteJob(id).subscribe({
      next: () => { this.notifications.success('Job deleted'); this.loadAll(); },
      error: () => this.fail('Unable to delete job')
    });
  }

  openApplyModal(job: Job): void { this.applyModal = job; this.cvUrl = null; }
  closeApplyModal(): void { this.applyModal = null; this.cvUrl = null; }

  onCvSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingCv = true;
    this.jobService.uploadCV(file).subscribe({
      next: ({ url }: { url: string }) => { this.cvUrl = url; this.uploadingCv = false; },
      error: () => { this.notifications.error('CV upload failed'); this.uploadingCv = false; }
    });
  }

  submitApply(): void {
    if (!this.applyModal) return;
    this.saving = true;
    this.jobService.apply(this.applyModal.id, this.cvUrl || undefined).subscribe({
      next: () => { this.notifications.success('Application submitted!'); this.saving = false; this.closeApplyModal(); this.loadAll(); },
      error: (err: any) => { const msg = err.error?.message || 'Unable to apply'; this.fail(msg); this.saving = false; }
    });
  }

  loadApplications(jobId: number): void {
    this.selectedJobId = this.selectedJobId === jobId ? null : jobId;
    if (!this.selectedJobId) { this.applications = []; return; }
    this.jobService.getApplications(jobId).subscribe({
      next: (apps: Application[]) => this.applications = apps,
      error: () => this.fail('Unable to load applications')
    });
  }

  setApplicationStatus(app: Application, status: Application['statut']): void {
    this.jobService.updateApplicationStatus(app.id, status).subscribe({
      next: () => { this.notifications.success('Application updated'); this.loadApplications(app.jobId); },
      error: () => this.fail('Unable to update application')
    });
  }

  contactApplicant(userId: number): void {
    this.router.navigate(['/messages'], { queryParams: { userId } });
  }

  analyzeCV(app: Application): void {
    if (!app.cvUrl) return;
    this.analyzingAppId = app.id;
    this.analyzingApp = app;
    this.chatbotService.analyzeCvByUrl(app.cvUrl).subscribe({
      next: (analysis: CvAnalysis) => { this.cvAnalysis = analysis; this.analyzingAppId = null; },
      error: () => { this.notifications.error('CV analysis failed. Make sure the CV is a PDF.'); this.analyzingAppId = null; this.analyzingApp = null; }
    });
  }

  saveMatchScore(): void {
    if (!this.analyzingApp || !this.cvAnalysis) return;
    this.jobService.updateMatchScore(this.analyzingApp.id, this.cvAnalysis.score).subscribe({
      next: () => {
        this.notifications.success(`Match score ${this.cvAnalysis!.score}/100 saved`);
        this.cvAnalysis = null; this.analyzingApp = null;
        if (this.selectedJobId) this.loadApplications(this.selectedJobId);
      },
      error: () => this.notifications.error('Unable to save score')
    });
  }

  scoreGradient(score: number): string {
    if (score >= 75) return 'linear-gradient(135deg, #3ddc84, #2bb56b)';
    if (score >= 50) return 'linear-gradient(135deg, #ffbd59, #e0a020)';
    return 'linear-gradient(135deg, #ff6b6b, #e01a27)';
  }

  scoreGradientColor(score: number): string {
    if (score >= 75) return '#3ddc84';
    if (score >= 50) return '#ff9800';
    return '#e31e24';
  }

  uploadCvForApplication(event: Event, app: Application): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingCvForApp = app.id;
    this.jobService.uploadCV(file).subscribe({
      next: ({ url }: { url: string }) => {
        this.jobService.updateApplicationCvUrl(app.id, url).subscribe({
          next: (updated: Application) => {
            const idx = this.myApplications.findIndex(a => a.id === app.id);
            if (idx !== -1) this.myApplications[idx] = { ...this.myApplications[idx], cvUrl: updated.cvUrl };
            this.uploadingCvForApp = null;
            this.notifications.success('CV uploaded! The recruiter will now be able to evaluate your profile.');
          },
          error: () => { this.uploadingCvForApp = null; this.notifications.error('Failed to attach CV to application.'); }
        });
      },
      error: () => { this.uploadingCvForApp = null; this.notifications.error('CV upload failed. Please try again.'); }
    });
    (event.target as HTMLInputElement).value = '';
  }

  resetJobForm(): void { this.editingJobId = null; this.jobForm.reset({ type: 'STAGE' }); }

  private afterSave(message: string): void {
    this.saving = false; this.error = ''; this.resetJobForm();
    this.notifications.success(message); this.loadAll();
  }

  private publishFeedAnnouncement(content: string): void {
    this.postService.createPost({ contenu: content, autoApprove: true }).subscribe({ error: () => undefined });
  }

  private failSave(message: string): void { this.saving = false; this.fail(message); }
  private fail(message: string): void { this.loading = false; this.error = message; this.notifications.error(message); }
}
