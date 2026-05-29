import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
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
          <div class="logo-sub">{{ lang.t('auth.register.createAccount') }}</div>
        </div>

        <!-- Step indicator -->
        <div class="steps-indicator">
          <div class="step-dot" [class.active]="step >= 1" [class.done]="step > 1">1</div>
          <div class="step-line" [class.active]="step > 1"></div>
          <div class="step-dot" [class.active]="step >= 2">2</div>
        </div>

        <!-- ── STEP 1 : Role selection ── -->
        <div *ngIf="step === 1">
          <h2 class="auth-title">{{ lang.t('auth.register.whoAreYou') }}</h2>
          <p class="auth-subtitle">{{ lang.t('auth.register.roleDesc') }}</p>
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
            {{ lang.t('auth.register.continue') }}
          </button>
          <div class="auth-link">{{ lang.t('auth.register.hasAccount') }} <a routerLink="/auth/login">{{ lang.t('auth.register.signIn') }}</a></div>
        </div>

        <!-- ── STEP 2 : Personal details ── -->
        <div *ngIf="step === 2">
          <h2 class="auth-title">{{ lang.t('auth.register.yourDetails') }}</h2>
          <p class="auth-subtitle">
            {{ lang.t('auth.register.registeringAs') }}
            <span class="role-badge role-badge-{{ selectedRole?.toLowerCase() }}">{{ roleLabelFor(selectedRole) }}</span>
          </p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- For COMPANY: single company name field -->
            <ng-container *ngIf="selectedRole === 'COMPANY'">
              <div class="field">
                <label>{{ lang.t('auth.register.companyName') }}</label>
                <input formControlName="prenom" placeholder="e.g. Acme Corp SA" />
                <small class="field-hint">{{ lang.t('auth.register.companyHint') }}</small>
              </div>
              <div class="info-banner" style="margin-bottom:12px">
                <span class="icon icon-shield"></span>
                {{ lang.t('auth.register.pendingMsg') }}
              </div>
            </ng-container>

            <!-- For all other roles: first name + last name -->
            <div class="grid-2" *ngIf="selectedRole !== 'COMPANY'">
              <div class="field">
                <label>{{ lang.t('auth.register.firstName') }}</label>
                <input formControlName="prenom" placeholder="Amine" />
              </div>
              <div class="field">
                <label>{{ lang.t('auth.register.lastName') }}</label>
                <input formControlName="nom" placeholder="Ben Salem" />
              </div>
            </div>

            <div class="field">
              <label>{{ lang.t('auth.email') }}</label>
              <input formControlName="email" type="email" placeholder="you@esprit.tn" />
            </div>

            <div class="field">
              <label>{{ lang.t('auth.password') }}</label>
              <input formControlName="password" type="password" placeholder="min. 6 characters" />
            </div>

            <!-- Esprit ID + CIN — required for all except COMPANY -->
            <ng-container *ngIf="needsEspritId">
              <div class="grid-2">
                <div class="field">
                  <label>{{ lang.t('auth.register.espritId') }}</label>
                  <input formControlName="espritId" placeholder="e.g. ESP-2024-00123" />
                  <small class="field-hint">{{ lang.t('auth.register.espritIdHint') }}</small>
                </div>
                <div class="field">
                  <label>{{ lang.t('auth.register.cin') }}</label>
                  <input formControlName="cin" placeholder="e.g. 12345678" />
                  <small class="field-hint">{{ lang.t('auth.register.cinHint') }}</small>
                </div>
              </div>
            </ng-container>

            <!-- Student/Alumni fields -->
            <ng-container *ngIf="selectedRole === 'STUDENT' || selectedRole === 'ALUMNI'">
              <div class="grid-2">
                <div class="field">
                  <label>{{ lang.t('auth.register.specialite') }}</label>
                  <div class="reg-sel-wrap">
                    <select formControlName="specialite">
                      <option value="" disabled selected>— Choisir —</option>
                      <option value="Informatique">Informatique</option>
                      <option value="Finance">Finance</option>
                      <option value="Télécom">Télécom</option>
                      <option value="Génie Civil">Génie Civil</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                    <svg class="reg-sel-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="4 6 8 10 12 6"/>
                    </svg>
                  </div>
                </div>
                <div class="field">
                  <label>{{ lang.t('auth.register.parcours') }}</label>
                  <input formControlName="parcours" placeholder="e.g. GL, DS, BI" />
                </div>
              </div>
              <div class="field">
                <label>{{ lang.t('auth.register.promo') }}</label>
                <input formControlName="promo" placeholder="e.g. 4DS1, 3GL2" />
              </div>
            </ng-container>

            <!-- Enseignant fields -->
            <ng-container *ngIf="selectedRole === 'ENSEIGNANT'">
              <div class="field">
                <label>{{ lang.t('auth.register.dept') }}</label>
                <input formControlName="specialite" placeholder="e.g. Informatique" />
              </div>
            </ng-container>

            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="step = 1">{{ lang.t('auth.register.back') }}</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
                {{ loading ? lang.t('auth.register.creating') : lang.t('auth.register.create') }}
              </button>
            </div>

            <div class="error-msg" *ngIf="error">{{ error }}</div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Custom select wrapper ── */
    .reg-sel-wrap {
      position: relative;
      display: block;
    }

    .reg-sel-wrap select {
      width: 100%;
      appearance: none;
      -webkit-appearance: none;
      background-image: none !important;
      padding-right: 40px;
      cursor: pointer;
      color: var(--text);
    }

    /* Placeholder option dimmed */
    .reg-sel-wrap select option[value=""] {
      color: var(--text-dim);
    }

    /* Options inherit theme colours so popup matches */
    .reg-sel-wrap select option {
      background: var(--dark2);
      color: var(--text);
    }

    /* Chevron icon */
    .reg-sel-chevron {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: var(--text-dim);
      pointer-events: none;
      transition: color 0.2s, transform 0.2s;
    }

    /* Chevron turns accent-red when select is focused */
    .reg-sel-wrap:focus-within .reg-sel-chevron {
      color: var(--red);
      transform: translateY(-50%) rotate(180deg);
    }

    /* ── Light mode overrides ── */
    :host-context(body.light-theme) .reg-sel-wrap select {
      background: #ffffff;
      border-color: rgba(15,23,42,0.12);
      color: #0f172a;
    }

    :host-context(body.light-theme) .reg-sel-wrap select option {
      background: #ffffff;
      color: #0f172a;
    }

    :host-context(body.light-theme) .reg-sel-wrap select option[value=""] {
      color: #94a3b8;
    }

    :host-context(body.light-theme) .reg-sel-chevron {
      color: #94a3b8;
    }

    :host-context(body.light-theme) .reg-sel-wrap:focus-within .reg-sel-chevron {
      color: var(--red);
    }
  `]
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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, public lang: LanguageService) {
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

  selectRole(role: UserRole): void { this.selectedRole = role; }

  roleLabelFor(role: UserRole | null): string {
    return this.roleOptions.find(r => r.value === role)?.label ?? '';
  }

  goStep2(): void {
    if (!this.selectedRole) return;
    if (this.needsEspritId) {
      this.form.get('espritId')?.setValidators([Validators.required]);
      this.form.get('cin')?.setValidators([Validators.required]);
    } else {
      this.form.get('espritId')?.clearValidators();
      this.form.get('cin')?.clearValidators();
    }
    this.form.get('espritId')?.updateValueAndValidity();
    this.form.get('cin')?.updateValueAndValidity();

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
      nom:        val.nom || val.prenom,
      role:       this.selectedRole,
      promo:      val.promo || undefined,
      espritId:   val.espritId || undefined,
      cin:        val.cin || undefined,
      specialite: val.specialite || undefined,
      parcours:   val.parcours || undefined
    }).subscribe({
      next: (res) => {
        if (!res.token) {
          // Email verification required — token is null until user verifies
          this.router.navigate(['/auth/login'], { queryParams: { verify: 'true' } });
        } else if (res.user.approved === false) {
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
