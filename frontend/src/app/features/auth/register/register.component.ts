import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="register-container">
      <h2>Register — EspritConnect</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input formControlName="prenom" placeholder="First Name" />
        <input formControlName="nom" placeholder="Last Name" />
        <input formControlName="email" type="email" placeholder="Email" />
        <input formControlName="password" type="password" placeholder="Password (min 6 chars)" />
        <select formControlName="role">
          <option value="STUDENT">Student</option>
          <option value="MENTOR">Mentor</option>
          <option value="ADMIN">Admin</option>
        </select>
        <input formControlName="promo" placeholder="Promo (optional)" />
        <button type="submit" [disabled]="form.invalid">Register</button>
        <p *ngIf="error" class="error">{{ error }}</p>
      </form>
      <a routerLink="/auth/login">Already have an account? Login</a>
    </div>
  `
})
export class RegisterComponent {
  form: FormGroup;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['STUDENT', Validators.required],
      promo: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.authService.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: err => this.error = err.error?.message || 'Registration failed'
    });
  }
}
