import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-mark">Esprit<span>Connect</span></div>
          <div class="logo-sub">Choose a new password</div>
        </div>

        <div class="info-banner info-banner-success" *ngIf="done">
          <span class="icon icon-check"></span>
          Password reset successfully! You can now <a routerLink="/auth/login">log in</a>.
        </div>

        <ng-container *ngIf="!done">
          <div class="error-msg" *ngIf="tokenError" style="margin-bottom:16px">{{ tokenError }}</div>

          <h2 class="auth-title">New password</h2>
          <p class="auth-subtitle">Enter your new password below.</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label>New password</label>
              <input formControlName="newPassword" type="password" placeholder="At least 6 characters" />
              <div class="field-hint error" *ngIf="form.get('newPassword')?.invalid && form.get('newPassword')?.touched">
                Minimum 6 characters required.
              </div>
            </div>
            <div class="field">
              <label>Confirm new password</label>
              <input formControlName="confirmPassword" type="password" placeholder="Repeat your password" />
              <div class="field-hint error" *ngIf="form.errors?.['mismatch'] && form.get('confirmPassword')?.touched">
                Passwords do not match.
              </div>
            </div>
            <button type="submit" class="btn btn-primary"
                    [disabled]="form.invalid || loading || !!tokenError">
              {{ loading ? 'Resetting...' : 'Reset password' }}
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
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  done = false;
  error = '';
  tokenError = '';
  private token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.tokenError = 'Invalid or missing reset token. Please request a new link.';
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) return;
    this.loading = true;
    this.error = '';
    this.authService.resetPassword(this.token, this.form.value.newPassword).subscribe({
      next: () => {
        this.done = true;
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Reset failed. The link may have expired.';
        this.loading = false;
      }
    });
  }
}
