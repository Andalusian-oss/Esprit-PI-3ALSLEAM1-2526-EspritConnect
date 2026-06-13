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
  getRankedApplicants(jobId: number): Observable<Application[]> { return this.http.get<Application[]>(`${this.url}/${jobId}/ranked-applicants`); }
  uploadCV(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.url}/upload`, form);
  }
  updateSessionStatus(sessionId: number, status: string): Observable<MentoringSession> {
    return this.http.patch<MentoringSession>(`${this.url}/sessions/${sessionId}/status`, {}, { params: { status } });
  }
  cancelMentoring(id: number): Observable<void> { return this.http.patch<void>(`${this.url}/mentoring/${id}/cancel`, {}); }
  createJob(data: JobRequest): Observable<Job> { return this.http.post<Job>(this.url, data); }
  updateJob(id: number, data: JobRequest): Observable<Job> { return this.http.put<Job>(`${this.url}/${id}`, data); }
  deleteJob(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  apply(jobId: number, cvUrl?: string): Observable<Application> {
    return this.http.post<Application>(`${this.url}/${jobId}/apply`, cvUrl ? { cvUrl } : {});
  }
  updateMatchScore(appId: number, matchScore: number): Observable<Application> {
    return this.http.patch<Application>(`${this.url}/applications/${appId}/match-score`, { matchScore });
  }
  getMyApplications(): Observable<Application[]> { return this.http.get<Application[]>(`${this.url}/my-applications`); }
  updateApplicationCvUrl(appId: number, cvUrl: string): Observable<Application> {
    return this.http.patch<Application>(`${this.url}/applications/${appId}/cv-url`, { cvUrl });
  }
  getApplications(jobId: number): Observable<Application[]> { return this.http.get<Application[]>(`${this.url}/${jobId}/applications`); }
  updateApplicationStatus(appId: number, status: Application['statut']): Observable<Application> {
    return this.http.patch<Application>(`${this.url}/applications/${appId}/status`, {}, { params: { status } });
  }
  withdrawApplication(appId: number): Observable<void> { return this.http.delete<void>(`${this.url}/applications/${appId}`); }

  requestMentoring(mentorUserId: number, domaine: string): Observable<Mentoring> {
    return this.http.post<Mentoring>(`${this.url}/mentoring`, { mentorUserId, domaine });
  }
  getMentoringAsMentor(): Observable<Mentoring[]> { return this.http.get<Mentoring[]>(`${this.url}/mentoring/as-mentor`); }
  getMentoringAsMentore(): Observable<Mentoring[]> { return this.http.get<Mentoring[]>(`${this.url}/mentoring/as-mentore`); }
  getAllMentorings(): Observable<Mentoring[]> { return this.http.get<Mentoring[]>(`${this.url}/mentoring/all`); }
  completeMentoring(id: number): Observable<void> { return this.http.patch<void>(`${this.url}/mentoring/${id}/complete`, {}); }
  addSession(mentoringId: number, date: string, dureeMinutes: number): Observable<MentoringSession> {
    return this.http.post<MentoringSession>(`${this.url}/mentoring/${mentoringId}/sessions`, { date, dureeMinutes });
  }
  startLiveSession(mentoringId: number): Observable<MentoringSession> {
    return this.http.post<MentoringSession>(`${this.url}/mentoring/${mentoringId}/sessions/live`, {});
  }
  endSession(sessionId: number): Observable<MentoringSession> {
    return this.http.patch<MentoringSession>(`${this.url}/sessions/${sessionId}/end`, {});
  }
  getSessions(mentoringId: number): Observable<MentoringSession[]> {
    return this.http.get<MentoringSession[]>(`${this.url}/mentoring/${mentoringId}/sessions`);
  }
}
