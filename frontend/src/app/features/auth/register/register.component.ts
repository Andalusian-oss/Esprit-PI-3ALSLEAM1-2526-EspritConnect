import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/models';

interface RoleOption {
  value: UserRole;
  label: string;
  icon: string;
  description: string;
  needsEspritId: boolean;
}

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-wrapper">
      <div class="auth-card auth-card-wide">
        <div class="auth-logo">
          <div class="logo-mark">Esprit<span>Connect</span></div>
          <div class="logo-sub">Create your account</div>
        </div>

        <!-- Step indicator -->
        <div class="steps-indicator">
          <div class="step-dot" [class.active]="step >= 1" [class.done]="step > 1">1</div>
          <div class="step-line" [class.active]="step > 1"></div>
          <div class="step-dot" [class.active]="step >= 2">2</div>
        </div>

        <!-- ── STEP 1 : Role selection ── -->
        <div *ngIf="step === 1">
          <h2 class="auth-title">Who are you?</h2>
          <p class="auth-subtitle">Select your role at Esprit to get started</p>
          <div class="role-grid">
            <button
              *ngFor="let r of roleOptions"
              type="button"
              class="role-card"
              [class.selected]="selectedRole === r.value"
              (click)="selectRole(r.value)">
              <span class="role-icon icon {{ r.icon }}"></span>
              <strong>{{ r.label }}</strong>
              <small>{{ r.description }}</small>
            </button>
          </div>
          <button class="btn btn-primary" style="margin-top:24px;width:100%"
            [disabled]="!selectedRole" (click)="goStep2()">
            Continue →
          </button>
          <div class="auth-link">Already have an account? <a routerLink="/auth/login">Sign in</a></div>
        </div>

        <!-- ── STEP 2 : Personal details ── -->
        <div *ngIf="step === 2">
          <h2 class="auth-title">Your details</h2>
          <p class="auth-subtitle">
            Registering as
            <span class="role-badge role-badge-{{ selectedRole?.toLowerCase() }}">{{ roleLabelFor(selectedRole) }}</span>
          </p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- For COMPANY: single company name field -->
            <ng-container *ngIf="selectedRole === 'COMPANY'">
              <div class="field">
                <label>Company Name</label>
                <input formControlName="prenom" placeholder="e.g. Acme Corp SA" />
                <small class="field-hint">This name will appear on all your job offers</small>
              </div>
              <div class="info-banner" style="margin-bottom:12px">
                <span class="icon icon-shield"></span>
                Your account will be <strong>reviewed by an admin</strong> before you can log in.
              </div>
            </ng-container>

            <!-- For all other roles: first name + last name -->
            <div class="grid-2" *ngIf="selectedRole !== 'COMPANY'">
              <div class="field">
                <label>First Name</label>
                <input formControlName="prenom" placeholder="Amine" />
              </div>
              <div class="field">
                <label>Last Name</label>
                <input formControlName="nom" placeholder="Ben Salem" />
              </div>
            </div>

            <div class="field">
              <label>Email</label>
              <input formControlName="email" type="email" placeholder="you@esprit.tn" />
            </div>

            <div class="field">
              <label>Password</label>
              <input formControlName="password" type="password" placeholder="min. 6 characters" />
            </div>

            <!-- Esprit ID + CIN — required for all except COMPANY -->
            <ng-container *ngIf="needsEspritId">
              <div class="grid-2">
                <div class="field">
                  <label>Esprit ID</label>
                  <input formControlName="espritId" placeholder="e.g. ESP-2024-00123" />
                  <small class="field-hint">Printed on your student/staff card</small>
                </div>
                <div class="field">
                  <label>CIN</label>
                  <input formControlName="cin" placeholder="e.g. 12345678" />
                  <small class="field-hint">National ID card number</small>
                </div>
              </div>
            </ng-container>

            <!-- Student/Alumni fields -->
            <ng-container *ngIf="selectedRole === 'STUDENT' || selectedRole === 'ALUMNI'">
              <div class="grid-2">
                <div class="field">
                  <label>Specialité</label>
                  <select formControlName="specialite">
                    <option value="">-- Select --</option>
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
              <div class="field">
                <label>Promo</label>
                <input formControlName="promo" placeholder="e.g. 4DS1, 3GL2" />
              </div>
            </ng-container>

            <!-- Enseignant fields -->
            <ng-container *ngIf="selectedRole === 'ENSEIGNANT'">
              <div class="field">
                <label>Département / Spécialité</label>
                <input formControlName="specialite" placeholder="e.g. Informatique" />
              </div>
            </ng-container>

            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="step = 1">← Back</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
                {{ loading ? 'Creating...' : 'Create account' }}
              </button>
            </div>

            <div class="error-msg" *ngIf="error">{{ error }}</div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  step = 1;
  selectedRole: UserRole | null = null;
  form: FormGroup;
  error = '';
  loading = false;

  roleOptions: RoleOption[] = [
    { value: 'STUDENT',    label: 'Étudiant',    icon: 'icon-user',     description: 'Étudiant actif à Esprit',         needsEspritId: true },
    { value: 'ENSEIGNANT', label: 'Enseignant',  icon: 'icon-book',     description: 'Membre du corps enseignant',       needsEspritId: true },
    { value: 'ALUMNI',     label: 'Alumni',      icon: 'icon-award',    description: 'Ancien étudiant d\'Esprit',        needsEspritId: true },
    { value: 'EMPLOYE',    label: 'Employé',     icon: 'icon-briefcase',description: 'Personnel administratif/technique', needsEspritId: true },
    { value: 'COMPANY',    label: 'Entreprise',  icon: 'icon-building', description: 'Société souhaitant recruter',      needsEspritId: false },
  ];

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      prenom:    ['', Validators.required],
      nom:       ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      espritId:  [''],
      cin:       [''],
      specialite:[''],
      parcours:  [''],
      promo:     ['']
    });
  }

  get needsEspritId(): boolean {
    return !!this.selectedRole && this.selectedRole !== 'COMPANY';
  }

  selectRole(role: UserRole): void {
    this.selectedRole = role;
  }

  roleLabelFor(role: UserRole | null): string {
    return this.roleOptions.find(r => r.value === role)?.label ?? '';
  }

  goStep2(): void {
    if (!this.selectedRole) return;
    // Apply validators based on role
    if (this.needsEspritId) {
      this.form.get('espritId')?.setValidators([Validators.required]);
      this.form.get('cin')?.setValidators([Validators.required]);
    } else {
      this.form.get('espritId')?.clearValidators();
      this.form.get('cin')?.clearValidators();
    }
    this.form.get('espritId')?.updateValueAndValidity();
    this.form.get('cin')?.updateValueAndValidity();

    // COMPANY only fills prenom (company name) — nom is hidden, so remove its required validator
    if (this.selectedRole === 'COMPANY') {
      this.form.get('nom')?.clearValidators();
      this.form.get('nom')?.updateValueAndValidity();
    } else {
      this.form.get('nom')?.setValidators([Validators.required]);
      this.form.get('nom')?.updateValueAndValidity();
    }

    this.step = 2;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedRole) return;
    this.loading = true;
    this.error = '';
    const val = this.form.value;
    this.authService.register({
      email:      val.email,
      password:   val.password,
      prenom:     val.prenom,
      // For COMPANY: nom field is hidden — use prenom (company name) as fallback
      nom:        val.nom || val.prenom,
      role:       this.selectedRole,
      promo:      val.promo || undefined,
      espritId:   val.espritId || undefined,
      cin:        val.cin || undefined,
      specialite: val.specialite || undefined,
      parcours:   val.parcours || undefined
    }).subscribe({
      next: (res) => {
        if (res.user.approved === false) {
          // Company pending approval — show message on login page
          this.router.navigate(['/auth/login'], { queryParams: { pending: 'true' } });
        } else {
          this.router.navigate(['/feed']);
        }
      },
      error: err => {
        this.error = err.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}

