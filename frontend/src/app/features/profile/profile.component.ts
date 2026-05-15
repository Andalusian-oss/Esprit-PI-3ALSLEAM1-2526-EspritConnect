import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/models';
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
          {{ editing ? 'Cancel' : 'Edit profile' }}
        </button>
      </div>

      <!-- ── Edit form ── -->
      <div class="card" *ngIf="editing" style="margin-top:16px">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:20px">
          Edit Profile
        </div>
        <form [formGroup]="editForm" (ngSubmit)="saveProfile()">
          <div class="grid-2">
            <div class="field">
              <label>First Name</label>
              <input formControlName="prenom" placeholder="First name" />
            </div>
            <div class="field">
              <label>Last Name</label>
              <input formControlName="nom" placeholder="Last name" />
            </div>
          </div>
          <div class="field">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="you@esprit.tn" />
            <div class="field-hint" *ngIf="editForm.get('email')?.errors?.['email']">
              Invalid email format
            </div>
          </div>
          <div class="grid-2" *ngIf="user?.role === 'STUDENT' || user?.role === 'ALUMNI'">
            <div class="field">
              <label>Spécialité</label>
              <select formControlName="specialite">
                <option value="">-- None --</option>
                <option>Informatique</option>
                <option>Finance</option>
                <option>Télécom</option>
                <option>Génie Civil</option>
                <option>Marketing</option>
              </select>
            </div>
            <div class="field">
              <label>Parcours</label>
              <input formControlName="parcours" placeholder="e.g. GL, DS, BI" />
            </div>
          </div>
          <div class="field" *ngIf="user?.role === 'ENSEIGNANT'">
            <label>Département / Spécialité</label>
            <input formControlName="specialite" placeholder="e.g. Informatique" />
          </div>
          <div class="field" *ngIf="user?.role === 'STUDENT' || user?.role === 'ALUMNI'">
            <label>Promo</label>
            <input formControlName="promo" placeholder="e.g. 4DS1, 3GL2" />
          </div>
          <div class="field">
            <label>Avatar URL</label>
            <input formControlName="avatarUrl" placeholder="https://..." />
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" (click)="toggleEdit()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="editForm.invalid || saving">
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
          <div class="error-msg" *ngIf="saveError">{{ saveError }}</div>
        </form>
      </div>

      <!-- ── Account details (read-only) ── -->
      <div class="card" style="margin-top:16px" *ngIf="!editing">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:16px">
          Account Details
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <div class="detail-label">First Name</div>
            <div class="detail-value">{{ user?.prenom }}</div>
          </div>
          <div>
            <div class="detail-label">Last Name</div>
            <div class="detail-value">{{ user?.nom }}</div>
          </div>
          <div>
            <div class="detail-label">Email</div>
            <div class="detail-value">{{ user?.email }}</div>
          </div>
          <div>
            <div class="detail-label">Member Since</div>
            <div class="detail-value">{{ user?.createdAt | date:'mediumDate' }}</div>
          </div>
          <div *ngIf="user?.espritId">
            <div class="detail-label">Esprit ID</div>
            <div class="detail-value">{{ user?.espritId }}</div>
          </div>
          <div *ngIf="user?.cin">
            <div class="detail-label">CIN</div>
            <div class="detail-value">{{ user?.cin }}</div>
          </div>
          <div *ngIf="user?.specialite">
            <div class="detail-label">Spécialité</div>
            <div class="detail-value">{{ user?.specialite }}</div>
          </div>
          <div *ngIf="user?.parcours">
            <div class="detail-label">Parcours</div>
            <div class="detail-value">{{ user?.parcours }}</div>
          </div>
        </div>
      </div>

      <!-- ── Online status ── -->
      <div class="card" style="margin-top:16px;display:flex;align-items:center;gap:12px">
        <span class="online-dot" [class.online]="user?.online" style="width:10px;height:10px;border-radius:50%;background:var(--text-muted);flex-shrink:0"></span>
        <span style="font-size:14px;color:var(--text-muted)">
          {{ user?.online ? 'Currently online' : 'Offline' }}
          <span *ngIf="user?.lastLoginAt"> · Last seen {{ user?.lastLoginAt | date:'medium' }}</span>
        </span>
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
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editing = false;
  saving = false;
  saveError = '';
  editForm!: FormGroup;

  get initials(): string {
    if (!this.user) return '?';
    const p = this.user.prenom?.[0] ?? '';
    const n = this.user.nom?.[0] ?? '';
    return (p + n).toUpperCase() || '?';
  }

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private http: HttpClient,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.buildForm();
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
        // Refresh the stored user
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
}
