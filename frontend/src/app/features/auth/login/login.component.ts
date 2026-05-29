import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-mark">Esprit<span>Connect</span></div>
          <div class="logo-sub">{{ lang.t('auth.login.welcomeBack') }}</div>
        </div>

        <div class="info-banner info-banner-success" *ngIf="pendingApproval">
          <span class="icon icon-shield"></span>
          {{ lang.t('auth.login.pending') }}
        </div>

        <div class="info-banner info-banner-success" *ngIf="emailVerification">
          <span class="icon icon-check"></span>
          Registration successful! Please check your email and click the verification link before logging in.
        </div>

        <h2 class="auth-title">{{ lang.t('auth.login.sub') }}</h2>
        <p class="auth-subtitle">{{ lang.t('auth.login.subtitle') }}</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label>{{ lang.t('auth.email') }}</label>
            <input formControlName="email" type="email" placeholder="you@esprit.tn" />
          </div>
          <div class="field">
            <label>{{ lang.t('auth.password') }}</label>
            <input formControlName="password" type="password" placeholder="••••••" />
            <div style="text-align:right;margin-top:4px">
              <a routerLink="/auth/forgot-password" style="font-size:13px;color:#1a73e8">Forgot password?</a>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
            {{ loading ? lang.t('auth.login.signingIn') : lang.t('auth.login.btn') }}
          </button>
          <div class="error-msg" *ngIf="error">{{ error }}</div>
        </form>
        <div class="auth-link">{{ lang.t('auth.login.noAccount') }} <a routerLink="/auth/register">{{ lang.t('auth.login.createOne') }}</a></div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  error = '';
  loading = false;
  pendingApproval = false;
  emailVerification = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public lang: LanguageService
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.pendingApproval = this.route.snapshot.queryParamMap.get('pending') === 'true';
    this.emailVerification = this.route.snapshot.queryParamMap.get('verify') === 'true';
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.authService.login(email, password).subscribe({
      next: (res) => {
        const role = res.user.role;
        if (role === 'COMPANY') {
          this.router.navigate(['/company']);
        } else if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/feed']);
        }
      },
      error: err => {
        this.error = err.error?.message || 'Invalid email or password';
        this.loading = false;
      }
    });
  }
}

