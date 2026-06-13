import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Resource, ResourceRequest, ResourceCategory, ResourceType } from '../../core/models/models';
import { ResourceService } from '../../core/services/resource.service';
import { PostService } from '../../core/services/post.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-resources',
  template: `
    <div class="res-root">

      <!-- ══ HEADER ══ -->
      <div class="res-header">
        <div class="res-header-text">
          <h1>{{ lang.t('res.title') }}</h1>
          <p>{{ lang.t('res.subtitle') }}</p>
        </div>
        <button class="res-share-btn" (click)="showForm = !showForm">
          <span>{{ showForm ? lang.t('res.cancelBtn') : lang.t('res.shareBtn') }}</span>
        </button>
      </div>

      <!-- ══ UPLOAD FORM ══ -->
      <div class="res-form-wrap" *ngIf="showForm">
        <div class="res-form-card">
          <h2 class="res-form-title">{{ editingId ? lang.t('res.editForm') : lang.t('res.shareForm') }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()">

            <div class="res-form-grid">
              <div class="res-field res-field-span2">
                <label>{{ lang.t('res.labelTitle') }}</label>
                <input formControlName="titre" [placeholder]="lang.t('res.titlePh')" />
              </div>
              <div class="res-field">
                <label>{{ lang.t('res.labelType') }}</label>
                <select formControlName="type">
                  <option value="ARTICLE">📝 Article</option>
                  <option value="PDF">📄 PDF</option>
                  <option value="VIDEO">🎬 Video</option>
                  <option value="LINK">🔗 Link</option>
                  <option value="TUTORIAL">🎓 Tutorial</option>
                </select>
              </div>
              <div class="res-field">
                <label>{{ lang.t('res.labelCategory') }}</label>
                <select formControlName="categorie">
                  <option value="ACADEMIC">{{ lang.t('res.filterAcademic') }}</option>
                  <option value="CAREER">{{ lang.t('res.filterCareer') }}</option>
                  <option value="TECHNICAL">{{ lang.t('res.filterTechnical') }}</option>
                  <option value="SOCIAL">{{ lang.t('res.filterSocial') }}</option>
                  <option value="EVENT">{{ lang.t('res.filterEvent') }}</option>
                </select>
              </div>
              <div class="res-field res-field-span2">
                <label>{{ lang.t('res.labelDesc') }}</label>
                <textarea formControlName="description" rows="3" [placeholder]="lang.t('res.descPh')"></textarea>
              </div>
              <div class="res-field res-field-span2">
                <label>{{ lang.t('res.labelUrl') }}</label>
                <input formControlName="lien" placeholder="https://..." />
              </div>
              <div class="res-field res-field-span2">
                <label>{{ lang.t('res.labelTags') }} <span class="res-hint">{{ lang.t('res.tagsHint') }}</span></label>
                <input formControlName="tags" placeholder="e.g. java, spring, backend, api" />
              </div>
            </div>

            <!-- PDF upload -->
            <div class="res-upload-zone" *ngIf="form.value.type === 'PDF'">
              <div class="res-upload-icon">📄</div>
              <p>{{ lang.t('res.uploadPdf') }}</p>
              <label class="res-upload-btn">
                {{ uploadingFile ? lang.t('common.uploading') : lang.t('res.chooseFile') }}
                <input type="file" accept=".pdf" (change)="onFileSelected($event)" style="display:none" />
              </label>
              <p class="res-upload-done" *ngIf="form.value.fileUrl">
                {{ lang.t('res.fileUploaded') }}<span *ngIf="selectedFileName"> — {{ selectedFileName }}</span>
              </p>
            </div>

            <div class="res-form-actions">
              <button class="res-btn-ghost" type="button" (click)="cancelForm()">{{ lang.t('common.cancel') }}</button>
              <button class="res-btn-primary" type="submit" [disabled]="form.invalid || saving || uploadingFile">
                {{ saving ? lang.t('common.saving') : (editingId ? lang.t('res.update') : lang.t('res.share')) }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ══ FILTERS ══ -->
      <div class="res-filters">
        <div class="res-search-wrap">
          <svg class="res-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input class="res-search" [(ngModel)]="searchQuery" [placeholder]="lang.t('res.title')" />
        </div>
        <div class="res-filter-pills">
          <button class="res-pill" [class.active]="filterCategory === ''" (click)="filterCategory = ''">{{ lang.t('res.filterAll') }}</button>
          <button class="res-pill" [class.active]="filterCategory === 'ACADEMIC'"  (click)="filterCategory = 'ACADEMIC'">{{ lang.t('res.filterAcademic') }}</button>
          <button class="res-pill" [class.active]="filterCategory === 'CAREER'"    (click)="filterCategory = 'CAREER'">{{ lang.t('res.filterCareer') }}</button>
          <button class="res-pill" [class.active]="filterCategory === 'TECHNICAL'" (click)="filterCategory = 'TECHNICAL'">{{ lang.t('res.filterTechnical') }}</button>
          <button class="res-pill" [class.active]="filterCategory === 'SOCIAL'"    (click)="filterCategory = 'SOCIAL'">{{ lang.t('res.filterSocial') }}</button>
          <button class="res-pill" [class.active]="filterCategory === 'EVENT'"     (click)="filterCategory = 'EVENT'">{{ lang.t('res.filterEvent') }}</button>
        </div>
        <div class="res-type-filter">
          <select [(ngModel)]="filterType" class="res-select">
            <option value="">{{ lang.t('res.allTypes') }}</option>
            <option value="ARTICLE">Article</option>
            <option value="PDF">PDF</option>
            <option value="VIDEO">Video</option>
            <option value="LINK">Link</option>
            <option value="TUTORIAL">Tutorial</option>
          </select>
        </div>
      </div>

      <!-- ══ RESULTS COUNT ══ -->
      <div class="res-count" *ngIf="!loading">
        <span>{{ filtered.length }} resource{{ filtered.length !== 1 ? 's' : '' }}</span>
        <span *ngIf="searchQuery || filterCategory || filterType" class="res-clear" (click)="clearFilters()">{{ lang.t('res.clearFilters') }}</span>
      </div>

      <!-- ══ LOADING ══ -->
      <div class="res-loading" *ngIf="loading">
        <div class="res-spinner"></div>
        <p>{{ lang.t('res.loadingResources') }}</p>
      </div>

      <!-- ══ EMPTY ══ -->
      <div class="res-empty" *ngIf="!loading && filtered.length === 0">
        <div class="res-empty-icon">📚</div>
        <h3>{{ lang.t('res.emptyTitle') }}</h3>
        <p>{{ searchQuery || filterCategory || filterType ? lang.t('res.emptyFilterDesc') : lang.t('res.emptyDesc') }}</p>
        <button class="res-btn-primary" (click)="showForm = true; clearFilters()">{{ lang.t('res.share') }}</button>
      </div>

      <!-- ══ CARDS GRID ══ -->
      <div class="res-grid" *ngIf="!loading && filtered.length > 0">
        <article class="res-card" *ngFor="let r of paged">

          <!-- Type icon banner -->
          <div class="res-card-top" [class]="'res-top-' + r.type.toLowerCase()">
            <span class="res-type-icon">{{ typeIcon(r.type) }}</span>
            <div class="res-card-badges">
              <span class="res-badge" [class]="'res-badge-' + r.type.toLowerCase()">{{ r.type }}</span>
              <span class="res-badge res-badge-cat">{{ r.categorie }}</span>
            </div>
          </div>

          <!-- Content -->
          <div class="res-card-body">
            <h3 class="res-card-title">{{ r.titre }}</h3>
            <p class="res-card-desc" *ngIf="r.description">
              {{ r.description | slice:0:110 }}{{ r.description.length > 110 ? '…' : '' }}
            </p>

            <!-- Tags -->
            <div class="res-tags" *ngIf="r.tags">
              <span class="res-tag" *ngFor="let tag of getTags(r.tags)">{{ tag }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="res-card-footer">
            <div class="res-stats">
              <span class="res-stat" title="Likes">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.4 10.55 20.1C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.6L12 21.4Z"/></svg>
                {{ r.likeCount }}
              </span>
              <span class="res-stat" title="Views">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z"/></svg>
                {{ r.viewCount }}
              </span>
              <span class="res-stat" title="Downloads">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-5-5 1.4-1.4 2.6 2.6V4h2v8.2l2.6-2.6L17 11l-5 5Zm-7 4v-2h14v2H5Z"/></svg>
                {{ r.downloadCount }}
              </span>
            </div>
            <div class="res-actions">
              <button class="res-action-like" [class.liked]="r.likedByMe" (click)="toggleLike(r); $event.stopPropagation()">
                {{ r.likedByMe ? lang.t('res.liked') : lang.t('res.like') }}
              </button>
              <!-- External link (URL / video / article) — view only, no download -->
              <button class="res-action-open" *ngIf="r.lien" (click)="openLink(r)">
                {{ lang.t('res.view') }}
              </button>
              <!-- Uploaded file (PDF…) — fetched with auth so it actually opens -->
              <button class="res-action-open" *ngIf="r.fileUrl" (click)="view(r)" [disabled]="busyId === r.id">
                {{ lang.t('res.view') }}
              </button>
              <button class="res-action-dl" *ngIf="r.fileUrl" (click)="download(r)" [disabled]="busyId === r.id">
                {{ lang.t('res.download') }}
              </button>
              <ng-container *ngIf="canEdit(r)">
                <button class="res-action-edit" (click)="edit(r)">{{ lang.t('common.edit') }}</button>
                <button class="res-action-del"  (click)="remove(r.id)">✕</button>
              </ng-container>
            </div>
          </div>

        </article>
      </div>

      <!-- ══ PAGINATION ══ -->
      <div class="res-pagination" *ngIf="!loading && filtered.length > pageSize">
        <button class="res-page-btn" (click)="page = page - 1" [disabled]="page === 1">{{ lang.t('res.prevBtn') }}</button>
        <div class="res-page-dots">
          <button *ngFor="let p of pageRange"
            class="res-page-dot" [class.active]="p === page"
            (click)="page = p">{{ p }}</button>
        </div>
        <button class="res-page-btn" (click)="page = page + 1" [disabled]="page === totalPages">{{ lang.t('res.nextBtn') }}</button>
      </div>

    </div>
  `,
  styles: [`
    /* ══ Root ══ */
    .res-root { max-width:1180px; margin:0 auto; padding:32px 24px 64px; }

    /* ══ Header ══ */
    .res-header { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:28px; flex-wrap:wrap; }
    .res-header-text h1 { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; letter-spacing:-0.5px; margin-bottom:4px; }
    .res-header-text p  { font-size:15px; color:var(--text-muted); }
    .res-share-btn { background:var(--red); color:#fff; border:none; padding:11px 22px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; transition:var(--transition); white-space:nowrap; &:hover { opacity:.85; transform:translateY(-1px); } }

    /* ══ Form card ══ */
    .res-form-wrap { margin-bottom:28px; animation:slideDown .2s ease; }
    @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
    .res-form-card { background:var(--dark2); border:1px solid var(--border); border-radius:18px; padding:28px; box-shadow:var(--shadow); }
    .res-form-title { font-family:'Syne',sans-serif; font-size:19px; font-weight:700; margin-bottom:22px; }
    .res-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
    .res-field { display:flex; flex-direction:column; gap:6px;
      label { font-size:13px; font-weight:600; color:var(--text-muted); }
      input,select,textarea { background:var(--dark3); border:1px solid var(--border); border-radius:9px; padding:10px 14px; color:var(--text); font-size:14px; font-family:'DM Sans',sans-serif; transition:var(--transition);
        &:focus { outline:none; border-color:var(--accent-cyan); box-shadow:0 0 0 3px rgba(56,214,199,0.12); }
      }
      textarea { resize:vertical; min-height:80px; }
    }
    .res-field-span2 { grid-column:1/-1; }
    .res-hint { font-weight:400; color:var(--text-dim); font-size:12px; }

    /* PDF upload zone */
    .res-upload-zone { border:2px dashed var(--border); border-radius:12px; padding:28px; text-align:center; margin-bottom:16px; color:var(--text-muted); transition:var(--transition);
      &:hover { border-color:var(--accent-cyan); }
    }
    .res-upload-icon { font-size:32px; margin-bottom:8px; }
    .res-upload-btn { display:inline-block; background:var(--dark3); border:1px solid var(--border); padding:8px 18px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; margin-top:10px; transition:var(--transition);
      &:hover { border-color:var(--accent-cyan); color:var(--accent-cyan); }
    }
    .res-upload-done { color:#3ddc84; font-size:13px; font-weight:600; margin-top:8px; }
    .res-form-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:8px; }
    .res-btn-primary { background:var(--red); color:#fff; border:none; padding:10px 22px; border-radius:9px; font-size:14px; font-weight:700; cursor:pointer; transition:var(--transition); &:hover:not(:disabled) { opacity:.85; } &:disabled { opacity:.5; cursor:not-allowed; } }
    .res-btn-ghost   { background:transparent; border:1px solid var(--border); color:var(--text-muted); padding:10px 22px; border-radius:9px; font-size:14px; cursor:pointer; transition:var(--transition); &:hover { border-color:var(--red); color:var(--red); } }

    /* ══ Filters ══ */
    .res-filters { display:flex; gap:12px; align-items:center; margin-bottom:16px; flex-wrap:wrap; }
    .res-search-wrap { position:relative; flex:1; min-width:200px; }
    .res-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:var(--text-dim); pointer-events:none; }
    .res-search { width:100%; background:var(--dark2); border:1px solid var(--border); border-radius:10px; padding:10px 14px 10px 38px; color:var(--text); font-size:14px; font-family:'DM Sans',sans-serif; transition:var(--transition);
      &:focus { outline:none; border-color:var(--accent-cyan); box-shadow:0 0 0 3px rgba(56,214,199,0.10); }
      &::placeholder { color:var(--text-dim); }
    }
    .res-filter-pills { display:flex; gap:6px; flex-wrap:wrap; }
    .res-pill { background:var(--dark2); border:1px solid var(--border); color:var(--text-muted); padding:7px 14px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; transition:var(--transition); white-space:nowrap;
      &:hover { border-color:var(--red); color:var(--red); }
      &.active { background:var(--red-glow); border-color:var(--red); color:var(--red); }
    }
    .res-select { background:var(--dark2); border:1px solid var(--border); border-radius:10px; padding:9px 14px; color:var(--text); font-size:13px; font-family:'DM Sans',sans-serif; cursor:pointer; transition:var(--transition);
      &:focus { outline:none; border-color:var(--accent-cyan); }
    }

    /* ══ Count & clear ══ */
    .res-count { display:flex; align-items:center; gap:12px; font-size:13px; color:var(--text-muted); margin-bottom:16px; }
    .res-clear { color:var(--red); cursor:pointer; font-weight:600; &:hover { text-decoration:underline; } }

    /* ══ Loading ══ */
    .res-loading { padding:64px; text-align:center; color:var(--text-muted); }
    .res-spinner { width:36px; height:36px; border:3px solid var(--border); border-top-color:var(--red); border-radius:50%; animation:spin .7s linear infinite; margin:0 auto 16px; }
    @keyframes spin { to { transform:rotate(360deg); } }

    /* ══ Empty ══ */
    .res-empty { padding:72px 24px; text-align:center;
      h3 { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; margin:16px 0 8px; }
      p  { color:var(--text-muted); font-size:15px; margin-bottom:24px; }
    }
    .res-empty-icon { font-size:52px; line-height:1; }

    /* ══ Cards grid ══ */
    .res-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; margin-bottom:32px; }

    .res-card { background:var(--dark2); border:1px solid var(--border); border-radius:16px; overflow:hidden; display:flex; flex-direction:column; transition:var(--transition);
      &:hover { border-color:rgba(56,214,199,.3); transform:translateY(-3px); box-shadow:var(--shadow); }
    }

    /* type colour strip */
    .res-card-top { padding:18px 20px 14px; display:flex; align-items:center; justify-content:space-between; }
    .res-top-article  { background:rgba(61,220,132,.08); }
    .res-top-pdf      { background:rgba(225,29,46,.07); }
    .res-top-video    { background:rgba(33,150,243,.08); }
    .res-top-link     { background:rgba(255,189,89,.08); }
    .res-top-tutorial { background:rgba(156,39,176,.08); }

    .res-type-icon { font-size:28px; line-height:1; }
    .res-card-badges { display:flex; flex-direction:column; gap:4px; align-items:flex-end; }

    /* badges */
    .res-badge { font-size:10px; font-weight:700; padding:3px 9px; border-radius:20px; text-transform:uppercase; letter-spacing:.5px; }
    .res-badge-article  { background:rgba(61,220,132,.15);  color:#3ddc84; }
    .res-badge-pdf      { background:rgba(225,29,46,.12);   color:var(--red-light); }
    .res-badge-video    { background:rgba(33,150,243,.12);  color:#2196f3; }
    .res-badge-link     { background:rgba(255,189,89,.15);  color:#ffbd59; }
    .res-badge-tutorial { background:rgba(156,39,176,.12);  color:#ce93d8; }
    .res-badge-cat { background:var(--dark3); color:var(--text-muted); }

    /* card body */
    .res-card-body { padding:16px 20px; flex:1; }
    .res-card-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; margin-bottom:8px; line-height:1.35; }
    .res-card-desc  { font-size:13px; color:var(--text-muted); line-height:1.6; margin-bottom:12px; }
    .res-tags { display:flex; flex-wrap:wrap; gap:5px; }
    .res-tag { font-size:11px; padding:3px 9px; border-radius:12px; background:rgba(56,214,199,.09); color:var(--accent-cyan); border:1px solid rgba(56,214,199,.18); font-weight:500; }

    /* card footer */
    .res-card-footer { padding:12px 20px 16px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
    .res-stats { display:flex; gap:14px; color:var(--text-dim); font-size:13px; }
    .res-stat { display:flex; align-items:center; gap:5px; svg { width:14px; height:14px; } }
    .res-actions { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }

    /* action buttons */
    .res-action-like,
    .res-action-open,
    .res-action-dl,
    .res-action-edit,
    .res-action-del { border:none; border-radius:7px; padding:6px 12px; font-size:12px; font-weight:600; cursor:pointer; transition:var(--transition); }
    .res-action-like { background:var(--dark3); color:var(--text-muted); &:hover { color:#e31e24; } &.liked { background:rgba(225,29,46,.12); color:var(--red); } }
    .res-action-open { background:rgba(56,214,199,.1); color:var(--accent-cyan); &:hover { background:rgba(56,214,199,.18); } }
    .res-action-dl   { background:rgba(61,220,132,.1); color:#3ddc84; &:hover { background:rgba(61,220,132,.18); } &:disabled { opacity:.5; cursor:not-allowed; } }
    .res-action-open:disabled { opacity:.5; cursor:not-allowed; }
    .res-action-edit { background:var(--dark3); color:var(--text-muted); &:hover { color:var(--text); } }
    .res-action-del  { background:rgba(225,29,46,.08); color:var(--red); &:hover { background:rgba(225,29,46,.16); } }

    /* ══ Pagination ══ */
    .res-pagination { display:flex; align-items:center; justify-content:center; gap:8px; }
    .res-page-btn  { background:var(--dark2); border:1px solid var(--border); color:var(--text-muted); padding:8px 18px; border-radius:9px; font-size:14px; font-weight:600; cursor:pointer; transition:var(--transition); &:hover:not(:disabled) { border-color:var(--red); color:var(--red); } &:disabled { opacity:.4; cursor:not-allowed; } }
    .res-page-dots { display:flex; gap:4px; }
    .res-page-dot  { width:36px; height:36px; border-radius:9px; border:1px solid var(--border); background:var(--dark2); color:var(--text-muted); font-size:14px; font-weight:600; cursor:pointer; transition:var(--transition); display:flex; align-items:center; justify-content:center;
      &:hover  { border-color:var(--red); color:var(--red); }
      &.active { background:var(--red); border-color:var(--red); color:#fff; }
    }

    /* ══ Responsive ══ */
    @media (max-width:768px) {
      .res-root { padding:20px 14px 48px; }
      .res-header { flex-direction:column; align-items:flex-start; }
      .res-form-grid { grid-template-columns:1fr; }
      .res-field-span2 { grid-column:auto; }
      .res-filters { flex-direction:column; align-items:stretch; }
      .res-filter-pills { overflow-x:auto; flex-wrap:nowrap; padding-bottom:4px; }
      .res-grid { grid-template-columns:1fr; }
    }
  `]
})
export class ResourcesComponent implements OnInit {
  resources: Resource[] = [];
  editingId: number | null = null;
  showForm = false;
  searchQuery = '';
  filterCategory = '';
  filterType = '';
  page = 1;
  readonly pageSize = 9;
  loading = true;
  saving = false;
  uploadingFile = false;
  busyId: number | null = null;
  selectedFileName = '';

