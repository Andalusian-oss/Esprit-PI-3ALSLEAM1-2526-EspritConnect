import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="auth-wrapper">
      <div class="auth-card" style="text-align:center">
        <div class="auth-logo">
          <div class="logo-mark">Esprit<span>Connect</span></div>
        </div>
        <div style="font-size:56px;margin:16px 0">🔒</div>
        <h2 class="auth-title">Access Denied</h2>
        <p class="auth-subtitle">You don't have permission to view this page.</p>
        <button class="btn btn-primary" style="margin-top:24px" (click)="go()">Go to my dashboard</button>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}
  go(): void { this.router.navigate(['/feed']); }
}
