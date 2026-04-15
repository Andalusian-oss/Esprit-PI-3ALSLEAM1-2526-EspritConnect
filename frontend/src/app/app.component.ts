import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <nav *ngIf="authService.isLoggedIn()">
      <a routerLink="/feed">Feed</a>
      <a routerLink="/events">Events</a>
      <a routerLink="/jobs">Jobs</a>
      <a routerLink="/messages">Messages</a>
      <a routerLink="/foyer">Foyer</a>
      <a routerLink="/profile">Profile</a>
      <button (click)="logout()">Logout</button>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router) {}
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
