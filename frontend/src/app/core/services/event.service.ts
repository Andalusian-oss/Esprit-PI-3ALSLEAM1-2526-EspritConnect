import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Club, ClubRequest, Event, EventRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {
  private eventsUrl = `${environment.apiUrl}/events`;
  private clubsUrl = `${environment.apiUrl}/clubs`;

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> { return this.http.get<Event[]>(this.eventsUrl); }
  createEvent(data: EventRequest): Observable<Event> { return this.http.post<Event>(this.eventsUrl, data); }
  updateEvent(id: number, data: EventRequest): Observable<Event> { return this.http.put<Event>(`${this.eventsUrl}/${id}`, data); }
  deleteEvent(id: number): Observable<void> { return this.http.delete<void>(`${this.eventsUrl}/${id}`); }
  register(eventId: number): Observable<void> { return this.http.post<void>(`${this.eventsUrl}/${eventId}/register`, {}); }
  unregister(eventId: number): Observable<void> { return this.http.delete<void>(`${this.eventsUrl}/${eventId}/unregister`); }

  getClubs(): Observable<Club[]> { return this.http.get<Club[]>(this.clubsUrl); }
  createClub(data: ClubRequest): Observable<Club> { return this.http.post<Club>(this.clubsUrl, data); }
  updateClub(id: number, data: ClubRequest): Observable<Club> { return this.http.put<Club>(`${this.clubsUrl}/${id}`, data); }
  deleteClub(id: number): Observable<void> { return this.http.delete<void>(`${this.clubsUrl}/${id}`); }
  joinClub(clubId: number): Observable<void> { return this.http.post<void>(`${this.clubsUrl}/${clubId}/join`, {}); }
  leaveClub(clubId: number): Observable<void> { return this.http.delete<void>(`${this.clubsUrl}/${clubId}/leave`); }
}
