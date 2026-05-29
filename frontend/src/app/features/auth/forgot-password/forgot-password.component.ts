import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-mark">Esprit<span>Connect</span></div>
          <div class="logo-sub">Reset your password</div>
        </div>

        <div class="info-banner info-banner-success" *ngIf="sent">
          <span class="icon icon-check"></span>
          If an account exists with that email, a reset link has been sent. Check your inbox.
        </div>

        <ng-container *ngIf="!sent">
          <h2 class="auth-title">Forgot password?</h2>
          <p class="auth-subtitle">Enter your email and we'll send you a link to reset your password.</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label>Email address</label>
              <input formControlName="email" type="email" placeholder="you@esprit.tn" />
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
              {{ loading ? 'Sending...' : 'Send reset link' }}
            </button>
            <div class="error-msg" *ngIf="error">{{ error }}</div>
          </form>
        </ng-container>

        <div class="auth-link" style="margin-top:20px">
          <a routerLink="/auth/login">Back to login</a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  sent = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.authService.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.sent = true;
        this.loading = false;
      },
      error: () => {
        // Show success anyway to avoid user enumeration
        this.sent = true;
        this.loading = false;
      }
    });
  }
}