  form: FormGroup = this.fb.group({
    titre:       ['', Validators.required],
    description: [''],
    type:        ['ARTICLE', Validators.required],
    categorie:   ['ACADEMIC', Validators.required],
    fileUrl:     [''],
    lien:        [''],
    tags:        [''],
  });

  constructor(
    private resourceService: ResourceService,
    private fb: FormBuilder,
    private notifications: NotificationService,
    private postService: PostService,
    private authService: AuthService,
    public lang: LanguageService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.resourceService.getAll().subscribe({
      next: (res: Resource[]) => { this.resources = res; this.loading = false; },
      error: () => { this.notifications.error('Unable to load resources'); this.loading = false; }
    });
  }

  get filtered(): Resource[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.resources.filter(r => {
      const matchQ   = !q || [r.titre, r.description, r.tags].some(v => (v ?? '').toLowerCase().includes(q));
      const matchCat = !this.filterCategory || r.categorie === this.filterCategory;
      const matchTyp = !this.filterType     || r.type      === this.filterType;
      return matchQ && matchCat && matchTyp;
    });
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }

  get paged(): Resource[] {
    if (this.page > this.totalPages) this.page = this.totalPages;
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get pageRange(): number[] {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const cur = this.page;
    const pages = new Set([1, total, cur, cur - 1, cur + 1].filter(p => p >= 1 && p <= total));
    return [...pages].sort((a, b) => a - b);
  }

  clearFilters(): void { this.searchQuery = ''; this.filterCategory = ''; this.filterType = ''; this.page = 1; }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const payload = this.form.value as ResourceRequest;
    const isCreate = !this.editingId;
    const req = this.editingId
      ? this.resourceService.update(this.editingId, payload)
      : this.resourceService.create(payload);
    req.subscribe({
      next: () => {
        if (isCreate) this.publishFeedAnnouncement(`New resource shared: ${payload.titre}`);
        this.saving = false; this.cancelForm(); this.notifications.success('Resource saved'); this.load();
      },
      error: () => { this.saving = false; this.notifications.error('Unable to save resource'); }
    });
  }

