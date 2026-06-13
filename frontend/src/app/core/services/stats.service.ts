import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthStats {
  totalUsers: number;
  onlineNow: number;
  newThisMonth: number;
  newLastMonth: number;
  byRole: Record<string, number>;
  growthByMonth: { label: string; value: number }[];
}

export interface PostStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  newThisMonth: number;
  newLastMonth: number;
  topPosts: { title: string; userName: string; likes: number }[];
  activityByDay: { date: string; count: number }[];
}

export interface JobStats {
  totalJobs: number;
  totalApplications: number;
  acceptanceRate: number;
  avgMatchScore: number;
  byType: Record<string, number>;
  topJobs: { titre: string; entreprise: string; applications: number }[];
}

export interface EventStats {
  totalEvents: number;
  upcoming: number;
  completed: number;
  totalRegistrations: number;
  byCategory: Record<string, number>;
  topEvents: { titre: string; registrations: number }[];
}

export interface ResourceStats {
  total: number;
  totalDownloads: number;
  totalViews: number;
  totalLikes: number;
  downloadRate: number;
  byCategory: Record<string, number>;
  topCategory: string;
}

/** Reads the live, database-backed analytics endpoints exposed by each microservice. */
@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  authStats(): Observable<AuthStats> {
    return this.http.get<AuthStats>(`${environment.apiUrl}/auth/stats`);
  }
  postStats(): Observable<PostStats> {
    return this.http.get<PostStats>(`${environment.apiUrl}/posts/stats`);
  }
  jobStats(): Observable<JobStats> {
    return this.http.get<JobStats>(`${environment.apiUrl}/jobs/stats`);
  }
  eventStats(): Observable<EventStats> {
    return this.http.get<EventStats>(`${environment.apiUrl}/events/stats`);
  }
  resourceStats(): Observable<ResourceStats> {
    return this.http.get<ResourceStats>(`${environment.apiUrl}/resources/stats`);
  }
}
