import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="page-wide">
      <div class="page-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and management for EspritConnect</p>
      </div>

      <div *ngIf="!isAdmin" class="empty">
        <p>Access reserved for administrators.</p>
      </div>

      <ng-container *ngIf="isAdmin">

        <!-- Quick links -->
        <div class="admin-grid">
          <a class="admin-tile" routerLink="/feed">
            <span class="icon icon-home"></span>
            <strong>Feed</strong>
            <small>Moderate posts, comments and engagement.</small>
          </a>
          <a class="admin-tile" routerLink="/events">
            <span class="icon icon-calendar"></span>
            <strong>Events & Clubs</strong>
            <small>Manage events, clubs and registrations.</small>
          </a>
          <a class="admin-tile" routerLink="/jobs">
            <span class="icon icon-briefcase"></span>
            <strong>Jobs & Mentoring</strong>
            <small>Track offers, applications and mentoring workflows.</small>
          </a>
        </div>

        <!-- Company approvals -->
        <section class="panel" style="margin-top:32px">
          <div class="panel-header">
            <h2>Pending Company Approvals</h2>
            <span class="badge badge-danger" *ngIf="pending.length > 0">{{ pending.length }}</span>
          </div>

          <div class="empty" *ngIf="pending.length === 0 && !loadingPending">
            <p>No pending company registrations.</p>
          </div>

          <div class="applicant-list">
            <div class="applicant-card" *ngFor="let c of pending">
              <div class="applicant-info">
                <strong>{{ c.prenom }} {{ c.nom }}</strong>
                <small>{{ c.email }}</small>
              </div>
              <div class="applicant-actions">
                <button class="btn btn-sm btn-success" (click)="approve(c)">Approve</button>
                <button class="btn btn-sm btn-danger"  (click)="reject(c)">Reject</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Esprit Reference management -->
        <section class="panel" style="margin-top:32px">
          <div class="panel-header">
            <h2>Esprit Reference Table</h2>
            <small>Add / remove espritId ↔ CIN ↔ Role mappings used during registration</small>
          </div>
          <div class="info-banner" style="margin:8px 0 16px">
            <span class="icon icon-shield"></span>
            Only users whose espritId + CIN matches an entry here can register (except companies).
          </div>

          <!-- Add Entry Form -->
          <div class="add-reference-form glass" style="padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 1px solid var(--border)">
             <h3 style="margin-bottom:16px; font-size:16px">Add New Pre-authorized User</h3>
             <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; align-items: end;">
                <div class="form-group" style="margin:0">
                  <label>Esprit ID</label>
                  <input type="text" [(ngModel)]="newRef.espritId" placeholder="ESP-2024-..." class="input-sm">
                </div>
                <div class="form-group" style="margin:0">
                  <label>CIN</label>
                  <input type="text" [(ngModel)]="newRef.cin" placeholder="8 digits" class="input-sm">
                </div>
                <div class="form-group" style="margin:0">
                  <label>Role</label>
                  <select [(ngModel)]="newRef.expectedRole" class="input-sm">
                    <option value="STUDENT">STUDENT</option>
                    <option value="ENSEIGNANT">ENSEIGNANT</option>
                    <option value="ALUMNI">ALUMNI</option>
                    <option value="EMPLOYE">EMPLOYE</option>
                  </select>
                </div>
                <div class="form-group" style="margin:0">
                  <label>Prenom</label>
                  <input type="text" [(ngModel)]="newRef.prenom" class="input-sm">
                </div>
                <div class="form-group" style="margin:0">
                  <label>Nom</label>
                  <input type="text" [(ngModel)]="newRef.nom" class="input-sm">
                </div>
                <button class="btn btn-primary" (click)="addReference()" [disabled]="!newRef.espritId || !newRef.cin">
                  Add Entry
                </button>
             </div>
          </div>

          <!-- Reference List -->
          <div class="applicant-list" *ngIf="references.length > 0">
             <div class="applicant-card" *ngFor="let r of references">
               <div class="applicant-info">
                 <strong>{{ r.prenom }} {{ r.nom }}</strong>
                 <small>{{ r.espritId }} | CIN: {{ r.cin }} | <span class="badge badge-info">{{ r.expectedRole }}</span></small>
               </div>
               <div class="applicant-actions">
                 <button class="btn btn-sm btn-outline-danger" (click)="deleteReference(r.id!)">
                   <span class="icon icon-trash"></span>
                 </button>
               </div>
             </div>
          </div>
          <div *ngIf="references.length === 0" class="empty">
             <p>No reference data loaded.</p>
          </div>
        </section>

      </ng-container>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  pending: User[] = [];
  loadingPending = false;
  
  references: any[] = [];
  newRef: any = {
    espritId: '',
    cin: '',
    expectedRole: 'STUDENT',
    prenom: '',
    nom: ''
  };

  get isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'ADMIN';
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.isAdmin) {
      this.loadPending();
      this.loadReferences();
    }
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
        this.notifications.success('Reference entry added successfully');
      },
      error: () => this.notifications.error('Failed to add reference entry')
    });
  }

  deleteReference(id: number): void {
    if (!confirm('Are you sure you want to delete this reference entry?')) return;
    this.http.delete(`${environment.apiUrl}/auth/reference/${id}`).subscribe({
      next: () => {
        this.references = this.references.filter(r => r.id !== id);
        this.notifications.success('Reference entry removed');
      },
      error: () => this.notifications.error('Failed to delete reference entry')
    });
  }

  approve(user: User): void {
    this.http.patch<User>(`${environment.apiUrl}/auth/users/${user.id}/approve`, {}).subscribe({
      next: () => {
        this.pending = this.pending.filter(u => u.id !== user.id);
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
}

