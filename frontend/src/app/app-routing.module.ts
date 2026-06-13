import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'feed',
    loadChildren: () => import('./features/feed/feed.module').then(m => m.FeedModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'events',
    loadChildren: () => import('./features/events/events.module').then(m => m.EventsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'jobs',
    loadChildren: () => import('./features/jobs/jobs.module').then(m => m.JobsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'mentoring',
    loadChildren: () => import('./features/mentoring/mentoring.module').then(m => m.MentoringModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pfe-books',
    loadChildren: () => import('./features/pfe-books/pfe-books.module').then(m => m.PfeBooksModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'messages',
    loadChildren: () => import('./features/messages/messages.module').then(m => m.MessagesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'resources',
    loadChildren: () => import('./features/resources/resources.module').then(m => m.ResourcesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'assistant',
    loadChildren: () => import('./features/assistant/assistant.module').then(m => m.AssistantModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'rh',
    loadChildren: () => import('./features/rh/rh.module').then(m => m.RhModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['COMPANY', 'EMPLOYE'] }
  },
  {
    path: 'company',
    redirectTo: '/rh',
    pathMatch: 'full'
  },
  {
    path: 'unauthorized',
    loadChildren: () => import('./features/unauthorized/unauthorized.module').then(m => m.UnauthorizedModule)
  },
  { path: '**', redirectTo: '/feed' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