  edit(r: Resource): void {
    this.editingId = r.id;
    this.selectedFileName = '';
    this.form.patchValue(r);
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm(): void { this.editingId = null; this.showForm = false; this.selectedFileName = ''; this.form.reset({ type: 'ARTICLE', categorie: 'ACADEMIC' }); }

  remove(id: number): void {
    if (!this.notifications.confirm('Delete this resource?')) return;
    this.resourceService.delete(id).subscribe({
      next: () => { this.notifications.success('Resource deleted'); this.load(); },
      error: () => this.notifications.error('Unable to delete')
    });
  }

  toggleLike(r: Resource): void {
    this.resourceService.toggleLike(r.id).subscribe({
      next: (updated: Resource) => { const idx = this.resources.findIndex(x => x.id === r.id); if (idx >= 0) this.resources[idx] = updated; },
      error: () => this.notifications.error('Unable to like')
    });
  }

  /** Open an external link (URL / video / article) — counts as a view. */
  openLink(r: Resource): void {
    if (!r.lien) return;
    window.open(r.lien, '_blank', 'noopener');
    this.countView(r.id);
  }

  /** Consult an uploaded file (PDF…) inline in a new tab — counts as a view. */
  view(r: Resource): void {
    if (!r.fileUrl) return;
    this.busyId = r.id;
    this.resourceService.fetchFile(r.fileUrl).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        // Revoke later so the new tab has time to load the content.
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        this.busyId = null;
        this.countView(r.id);
      },
      error: () => { this.busyId = null; this.notifications.error('Unable to open file'); }
    });
  }

  /** Download an uploaded file (PDF…) to disk — counts as a download. */
  download(r: Resource): void {
    if (!r.fileUrl) return;
    this.busyId = r.id;
    this.resourceService.fetchFile(r.fileUrl).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.fileName(r);
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.busyId = null;
        this.countDownload(r.id);
      },
      error: () => { this.busyId = null; this.notifications.error('Unable to download file'); }
    });
  }

  private fileName(r: Resource): string {
    const base = (r.titre || 'resource').trim().replace(/[^\w.-]+/g, '_');
    const ext = r.fileUrl?.split('.').pop()?.toLowerCase();
    return ext && ext.length <= 5 && !base.toLowerCase().endsWith('.' + ext) ? `${base}.${ext}` : base;
  }

  /** Bump the view counter without clobbering likedByMe in the UI. */
  private countView(id: number): void {
    this.resourceService.incrementView(id).subscribe({
      next: () => {
        const idx = this.resources.findIndex(x => x.id === id);
        if (idx >= 0) this.resources[idx] = { ...this.resources[idx], viewCount: this.resources[idx].viewCount + 1 };
      },
      error: () => undefined
    });
  }

  /** Bump the download counter without clobbering likedByMe in the UI. */
  private countDownload(id: number): void {
    this.resourceService.incrementDownload(id).subscribe({
      next: () => {
        const idx = this.resources.findIndex(x => x.id === id);
        if (idx >= 0) this.resources[idx] = { ...this.resources[idx], downloadCount: this.resources[idx].downloadCount + 1 };
      },
      error: () => undefined
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingFile = true;
    this.resourceService.uploadFile(file).subscribe({
      next: ({ url }: { url: string }) => {
        this.form.patchValue({ fileUrl: url });
        this.form.markAsDirty();
        this.selectedFileName = file.name;
        this.uploadingFile = false;
      },
      error: () => { this.notifications.error('File upload failed'); this.uploadingFile = false; }
    });
  }

  canEdit(r: Resource): boolean {
    const uid  = this.authService.getCurrentUser()?.id;
    const role = this.authService.getCurrentUser()?.role;
    return uid === r.uploadedByUserId || role === 'ADMIN';
  }

  getTags(tags: string): string[] { return tags.split(',').map(t => t.trim()).filter(Boolean); }

  typeIcon(type: string): string {
    const map: Record<string, string> = { ARTICLE: '📝', PDF: '📄', VIDEO: '🎬', LINK: '🔗', TUTORIAL: '🎓' };
    return map[type] ?? '📁';
  }

  private publishFeedAnnouncement(content: string): void {
    this.postService.createPost({ contenu: content, autoApprove: true }).subscribe({ error: () => undefined });
  }
}
