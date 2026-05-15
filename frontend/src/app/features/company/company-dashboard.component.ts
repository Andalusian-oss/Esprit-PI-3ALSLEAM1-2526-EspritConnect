import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Job, Application, User } from '../../core/models/models';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../core/services/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-dashboard',
  template: `
    <div class="page-wide">
      <div class="page-header">
        <h1>Recruiter Dashboard</h1>
        <p>Manage your job offers and review ranked applicants</p>
      </div>

      <!-- Posted jobs -->
      <section class="panel glass-panel">
        <div class="panel-header">
          <h2>My Job Offers</h2>
          <button class="btn btn-primary btn-sm" (click)="showForm = !showForm">
            <span class="icon icon-plus"></span> New offer
          </button>
        </div>

        <!-- Create job form -->
        <div class="form-panel" *ngIf="showForm">
          <form [formGroup]="jobForm" (ngSubmit)="createJob()">
            <div class="grid-2">
              <div class="field">
                <label>Job Title</label>
                <input formControlName="titre" placeholder="e.g. Full Stack Developer" />
              </div>
              <div class="field">
                <label>Type</label>
                <select formControlName="type">
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="STAGE">Stage</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Location</label>
              <input formControlName="lieu" placeholder="Tunis, Remote..." />
            </div>
            <div class="field">
              <label>Description</label>
              <textarea formControlName="description" rows="4" placeholder="Job description..."></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="showForm=false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="jobForm.invalid || saving">
                {{ saving ? 'Saving...' : 'Post Job' }}
              </button>
            </div>
          </form>
        </div>

        <div class="job-grid-premium">
          <div class="job-card-premium" *ngFor="let job of jobs" 
               (click)="selectJob(job)" 
               [class.active]="selectedJob?.id === job.id">
            <div class="job-card-body">
              <div class="job-type-badge" [class]="job.type.toLowerCase()">{{ job.type }}</div>
              <h3>{{ job.titre }}</h3>
              <div class="job-info-meta">
                <span><i class="icon icon-map-pin"></i> {{ job.lieu || 'Not specified' }}</span>
                <span><i class="icon icon-users"></i> {{ job.applicationCount }} Applicant(s)</span>
              </div>
            </div>
            <div class="job-card-footer">
              <span class="view-details">Click to view applicants <i class="icon icon-chevron-right"></i></span>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="jobs.length === 0 && !loading">
          <p>No job offers posted yet.</p>
        </div>
      </section>

      <!-- Ranked applicants for selected job -->
      <section class="panel glass-panel" *ngIf="selectedJob" id="applicants-section">
        <div class="panel-header section-header">
          <div class="header-main">
            <h2>Applicants for: <span>{{ selectedJob.titre }}</span></h2>
            <div class="header-meta">
              <span class="badge badge-outline">{{ applicants.length }} candidates</span>
              <small>Ranked by AI matching score</small>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="applicants.length === 0">
          <p>No applications yet for this offer.</p>
        </div>

        <div class="applicant-grid">
          <div class="applicant-card-premium" *ngFor="let app of applicants; let i = index">
            <div class="applicant-rank" [class.top-rank]="i < 3">
              <span class="rank-num">{{ i + 1 }}</span>
              <span class="rank-label" *ngIf="i < 3">TOP</span>
            </div>
            
            <div class="applicant-main">
              <div class="applicant-avatar">
                {{ getInitials(getUserName(app.applicantUserId)) }}
              </div>
              <div class="applicant-details">
                <div class="applicant-name">{{ getUserName(app.applicantUserId) }}</div>
                <div class="applicant-id">ID: #{{ app.applicantUserId }}</div>
              </div>
            </div>

            <div class="applicant-stats">
              <div class="match-indicator">
                <div class="match-label">Match Score</div>
                <div class="match-value" [style.color]="getScoreColor(app.matchScore || 0)">
                  {{ app.matchScore || 0 }}%
                </div>
                <div class="match-bar-bg">
                  <div class="match-bar-fill" [style.width.%]="app.matchScore || 0" [style.background-color]="getScoreColor(app.matchScore || 0)"></div>
                </div>
              </div>
              <div class="status-indicator">
                <span class="status-dot" [class]="app.statut.toLowerCase()"></span>
                {{ app.statut }}
              </div>
            </div>

            <div class="applicant-actions-premium">
              <button class="action-btn accept" (click)="updateStatus(app, 'ACCEPTED')" *ngIf="app.statut !== 'ACCEPTED'" title="Accept">
                <i class="icon icon-check"></i>
              </button>
              <button class="action-btn reject" (click)="updateStatus(app, 'REJECTED')" *ngIf="app.statut !== 'REJECTED'" title="Reject">
                <i class="icon icon-x"></i>
              </button>
              <button class="action-btn message" (click)="messageApplicant(app.applicantUserId)" title="Message">
                <i class="icon icon-message-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .glass-panel {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      margin-bottom: 30px;
      overflow: hidden;
    }
    
    .job-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      padding: 24px;
    }
    
    .job-card-premium {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }
    
    .job-card-premium:hover {
      background: rgba(255, 255, 255, 0.05);
      transform: translateY(-4px);
      border-color: var(--red);
    }
    
    .job-card-premium.active {
      background: rgba(227, 30, 36, 0.05);
      border-color: var(--red);
      box-shadow: 0 8px 24px rgba(227, 30, 36, 0.15);
    }
    
    .job-card-body {
      padding: 20px;
      flex-grow: 1;
    }
    
    .job-type-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .job-type-badge.cdi { color: #4caf50; background: rgba(76, 175, 80, 0.1); }
    .job-type-badge.stage { color: #2196f3; background: rgba(33, 150, 243, 0.1); }
    
    .job-card-body h3 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 12px 0;
      color: #fff;
    }
    
    .job-info-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
      color: #aaa;
    }
    
    .job-card-footer {
      padding: 12px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 12px;
      color: var(--red);
      font-weight: 600;
    }
    
    /* Applicant styles */
    .section-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .header-main h2 {
      font-size: 20px;
      margin: 0;
    }
    
    .header-main h2 span { color: var(--red); }
    
    .applicant-grid {
      display: flex;
      flex-direction: column;
    }
    
    .applicant-card-premium {
      display: grid;
      grid-template-columns: 80px 1.5fr 1fr 180px;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      transition: background 0.2s;
    }
    
    .applicant-card-premium:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    
    .applicant-rank {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .rank-num { font-size: 24px; font-weight: 800; color: #444; }
    .top-rank .rank-num { color: var(--red); }
    .rank-label { font-size: 9px; font-weight: 900; color: var(--red); }
    
    .applicant-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin-right: 16px;
    }
    
    .applicant-main { display: flex; align-items: center; }
    .applicant-name { font-weight: 600; font-size: 16px; }
    .applicant-id { font-size: 12px; color: #777; }
    
    .match-indicator { width: 140px; }
    .match-label { font-size: 10px; color: #777; text-transform: uppercase; margin-bottom: 4px; }
    .match-value { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .match-bar-bg { height: 4px; background: #222; border-radius: 2px; }
    .match-bar-fill { height: 100%; border-radius: 2px; }
    
    .status-indicator { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; margin-top: 10px; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #555; }
    .status-dot.accepted { background: #4caf50; }
    .status-dot.rejected { background: #f44336; }
    
    .applicant-actions-premium { display: flex; gap: 10px; justify-content: flex-end; }
    .action-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .action-btn:hover { background: var(--red); border-color: var(--red); }
  `]
})
export class CompanyDashboardComponent implements OnInit {
  jobs: Job[] = [];
  applicants: Application[] = [];
  selectedJob: Job | null = null;
  loading = false;
  saving = false;
  showForm = false;
  jobForm: FormGroup;
  userCache: Map<number, string> = new Map();

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private notifications: NotificationService,
    private fb: FormBuilder,
    private router: Router
  ) {
    const user = authService.getCurrentUser();
    this.jobForm = this.fb.group({
      titre:       ['', Validators.required],
      entreprise:  [user?.prenom ?? '', Validators.required],
      type:        ['CDI', Validators.required],
      lieu:        [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  getUserName(id: number): string {
    return this.userCache.get(Number(id)) || `User #${id}`;
  }

  getInitials(name: string): string {
    if (name.startsWith('User #')) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] || '') + (parts[1][0] || '');
    return name[0] || '?';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ffeb3b';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  }

  loadJobs(): void {
    this.loading = true;
    this.http.get<Job[]>(`${environment.apiUrl}/jobs`).subscribe({
      next: all => {
        const myId = this.authService.getCurrentUser()?.id;
        this.jobs = all.filter(j => j.posterUserId === myId);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  createJob(): void {
    if (this.jobForm.invalid) return;
    this.saving = true;
    const user = this.authService.getCurrentUser();
    const payload = { ...this.jobForm.value, entreprise: user?.prenom ?? 'Company' };
    this.http.post<Job>(`${environment.apiUrl}/jobs`, payload).subscribe({
      next: job => {
        this.jobs.unshift(job);
        this.showForm = false;
        this.saving = false;
        this.notifications.success('Job offer posted successfully');
      },
      error: () => {
        this.notifications.error('Failed to post job');
        this.saving = false;
      }
    });
  }

  selectJob(job: Job): void {
    this.selectedJob = job;
    this.applicants = []; // Clear current list while loading
    
    // Fetch applicants
    this.http.get<Application[]>(`${environment.apiUrl}/jobs/${job.id}/ranked-applicants`).subscribe({
      next: apps => { 
        this.applicants = apps; 
        this.resolveApplicantNames(apps);
        // Scroll to applicants
        setTimeout(() => {
          document.getElementById('applicants-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      error: () => {
        this.http.get<Application[]>(`${environment.apiUrl}/jobs/${job.id}/applications`).subscribe({
          next: apps => { 
            this.applicants = apps; 
            this.resolveApplicantNames(apps);
          }
        });
      }
    });
  }

  private resolveApplicantNames(apps: Application[]): void {
    const ids = Array.from(new Set(apps.map(a => a.applicantUserId)));
    if (ids.length === 0) return;
    
    this.authService.getUsersByIds(ids).subscribe({
      next: users => {
        users.forEach(u => this.userCache.set(Number(u.id), `${u.prenom} ${u.nom}`));
      }
    });
  }

  messageApplicant(userId: number): void {
    this.router.navigate(['/messages'], { queryParams: { userId } });
  }

  updateStatus(app: Application, statut: 'ACCEPTED' | 'REJECTED'): void {
    this.http.patch(`${environment.apiUrl}/jobs/applications/${app.id}/status`, { statut }).subscribe({
      next: () => {
        app.statut = statut;
        this.notifications.success(`Application ${statut.toLowerCase()}`);
      },
      error: () => this.notifications.error('Failed to update status')
    });
  }
}
