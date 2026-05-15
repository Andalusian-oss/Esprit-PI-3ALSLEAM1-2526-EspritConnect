import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Application, Job, JobRequest, Mentoring } from '../../core/models/models';
import { JobService } from '../../core/services/job.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-jobs',
  template: `
    <div class="page-wide">
      <div class="page-header">
        <h1>Jobs & Mentoring</h1>
        <p>Manage internships, job offers, applications and mentoring</p>
      </div>

      <div class="crud-grid">
        <section class="panel">
          <ng-container *ngIf="canManageJobs; else jobReadonly">
          <h2>{{ editingJobId ? 'Update offer' : 'Create offer' }}</h2>
          <form [formGroup]="jobForm" (ngSubmit)="saveJob()" class="stack">
            <div class="grid-2">
              <input formControlName="titre" placeholder="Title" />
              <input formControlName="entreprise" placeholder="Company" />
            </div>
            <textarea formControlName="description" placeholder="Description"></textarea>
            <div class="grid-2">
              <select formControlName="type">
                <option value="STAGE">Internship</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
              </select>
              <input formControlName="lieu" placeholder="Location" />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" type="submit" [disabled]="jobForm.invalid || saving">
                <span class="icon" [ngClass]="editingJobId ? 'icon-save' : 'icon-plus'"></span>
                {{ editingJobId ? 'Update' : 'Create' }}
              </button>
              <button class="btn btn-ghost" type="button" *ngIf="editingJobId" (click)="resetJobForm()">Cancel</button>
            </div>
          </form>
          </ng-container>
          <ng-template #jobReadonly>
            <h2>Offers</h2>
            <p class="muted">Students can browse and apply. Mentors and admins can create offers.</p>
          </ng-template>
        </section>

        <section class="panel">
          <h2>Request mentoring</h2>
          <form [formGroup]="mentoringForm" (ngSubmit)="requestMentoring()" class="stack">
            <input formControlName="mentorUserId" type="number" placeholder="Mentor user ID" />
            <input formControlName="domaine" placeholder="Domain" />
            <button class="btn btn-primary" type="submit" [disabled]="mentoringForm.invalid || saving"><span class="icon icon-user-plus"></span>Request</button>
          </form>
        </section>
      </div>

      <div *ngIf="error" class="error-msg">{{ error }}</div>
      <div *ngIf="loading" class="empty"><p>Loading...</p></div>

      <div class="section-title">Offers</div>
      <div class="toolbar">
        <input [(ngModel)]="jobQuery" placeholder="Search offers..." />
        <select [(ngModel)]="jobTypeFilter">
          <option value="">All types</option>
          <option value="STAGE">Internship</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
        </select>
      </div>
      <div *ngIf="!loading && jobs.length === 0" class="empty"><p>No listings yet</p></div>
      <div class="list-grid">
        <article class="card" *ngFor="let job of pagedJobs">
          <div class="item-head">
            <div>
              <h3>{{ job.titre }}</h3>
              <p>{{ job.entreprise }}</p>
            </div>
            <span class="badge" [ngClass]="{'badge-green': job.type==='STAGE','badge-blue': job.type==='CDI','badge-gray': job.type==='CDD'}">{{ job.type }}</span>
          </div>
          <p class="muted" *ngIf="job.description">{{ job.description }}</p>
          <div class="meta-row">
            <span *ngIf="job.lieu">Location: {{ job.lieu }}</span>
            <span>{{ job.applicationCount }} applicants</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-ghost" (click)="apply(job.id)"><span class="icon icon-send"></span>Apply</button>
            <button class="btn btn-ghost" *ngIf="canManageJobs" (click)="loadApplications(job.id)"><span class="icon icon-users"></span>Applications</button>
            <button class="btn btn-ghost" *ngIf="canManageJobs" (click)="editJob(job)"><span class="icon icon-edit"></span>Edit</button>
            <button class="btn btn-danger" *ngIf="canManageJobs" (click)="deleteJob(job.id)"><span class="icon icon-trash"></span>Delete</button>
          </div>
          <div class="sub-list" *ngIf="selectedJobId === job.id">
            <div class="sub-row" *ngFor="let app of applications">
              <span>#{{ app.applicantUserId }} - {{ app.statut }}</span>
              <div>
                <button class="btn btn-ghost" (click)="setApplicationStatus(app, 'ACCEPTED')"><span class="icon icon-check"></span>Accept</button>
                <button class="btn btn-ghost" (click)="setApplicationStatus(app, 'REJECTED')"><span class="icon icon-x"></span>Reject</button>
              </div>
            </div>
          </div>
        </article>
      </div>
      <div class="pagination" *ngIf="filteredJobs.length > pageSize">
        <button class="btn btn-ghost" (click)="jobPage = jobPage - 1" [disabled]="jobPage === 1">Previous</button>
        <span>{{ jobPage }} / {{ jobTotalPages }}</span>
        <button class="btn btn-ghost" (click)="jobPage = jobPage + 1" [disabled]="jobPage === jobTotalPages">Next</button>
      </div>

      <div class="section-title">Mentoring</div>
      <div class="list-grid">
        <article class="card" *ngFor="let item of mentorings">
          <div class="item-head">
            <div>
              <h3>{{ item.domaine }}</h3>
              <p>Mentor #{{ item.mentorUserId }} / Mentee #{{ item.mentoreUserId }}</p>
            </div>
            <span class="badge badge-gray">{{ item.statut }}</span>
          </div>
          <div class="meta-row"><span>{{ item.sessionCount }} sessions</span></div>
          <div class="card-actions">
            <button class="btn btn-ghost" (click)="completeMentoring(item.id)"><span class="icon icon-check"></span>Complete</button>
          </div>
        </article>
      </div>
    </div>
  `
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  applications: Application[] = [];
  mentorings: Mentoring[] = [];
  selectedJobId: number | null = null;
  editingJobId: number | null = null;
  jobQuery = '';
  jobTypeFilter = '';
  jobPage = 1;
  readonly pageSize = 6;
  loading = true;
  saving = false;
  error = '';

  jobForm: FormGroup = this.fb.group({
    titre: ['', Validators.required],
    entreprise: ['', Validators.required],
    description: [''],
    type: ['STAGE', Validators.required],
    lieu: ['']
  });

  mentoringForm: FormGroup = this.fb.group({
    mentorUserId: [null, Validators.required],
    domaine: ['', Validators.required]
  });

  constructor(
    private jobService: JobService,
    private fb: FormBuilder,
    private notifications: NotificationService,
    private authService: AuthService
  ) {}

  get canManageJobs(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'MENTOR';
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

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.jobService.getJobs().subscribe({ next: jobs => { this.jobs = jobs; this.loading = false; }, error: () => this.fail('Unable to load jobs') });
    this.jobService.getMentoringAsMentore().subscribe({ next: items => this.mentorings = items, error: () => undefined });
  }

  saveJob(): void {
    if (this.jobForm.invalid) return;
    this.saving = true;
    const payload = this.jobForm.value as JobRequest;
    const request = this.editingJobId ? this.jobService.updateJob(this.editingJobId, payload) : this.jobService.createJob(payload);
    request.subscribe({ next: () => this.afterSave('Job saved'), error: () => this.failSave('Unable to save job') });
  }

  editJob(job: Job): void {
    this.editingJobId = job.id;
    this.jobForm.patchValue(job);
  }

  deleteJob(id: number): void {
    if (!this.notifications.confirm('Delete this job offer?')) return;
    this.jobService.deleteJob(id).subscribe({ next: () => { this.notifications.success('Job deleted'); this.loadAll(); }, error: () => this.fail('Unable to delete job') });
  }

  apply(id: number): void {
    this.jobService.apply(id).subscribe({
      next: () => {
        this.notifications.success('Application sent');
        this.loadAll();
      },
      error: (err) => {
        const msg = err.error?.message || 'Unable to apply';
        this.fail(msg);
      }
    });
  }

  loadApplications(jobId: number): void {
    this.selectedJobId = this.selectedJobId === jobId ? null : jobId;
    if (!this.selectedJobId) return;
    this.jobService.getApplications(jobId).subscribe({ next: apps => this.applications = apps, error: () => this.fail('Unable to load applications') });
  }

  setApplicationStatus(app: Application, status: Application['statut']): void {
    this.jobService.updateApplicationStatus(app.id, status).subscribe({ next: () => { this.notifications.success('Application updated'); this.loadApplications(app.jobId); }, error: () => this.fail('Unable to update application') });
  }

  requestMentoring(): void {
    if (this.mentoringForm.invalid) return;
    this.saving = true;
    const mentorUserId = Number(this.mentoringForm.value.mentorUserId);
    const domaine = String(this.mentoringForm.value.domaine);
    this.jobService.requestMentoring(mentorUserId, domaine).subscribe({ next: () => this.afterSave('Mentoring requested'), error: () => this.failSave('Unable to request mentoring') });
  }

  completeMentoring(id: number): void {
    this.jobService.completeMentoring(id).subscribe({ next: () => { this.notifications.success('Mentoring completed'); this.loadAll(); }, error: () => this.fail('Unable to complete mentoring') });
  }

  resetJobForm(): void {
    this.editingJobId = null;
    this.jobForm.reset({ type: 'STAGE' });
  }

  private afterSave(message: string): void {
    this.saving = false;
    this.error = '';
    this.resetJobForm();
    this.mentoringForm.reset();
    this.notifications.success(message);
    this.loadAll();
  }

  private failSave(message: string): void {
    this.saving = false;
    this.fail(message);
  }

  private fail(message: string): void {
    this.loading = false;
    this.error = message;
    this.notifications.error(message);
  }
}
