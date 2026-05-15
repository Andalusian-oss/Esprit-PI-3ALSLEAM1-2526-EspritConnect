import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, Job, JobRequest, Mentoring, MentoringSession } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobService {
  private url = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getJobs(): Observable<Job[]> { return this.http.get<Job[]>(this.url); }
  createJob(data: JobRequest): Observable<Job> { return this.http.post<Job>(this.url, data); }
  updateJob(id: number, data: JobRequest): Observable<Job> { return this.http.put<Job>(`${this.url}/${id}`, data); }
  deleteJob(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  apply(jobId: number): Observable<Application> { return this.http.post<Application>(`${this.url}/${jobId}/apply`, {}); }
  getApplications(jobId: number): Observable<Application[]> { return this.http.get<Application[]>(`${this.url}/${jobId}/applications`); }
  updateApplicationStatus(appId: number, status: Application['statut']): Observable<Application> {
    return this.http.patch<Application>(`${this.url}/applications/${appId}/status`, null, { params: { status } });
  }
  withdrawApplication(appId: number): Observable<void> { return this.http.delete<void>(`${this.url}/applications/${appId}`); }

  requestMentoring(mentorUserId: number, domaine: string): Observable<Mentoring> {
    return this.http.post<Mentoring>(`${this.url}/mentoring`, { mentorUserId, domaine });
  }
  getMentoringAsMentor(): Observable<Mentoring[]> { return this.http.get<Mentoring[]>(`${this.url}/mentoring/as-mentor`); }
  getMentoringAsMentore(): Observable<Mentoring[]> { return this.http.get<Mentoring[]>(`${this.url}/mentoring/as-mentore`); }
  completeMentoring(id: number): Observable<void> { return this.http.patch<void>(`${this.url}/mentoring/${id}/complete`, {}); }
  addSession(mentoringId: number, date: string, dureeMinutes: number): Observable<MentoringSession> {
    return this.http.post<MentoringSession>(`${this.url}/mentoring/${mentoringId}/sessions`, { date, dureeMinutes });
  }
  getSessions(mentoringId: number): Observable<MentoringSession[]> {
    return this.http.get<MentoringSession[]>(`${this.url}/mentoring/${mentoringId}/sessions`);
  }
}
