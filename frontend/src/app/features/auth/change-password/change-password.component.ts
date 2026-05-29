import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-change-password',
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-mark">Esprit<span>Connect</span></div>
          <div class="logo-sub">Change your password</div>
        </div>

        <div class="info-banner info-banner-success" *ngIf="done">
          <span class="icon icon-check"></span>
          Password changed successfully!
        </div>

        <ng-container *ngIf="!done">
          <h2 class="auth-title">Change password</h2>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="field">
              <label>Current password</label>
              <input formControlName="oldPassword" type="password" placeholder="Your current password" />
            </div>
            <div class="field">
              <label>New password</label>
              <input formControlName="newPassword" type="password" placeholder="At least 6 characters" />
              <div class="field-hint error" *ngIf="form.get('newPassword')?.invalid && form.get('newPassword')?.touched">
                Minimum 6 characters required.
              </div>
            </div>
            <div class="field">
              <label>Confirm new password</label>
              <input formControlName="confirmPassword" type="password" placeholder="Repeat your new password" />
              <div class="field-hint error" *ngIf="form.errors?.['mismatch'] && form.get('confirmPassword')?.touched">
                Passwords do not match.
              </div>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
              {{ loading ? 'Saving...' : 'Change password' }}
            </button>
            <div class="error-msg" *ngIf="error">{{ error }}</div>
          </form>
        </ng-container>

        <div class="auth-link" style="margin-top:20px">
          <a routerLink="/profile">Back to profile</a>
        </div>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  form: FormGroup;
  loading = false;
  done = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      oldPassword:     ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { oldPassword, newPassword } = this.form.value;
    this.authService.changePassword(oldPassword, newPassword).subscribe({
      next: () => {
        this.done = true;
        this.loading = false;
        this.form.reset();
      },
      error: err => {
        this.error = err.error?.message || 'Failed to change password.';
        this.loading = false;
      }
    });
  }
}
