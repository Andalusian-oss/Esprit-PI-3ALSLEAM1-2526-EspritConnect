import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { User, UserRole } from './core/models/models';

@Component({
  selector: 'app-root',
  template: `
    <!-- Sidebar layout -->
    <div class="app-layout" [class.no-sidebar]="!authService.isLoggedIn()">

      <!-- ── SIDEBAR ── -->
      <aside class="sidebar" *ngIf="authService.isLoggedIn()">
        <!-- Brand -->
        <div class="sidebar-brand">
          <span class="brand-mark">EC</span>
          <span class="brand-text">Esprit<span>Connect</span></span>
        </div>

        <!-- User card -->
        <div class="sidebar-user" *ngIf="user">
          <div class="avatar-wrap">
            <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" class="avatar" alt="avatar" />
            <div *ngIf="!user.avatarUrl" class="avatar avatar-initials">
              {{ user.prenom[0] }}{{ user.nom[0] }}
            </div>
            <span class="online-dot" [class.online]="user.online"></span>
          </div>
          <div class="user-info">
            <strong>{{ user.prenom }} {{ user.nom }}</strong>
            <span class="role-badge role-badge-{{ user.role.toLowerCase() }}">{{ roleLabel }}</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <ng-container *ngFor="let item of navItems">
            <a *ngIf="canSee(item.roles)"
               [routerLink]="item.path"
               routerLinkActive="active"
               class="nav-item">
              <span class="icon {{ item.icon }}"></span>
              <span>{{ item.label }}</span>
            </a>
          </ng-container>
        </nav>

        <!-- Logout -->
        <button class="sidebar-logout" (click)="logout()">
          <span class="icon icon-log-out"></span>
          <span>Sign out</span>
        </button>
      </aside>

      <!-- ── MAIN CONTENT ── -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>

    <!-- Toast stack -->
    <div class="toast-stack">
      <button
        class="toast"
        *ngFor="let toast of notifications.toasts$ | async"
        [ngClass]="'toast-' + toast.type"
        (click)="notifications.dismiss(toast.id)"
        type="button">
        <span class="icon" [ngClass]="toast.type === 'success' ? 'icon-check' : toast.type === 'error' ? 'icon-alert' : 'icon-message'"></span>
        {{ toast.message }}
      </button>
    </div>
  `
})
export class AppComponent {

  navItems: { path: string; label: string; icon: string; roles: UserRole[] | null }[] = [
    { path: '/feed',     label: 'Feed',        icon: 'icon-home',      roles: ['STUDENT', 'ENSEIGNANT', 'ALUMNI', 'EMPLOYE', 'ADMIN', 'MENTOR'] },
    { path: '/events',   label: 'Events',      icon: 'icon-calendar',  roles: ['STUDENT', 'ENSEIGNANT', 'ALUMNI', 'EMPLOYE', 'ADMIN', 'MENTOR'] },
    { path: '/jobs',     label: 'Jobs',        icon: 'icon-briefcase', roles: ['STUDENT', 'ALUMNI', 'EMPLOYE', 'ADMIN', 'MENTOR'] },
    { path: '/messages', label: 'Messages',    icon: 'icon-message',   roles: ['STUDENT', 'ENSEIGNANT', 'ALUMNI', 'EMPLOYE', 'ADMIN', 'MENTOR', 'COMPANY'] },
    { path: '/profile',  label: 'Profile',     icon: 'icon-user',      roles: null },  // all roles
    { path: '/company',  label: 'My Recruits', icon: 'icon-building',  roles: ['COMPANY'] },
    { path: '/admin',    label: 'Admin',        icon: 'icon-shield',    roles: ['ADMIN'] },
  ];

  constructor(
    public authService: AuthService,
    public notifications: NotificationService,
    private router: Router
  ) {}

  get user(): User | null {
    return this.authService.getCurrentUser();
  }

  get roleLabel(): string {
    const map: Record<UserRole, string> = {
      STUDENT: 'Étudiant', ENSEIGNANT: 'Enseignant', ALUMNI: 'Alumni',
      EMPLOYE: 'Employé', COMPANY: 'Entreprise', ADMIN: 'Admin', MENTOR: 'Mentor'
    };
    return this.user ? map[this.user.role] ?? this.user.role : '';
  }

  canSee(roles: UserRole[] | null): boolean {
    if (!roles) return true;
    const r = this.user?.role;
    return !!r && roles.includes(r);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

