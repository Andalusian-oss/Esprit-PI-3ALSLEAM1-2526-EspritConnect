import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Club, Event, EventRequest } from '../../core/models/models';
import { EventService } from '../../core/services/event.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-events',
  template: `
    <div class="page-wide">
      <div class="page-header page-header-row">
        <div>
          <h1>{{ lang.t('events.title') }}</h1>
          <p>{{ lang.t('events.subtitle') }}</p>
        </div>
        <button class="btn btn-ghost" *ngIf="canManageEvents" (click)="toggleClubForm()">
          <span class="icon" [ngClass]="showClubForm ? 'icon-x' : 'icon-plus'"></span>
          {{ showClubForm ? lang.t('events.closeClubForm') : lang.t('events.newClub') }}
        </button>
      </div>

      <div class="crud-grid" *ngIf="canManageEvents">
        <section class="panel">
          <h2>{{ editingEventId ? lang.t('events.updateEvent') : lang.t('events.createEvent') }}</h2>
          <form [formGroup]="eventForm" (ngSubmit)="saveEvent()" class="stack">
            <input formControlName="titre" [placeholder]="lang.t('events.titlePh')" />
            <textarea formControlName="description" [placeholder]="lang.t('events.descPh')"></textarea>
            <div class="grid-2">
              <input formControlName="date" type="datetime-local" />
              <input formControlName="lieu" [placeholder]="lang.t('events.locationPh')" />
            </div>
            <select formControlName="clubId">
              <option [ngValue]="null">{{ lang.t('events.noClub') }}</option>
              <option *ngFor="let club of clubs" [ngValue]="club.id">{{ club.nom }}</option>
            </select>
            <div class="form-actions">
              <button class="btn btn-primary" type="submit" [disabled]="eventForm.invalid || saving">
                <span class="icon" [ngClass]="editingEventId ? 'icon-save' : 'icon-plus'"></span>
                {{ editingEventId ? lang.t('common.update') : lang.t('common.create') }}
              </button>
              <button class="btn btn-ghost" type="button" *ngIf="editingEventId" (click)="resetEventForm()">{{ lang.t('common.cancel') }}</button>
            </div>
          </form>
        </section>

        <section class="panel" *ngIf="showClubForm">
          <h2>{{ editingClubId ? lang.t('events.updateClub') : lang.t('events.createClub') }}</h2>
          <form [formGroup]="clubForm" (ngSubmit)="saveClub()" class="stack">
            <input formControlName="nom" [placeholder]="lang.t('events.clubNamePh')" />
            <textarea formControlName="description" [placeholder]="lang.t('events.descPh')"></textarea>
            <input formControlName="logoUrl" [placeholder]="lang.t('events.logoUrlPh')" />
            <div class="form-actions">
              <button class="btn btn-primary" type="submit" [disabled]="clubForm.invalid || saving">
                <span class="icon" [ngClass]="editingClubId ? 'icon-save' : 'icon-plus'"></span>
                {{ editingClubId ? lang.t('common.update') : lang.t('common.create') }}
              </button>
              <button class="btn btn-ghost" type="button" *ngIf="editingClubId" (click)="resetClubForm()">{{ lang.t('common.cancel') }}</button>
            </div>
          </form>
        </section>
      </div>

      <div *ngIf="error" class="error-msg">{{ error }}</div>
      <div *ngIf="loading" class="empty"><p>{{ lang.t('common.loading') }}</p></div>

      <div class="section-title">{{ lang.t('events.sectionEvents') }}</div>
      <div class="toolbar">
        <input [(ngModel)]="eventQuery" [placeholder]="lang.t('events.searchEvents')" />
        <select [(ngModel)]="eventClubFilter">
          <option [ngValue]="null">{{ lang.t('events.allClubs') }}</option>
          <option *ngFor="let club of clubs" [ngValue]="club.id">{{ club.nom }}</option>
        </select>
      </div>
      <div *ngIf="!loading && events.length === 0" class="empty"><p>{{ lang.t('events.noEvents') }}</p></div>
      <div class="list-grid">
        <article class="card" *ngFor="let event of pagedEvents">
          <div class="item-head">
            <div>
              <h3>{{ event.titre }}</h3>
              <p>{{ event.date | date:'medium' }}</p>
            </div>
            <span class="badge badge-red">{{ event.registrationCount }} {{ lang.t('events.registered') }}</span>
          </div>
          <p class="muted" *ngIf="event.description">{{ event.description }}</p>
          <div class="meta-row">
            <span *ngIf="event.lieu">{{ lang.t('events.location') }} {{ event.lieu }}</span>
            <span *ngIf="event.clubNom">{{ lang.t('events.club') }} {{ event.clubNom }}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-ghost" (click)="register(event.id)"><span class="icon icon-check"></span>{{ lang.t('common.register') }}</button>
            <button class="btn btn-ghost" *ngIf="canManageEvents" (click)="editEvent(event)"><span class="icon icon-edit"></span>{{ lang.t('common.edit') }}</button>
            <button class="btn btn-danger" *ngIf="canManageEvents" (click)="deleteEvent(event.id)"><span class="icon icon-trash"></span>{{ lang.t('common.delete') }}</button>
          </div>
        </article>
      </div>
      <div class="pagination" *ngIf="filteredEvents.length > pageSize">
        <button class="btn btn-ghost" (click)="eventPage = eventPage - 1" [disabled]="eventPage === 1">{{ lang.t('common.previous') }}</button>
        <span>{{ eventPage }} / {{ eventTotalPages }}</span>
        <button class="btn btn-ghost" (click)="eventPage = eventPage + 1" [disabled]="eventPage === eventTotalPages">{{ lang.t('common.next') }}</button>
      </div>

      <div class="section-title">{{ lang.t('events.sectionClubs') }}</div>
      <div class="toolbar">
        <input [(ngModel)]="clubQuery" [placeholder]="lang.t('events.searchClubs')" />
      </div>
      <div class="list-grid">
        <article class="card" *ngFor="let club of filteredClubs">
          <div class="item-head">
            <div>
              <h3>{{ club.nom }}</h3>
              <p>{{ club.memberCount }} {{ lang.t('events.members') }}</p>
            </div>
            <span class="badge badge-gray">{{ lang.t('events.clubBadge') }}</span>
          </div>
          <p class="muted" *ngIf="club.description">{{ club.description }}</p>
          <div class="card-actions">
            <button class="btn btn-ghost" (click)="joinClub(club.id)"><span class="icon icon-user-plus"></span>{{ lang.t('common.join') }}</button>
            <button class="btn btn-ghost" *ngIf="canManageEvents" (click)="editClub(club)"><span class="icon icon-edit"></span>{{ lang.t('common.edit') }}</button>
            <button class="btn btn-danger" *ngIf="canManageEvents" (click)="deleteClub(club.id)"><span class="icon icon-trash"></span>{{ lang.t('common.delete') }}</button>
          </div>
        </article>
      </div>
    </div>
  `
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  clubs: Club[] = [];
  loading = true;
  saving = false;
  error = '';
  showClubForm = false;
  editingEventId: number | null = null;
  editingClubId: number | null = null;
  eventQuery = '';
  clubQuery = '';
  eventClubFilter: number | null = null;
  eventPage = 1;
  readonly pageSize = 6;

  eventForm: FormGroup = this.fb.group({
    titre: ['', Validators.required],
    description: [''],
    date: ['', Validators.required],
    lieu: [''],
    clubId: [null]
  });

  clubForm: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    description: [''],
    logoUrl: ['']
  });

  constructor(
    private eventService: EventService,
    private fb: FormBuilder,
    private notifications: NotificationService,
    private authService: AuthService,
    public lang: LanguageService
  ) {}

  get canManageEvents(): boolean {
    const role = this.authService.getCurrentUser()?.role;
    return role === 'ADMIN' || role === 'MENTOR';
  }

  get filteredEvents(): Event[] {
    const query = this.eventQuery.trim().toLowerCase();
    return this.events.filter(event => {
      const matchesQuery = !query || [event.titre, event.description, event.lieu, event.clubNom]
        .some(value => (value ?? '').toLowerCase().includes(query));
      const matchesClub = !this.eventClubFilter || event.clubId === this.eventClubFilter;
      return matchesQuery && matchesClub;
    });
  }

  get eventTotalPages(): number { return Math.max(1, Math.ceil(this.filteredEvents.length / this.pageSize)); }
  get pagedEvents(): Event[] {
    if (this.eventPage > this.eventTotalPages) this.eventPage = this.eventTotalPages;
    const start = (this.eventPage - 1) * this.pageSize;
    return this.filteredEvents.slice(start, start + this.pageSize);
  }

  get filteredClubs(): Club[] {
    const query = this.clubQuery.trim().toLowerCase();
    return this.clubs.filter(club => !query || [club.nom, club.description].some(value => (value ?? '').toLowerCase().includes(query)));
  }

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({ next: events => this.events = events, error: () => this.error = 'Unable to load events' });
    this.eventService.getClubs().subscribe({
      next: clubs => { this.clubs = clubs; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Unable to load clubs'; }
    });
  }

  saveEvent(): void {
    if (this.eventForm.invalid) return;
    this.saving = true;
    const payload = this.eventForm.value as EventRequest;
    const request = this.editingEventId
      ? this.eventService.updateEvent(this.editingEventId, payload)
      : this.eventService.createEvent(payload);
    request.subscribe({ next: () => this.afterSave('Event saved'), error: () => this.failSave('Unable to save event') });
  }

  editEvent(event: Event): void {
    this.editingEventId = event.id;
    this.eventForm.patchValue({ ...event, date: event.date.slice(0, 16), clubId: event.clubId ?? null });
  }

  deleteEvent(id: number): void {
    if (!this.notifications.confirm('Delete this event?')) return;
    this.eventService.deleteEvent(id).subscribe({ next: () => { this.notifications.success('Event deleted'); this.loadAll(); }, error: () => this.fail('Unable to delete event') });
  }

  register(id: number): void {
    this.eventService.register(id).subscribe({
      next: () => { this.notifications.success('Registration confirmed'); this.loadAll(); },
      error: (err) => {
        const msg = err.error?.message || err.message || '';
        if (msg.toLowerCase().includes('already')) {
          this.notifications.info('You are already registered for this event');
        } else {
          this.fail('Unable to register for this event');
        }
      }
    });
  }

  saveClub(): void {
    if (this.clubForm.invalid) return;
    this.saving = true;
    const request = this.editingClubId
      ? this.eventService.updateClub(this.editingClubId, this.clubForm.value)
      : this.eventService.createClub(this.clubForm.value);
    request.subscribe({ next: () => this.afterSave('Club saved'), error: () => this.failSave('Unable to save club') });
  }

  editClub(club: Club): void {
    this.showClubForm = true;
    this.editingClubId = club.id;
    this.clubForm.patchValue(club);
  }

  deleteClub(id: number): void {
    if (!this.notifications.confirm('Delete this club?')) return;
    this.eventService.deleteClub(id).subscribe({ next: () => { this.notifications.success('Club deleted'); this.loadAll(); }, error: () => this.fail('Unable to delete club') });
  }

  joinClub(id: number): void {
    this.eventService.joinClub(id).subscribe({ next: () => { this.notifications.success('Club joined'); this.loadAll(); }, error: () => this.fail('Unable to join club') });
  }

  toggleClubForm(): void { this.showClubForm = !this.showClubForm; }
  resetEventForm(): void { this.editingEventId = null; this.eventForm.reset({ clubId: null }); }
  resetClubForm(): void { this.editingClubId = null; this.clubForm.reset(); }

  private afterSave(message: string): void {
    this.saving = false;
    this.error = '';
    this.resetEventForm();
    this.resetClubForm();
    this.notifications.success(message);
    this.loadAll();
  }

  private failSave(message: string): void { this.saving = false; this.fail(message); }
  private fail(message: string): void { this.error = message; this.notifications.error(message); }
}
