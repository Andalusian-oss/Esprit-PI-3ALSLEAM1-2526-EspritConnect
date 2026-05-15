import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-mark">Esprit<span>Connect</span></div>
          <div class="logo-sub">Welcome back</div>
        </div>

        <div class="info-banner info-banner-success" *ngIf="pendingApproval">
          <span class="icon icon-shield"></span>
          Your company account has been submitted and is <strong>pending admin approval</strong>.
          You'll be able to login once approved.
        </div>

        <h2 class="auth-title">Sign in</h2>
        <p class="auth-subtitle">Enter your credentials to access your campus network</p>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label>Email</label>
            <input formControlName="email" type="email" placeholder="you@esprit.tn" />
          </div>
          <div class="field">
            <label>Password</label>
            <input formControlName="password" type="password" placeholder="••••••" />
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
          <div class="error-msg" *ngIf="error">{{ error }}</div>
        </form>
        <div class="auth-link">No account yet? <a routerLink="/auth/register">Create one</a></div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  error = '';
  loading = false;
  pendingApproval = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.pendingApproval = this.route.snapshot.queryParamMap.get('pending') === 'true';
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

