import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PfeBook, User } from '../../core/models/models';
import { PfeBookService } from '../../core/services/pfe-book.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-pfe-books',
  template: `
    <div class="page-wide">
      <div class="page-header">
        <h1>{{ lang.t('pfe.title') }}</h1>
        <p>{{ lang.t('pfe.subtitle') }}</p>
      </div>

      <!-- Admin Panel - Approve/Reject Books -->
      <div *ngIf="isAdmin" class="admin-panel">
        <div class="admin-tabs">
          <button [class.active]="adminTab === 'all'" (click)="adminTab = 'all'" class="tab-btn">{{ lang.t('pfe.tabAll') }}</button>
          <button [class.active]="adminTab === 'pending'" (click)="adminTab = 'pending'" class="tab-btn">{{ lang.t('pfe.tabPending') }}</button>
        </div>

        <div *ngIf="adminTab === 'all'" class="all-books-section">
          <div *ngIf="displayedBooks.length === 0" class="empty-state">{{ lang.t('pfe.noBooks') }}</div>
          <div *ngFor="let book of displayedBooks" class="all-books-card">
            <h4>{{ book.titre }}</h4>
            <p>{{ book.description | slice:0:100 }}...</p>
            <p class="status-badge" [ngClass]="'status-' + book.status">{{ book.status }}</p>
          </div>
        </div>

        <div *ngIf="adminTab === 'pending'" class="pending-section">
          <div *ngIf="pendingBooks.length === 0" class="empty-state">{{ lang.t('pfe.allReviewed') }}</div>
          <div *ngFor="let book of pendingBooks" class="pending-card">
            <h4>{{ book.titre }}</h4>
            <p>{{ book.description | slice:0:100 }}...</p>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button class="btn btn-success" (click)="approveBook(book)">{{ lang.t('pfe.approve') }}</button>
              <button class="btn btn-danger" (click)="rejectBook(book)">{{ lang.t('pfe.reject') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Company Upload Section -->
      <div *ngIf="userRole === 'COMPANY'" class="company-upload-banner">
        <h3>{{ lang.t('pfe.uploadTitle') }}</h3>
        <p>{{ lang.t('pfe.uploadDesc') }}</p>
        <button class="btn btn-primary" (click)="showUploadForm = !showUploadForm" style="margin-top: 12px;">
          {{ showUploadForm ? lang.t('pfe.cancelBook') : lang.t('pfe.newBook') }}
        </button>

        <form *ngIf="showUploadForm" [formGroup]="uploadForm" (ngSubmit)="submitBook()" class="upload-form">
          <div class="form-group">
            <label>{{ lang.t('pfe.labelCompany') }}</label>
            <input type="text" formControlName="titre" [placeholder]="lang.t('pfe.phCompany')" />
          </div>
          <div class="form-group">
            <label>{{ lang.t('pfe.formLabelDesc') }}</label>
            <textarea formControlName="description" [placeholder]="lang.t('pfe.phDesc')"></textarea>
          </div>
          <div class="form-group">
            <label>{{ lang.t('pfe.formLabelSpec') }}</label>
            <select formControlName="filiere">
              <option value="GL">GL - Software Engineering</option>
              <option value="IA">IA - Artificial Intelligence</option>
              <option value="DATA">DATA - Data Science</option>
              <option value="CLOUD">CLOUD - Cloud Computing</option>
              <option value="RESEAU">RESEAU - Network</option>
              <option value="SECURITE">SECURITE - Security</option>
              <option value="DEVOPS">DEVOPS - DevOps</option>
              <option value="MOBILE">MOBILE - Mobile Dev</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 12px;">{{ lang.t('pfe.submitApproval') }}</button>
        </form>
      </div>

      <!-- Search -->
      <div class="search-filters">
        <input type="text" [(ngModel)]="searchQuery" [placeholder]="lang.t('pfe.searchPh')" />
        <select [(ngModel)]="filterFiliere" (change)="onFilterChange()">
          <option value="">{{ lang.t('common.all') }}</option>
          <option value="GL">GL</option>
          <option value="IA">IA</option>
          <option value="DATA">DATA</option>
          <option value="CLOUD">CLOUD</option>
        </select>
      </div>

      <!-- Stats -->
      <div class="stats-section">
        <div class="stat-card">
          <span class="stat-icon">📚</span>
          <div class="stat-number">{{ displayedBooks.length }}</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⬇️</span>
          <div class="stat-number">{{ getTotalDownloads() }}</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">👁️</span>
          <div class="stat-number">{{ getTotalViews() }}</div>
        </div>
      </div>

      <!-- Books -->
      <div class="books-grid">
        <div *ngFor="let book of pagedBooks" class="book-card">
          <div class="book-header">
            <div class="file-icon">📋</div>
          </div>
          <div class="book-info">
            <h3>{{ book.titre }}</h3>
            <p class="author">{{ book.uploaderName }}</p>
            <p class="desc">{{ book.description | slice:0:80 }}...</p>
          </div>
          <div class="actions">
            <button class="btn btn-ghost" (click)="viewBook(book)">{{ lang.t('pfe.viewBtn') }}</button>
            <button *ngIf="userRole === 'STUDENT'" class="btn btn-primary" (click)="downloadBook(book)">{{ lang.t('pfe.downloadBtn') }}</button>
            <button *ngIf="userRole === 'ALUMNI'" class="btn btn-primary" (click)="downloadBook(book)">{{ lang.t('pfe.downloadBtn') }}</button>
          </div>
        </div>
      </div>

      <!-- Book Viewer Modal -->
      <div *ngIf="viewerModal" class="modal-overlay" (click)="closeViewer()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="btn-close" (click)="closeViewer()">✕</button>
          <div class="modal-header">
            <div class="modal-icon">📚</div>
            <h2>{{ viewerModal.titre }}</h2>
          </div>
          <div class="modal-body">
            <div class="info-row">
              <strong>{{ lang.t('pfe.authorLabel') }}</strong> {{ viewerModal.auteur }}
            </div>
            <div class="info-row">
              <strong>{{ lang.t('pfe.yearLabel') }}</strong> {{ viewerModal.annee }}
            </div>
            <div class="info-row">
              <strong>{{ lang.t('pfe.specLabel') }}</strong> {{ viewerModal.filiere }}
            </div>
            <div class="info-row">
              <strong>{{ lang.t('pfe.deptLabel') }}</strong> {{ viewerModal.departement }}
            </div>
            <div class="info-row">
              <strong>{{ lang.t('pfe.sizeLabel') }}</strong> {{ formatFileSize(viewerModal.fileSize) }}
            </div>
            <div class="info-row full">
              <strong>{{ lang.t('pfe.descLabel') }}</strong>
              <p>{{ viewerModal.description }}</p>
            </div>
            <div class="info-row">
              <strong>{{ lang.t('pfe.downloadsLabel') }}</strong> {{ viewerModal.downloadCount }}
            </div>
            <div class="info-row">
              <strong>{{ lang.t('pfe.viewsLabel') }}</strong> {{ viewerModal.viewCount }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" (click)="downloadBook(viewerModal)">{{ lang.t('pfe.downloadPdf') }}</button>
            <button class="btn btn-ghost" (click)="closeViewer()">{{ lang.t('common.close') }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ══ Root & Header ══ */
    .page-wide { max-width: 1180px; margin: 0 auto; padding: 32px 24px 64px; }
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
    .page-header h1 { font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
    .page-header p { font-size: 14px; color: var(--text-muted); margin: 8px 0 0; }

    /* ══ Admin Panel ══ */
    .admin-panel { background: var(--dark2); border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-bottom: 24px; }
    .admin-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .tab-btn { padding: 10px 18px; border: 1px solid var(--border); background: var(--dark3); color: var(--text-muted); border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .tab-btn:hover { border-color: var(--red); color: var(--red); }
    .tab-btn.active { background: var(--red); border-color: var(--red); color: white; }

    .all-books-section { margin-top: 16px; }
    .all-books-card { background: var(--dark3); border: 1px solid var(--border); border-left: 3px solid var(--accent-cyan); padding: 12px; margin-bottom: 12px; border-radius: 8px; }
    .all-books-card h4 { margin: 0 0 6px 0; font-size: 14px; font-weight: 600; }
    .all-books-card p { margin: 4px 0; font-size: 13px; color: var(--text-muted); }
    .status-badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-top: 8px; }
    .status-APPROVED { background: rgba(61,220,132,0.15); color: #3ddc84; }
    .status-PENDING { background: rgba(255,189,89,0.12); color: #ffbd59; }
    .status-REJECTED { background: rgba(225,29,46,0.12); color: var(--red); }

    .pending-section { margin-top: 16px; }
    .pending-card { background: var(--dark3); border: 1px solid var(--border); border-left: 3px solid #3ddc84; padding: 12px; margin-bottom: 12px; border-radius: 8px; }
    .pending-card h4 { margin: 0 0 6px 0; font-size: 14px; font-weight: 600; }
    .pending-card p { margin: 4px 0; font-size: 13px; color: var(--text-muted); }

    /* ══ Company Upload Section ══ */
    .company-upload-banner { background: var(--dark2); border: 1px solid var(--accent-cyan); border-radius: 14px; padding: 20px; margin-bottom: 24px; }
    .company-upload-banner h3 { margin: 0; font-size: 16px; font-weight: 700; color: var(--accent-cyan); }
    .company-upload-banner p { margin: 6px 0 0; font-size: 13px; color: var(--text-muted); }
    .upload-form { background: var(--dark3); padding: 16px; border: 1px solid var(--border); border-radius: 10px; margin-top: 12px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--dark3); color: var(--text); font-size: 13px; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: var(--accent-cyan); box-shadow: 0 0 0 3px rgba(56,214,199,0.12); }
    .form-group textarea { resize: vertical; min-height: 80px; }

    /* ══ Search & Filters ══ */
    .search-filters { display: flex; gap: 12px; margin: 20px 0; background: var(--dark2); padding: 16px; border: 1px solid var(--border); border-radius: 12px; flex-wrap: wrap; align-items: center; }
    .search-filters input, .search-filters select { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--dark3); color: var(--text); font-size: 13px; font-family: 'DM Sans', sans-serif; }
    .search-filters input:focus, .search-filters select:focus { outline: none; border-color: var(--accent-cyan); }
    .search-filters input { flex: 1; min-width: 180px; }

    /* ══ Stats ══ */
    .stats-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin: 24px 0; }
    .stat-card { background: var(--dark2); border: 1px solid var(--border); padding: 18px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; text-align: center; transition: all 0.2s; }
    .stat-card:hover { border-color: var(--accent-cyan); transform: translateY(-2px); }
    .stat-icon { font-size: 28px; margin-bottom: 8px; }
    .stat-number { font-size: 22px; font-weight: 700; color: var(--text); }

    /* ══ Books Grid ══ */
    .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin: 24px 0; }
    .book-card { background: var(--dark2); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s; }
    .book-card:hover { border-color: var(--accent-cyan); transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }

    .book-header { background: var(--dark3); padding: 16px; display: flex; align-items: center; justify-content: center; min-height: 100px; border-bottom: 1px solid var(--border); }
    .file-icon { font-size: 32px; }

    .book-info { padding: 16px; flex: 1; }
    .book-info h3 { margin: 0 0 6px 0; font-size: 15px; font-weight: 600; }
    .author { margin: 4px 0; font-size: 12px; color: var(--accent-cyan); font-weight: 500; }
    .desc { margin: 8px 0; font-size: 12px; color: var(--text-muted); line-height: 1.5; }

    .actions { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 6px; }

    .empty-state { text-align: center; padding: 50px 20px; color: var(--text-muted); font-size: 14px; font-weight: 500; }

    /* ══ Buttons ══ */
    .btn { padding: 9px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: var(--red); color: white; border-color: var(--red); width: 100%; }
    .btn-primary:hover:not(:disabled) { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-success { background: rgba(61,220,132,0.15); color: #3ddc84; border-color: #3ddc84; }
    .btn-success:hover { background: rgba(61,220,132,0.25); }
    .btn-danger { background: rgba(225,29,46,0.15); color: var(--red); border-color: var(--red); }
    .btn-danger:hover { background: rgba(225,29,46,0.25); }
    .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-muted); width: 100%; }
    .btn-ghost:hover { border-color: var(--red); color: var(--red); }

    /* ══ Modal ══ */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--dark2); border: 1px solid var(--border); border-radius: 14px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .btn-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted); z-index: 10; }
    .btn-close:hover { color: var(--red); }
    .modal-header { padding: 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
    .modal-icon { font-size: 28px; }
    .modal-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
    .modal-body { padding: 20px; }
    .info-row { margin-bottom: 14px; }
    .info-row strong { color: var(--accent-cyan); display: block; margin-bottom: 4px; font-size: 12px; font-weight: 600; }
    .info-row { font-size: 13px; color: var(--text); }
    .info-row p { margin: 4px 0 0; color: var(--text-muted); line-height: 1.6; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 8px; background: var(--dark3); border-radius: 0 0 14px 14px; }
    .modal-footer .btn { margin: 0; flex: 1; }

    @media (max-width: 768px) {
      .page-wide { padding: 20px 14px 48px; }
      .books-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; align-items: flex-start; }
      .search-filters { flex-direction: column; }
    }
  `]
})
export class PfeBooksComponent implements OnInit {
  displayedBooks: PfeBook[] = [];
  allBooks: PfeBook[] = [];
  pendingBooks: PfeBook[] = [];
  pagedBooks: PfeBook[] = [];
  filteredBooks: PfeBook[] = [];
  viewerModal: PfeBook | null = null;

  currentUser: User | undefined;
  isAdmin = false;
  userRole = '';
  adminTab: 'all' | 'pending' = 'all';
  showUploadForm = false;

  uploadForm: FormGroup;
  searchQuery = '';
  filterFiliere = '';
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;

  constructor(
    private pfeService: PfeBookService,
    private notif: NotificationService,
    private authService: AuthService,
    private fb: FormBuilder,
    public lang: LanguageService
  ) {
    this.uploadForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      auteur: [''],
      annee: [2024],
      filiere: ['GL'],
      departement: [''],
      documentUrl: [''],
      fileType: ['PDF']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser() || undefined;
    this.isAdmin = this.currentUser?.role === 'ADMIN';
    this.userRole = this.currentUser?.role || '';
    this.loadBooks();
  }

  loadBooks(): void {
    const mockBooks: PfeBook[] = [
      { id: 1, titre: 'TechVision Tunisia - E-Commerce Solutions', description: 'Developed an advanced e-commerce platform for Tunisian artisanal products with AI recommendations and secure payment processing', auteur: 'TechVision Tunisia', annee: 2024, filiere: 'GL', departement: 'GL', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 2845000, downloadCount: 234, viewCount: 892, uploadedAt: '2024-05-15', keywords: ['ecommerce'], likeCount: 87, likedByMe: false, status: 'APPROVED', uploaderId: 1, uploaderName: 'TechVision Tunisia', uploaderRole: 'COMPANY' },
      { id: 2, titre: 'DataDrive Solutions - AI & HR Analytics', description: 'Predictive HR analytics system using Machine Learning for employee retention and career development recommendations', auteur: 'DataDrive Solutions', annee: 2024, filiere: 'IA', departement: 'IA', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 3456000, downloadCount: 189, viewCount: 567, uploadedAt: '2024-05-10', keywords: ['ml'], likeCount: 92, likedByMe: false, status: 'APPROVED', uploaderId: 2, uploaderName: 'DataDrive Solutions', uploaderRole: 'COMPANY' },
      { id: 3, titre: 'SecureNet Systems - Cybersecurity Platform', description: 'Advanced intrusion detection system powered by machine learning with real-time threat analysis and network monitoring', auteur: 'SecureNet Systems', annee: 2024, filiere: 'SECURITE', departement: 'Security', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 2134000, downloadCount: 156, viewCount: 432, uploadedAt: '2024-05-05', keywords: ['security'], likeCount: 78, likedByMe: false, status: 'PENDING', uploaderId: 3, uploaderName: 'SecureNet Systems', uploaderRole: 'COMPANY' },
      { id: 4, titre: 'MobileFirst Labs - Digital Banking', description: 'Mobile banking application with biometric authentication, contactless payments, and multi-language support', auteur: 'MobileFirst Labs', annee: 2024, filiere: 'MOBILE', departement: 'Mobile', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 4256000, downloadCount: 267, viewCount: 721, uploadedAt: '2024-04-30', keywords: ['mobile'], likeCount: 95, likedByMe: false, status: 'APPROVED', uploaderId: 4, uploaderName: 'MobileFirst Labs', uploaderRole: 'COMPANY' },
      { id: 5, titre: 'GreenEnergy Analytics - Solar Data Platform', description: 'Big Data analytics platform for solar energy prediction using Spark, Kafka, and Hadoop with predictive maintenance', auteur: 'GreenEnergy Analytics', annee: 2024, filiere: 'DATA', departement: 'Data', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 3567000, downloadCount: 145, viewCount: 398, uploadedAt: '2024-04-25', keywords: ['bigdata'], likeCount: 81, likedByMe: false, status: 'APPROVED', uploaderId: 5, uploaderName: 'GreenEnergy Analytics', uploaderRole: 'COMPANY' },
      { id: 6, titre: 'CloudPro Enterprise - Infrastructure as Code', description: 'Multi-cloud infrastructure deployment using Kubernetes, Terraform with auto-scaling and disaster recovery', auteur: 'CloudPro Enterprise', annee: 2024, filiere: 'CLOUD', departement: 'Cloud', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 2756000, downloadCount: 178, viewCount: 512, uploadedAt: '2024-04-20', keywords: ['cloud'], likeCount: 88, likedByMe: false, status: 'APPROVED', uploaderId: 6, uploaderName: 'CloudPro Enterprise', uploaderRole: 'COMPANY' },
      { id: 7, titre: 'DevOpsFlow - CI/CD Automation', description: 'Continuous integration and deployment pipeline with automated testing, security scanning, and progressive rollouts', auteur: 'DevOpsFlow', annee: 2024, filiere: 'DEVOPS', departement: 'DevOps', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 2345000, downloadCount: 201, viewCount: 634, uploadedAt: '2024-04-15', keywords: ['devops'], likeCount: 84, likedByMe: false, status: 'PENDING', uploaderId: 7, uploaderName: 'DevOpsFlow', uploaderRole: 'COMPANY' },
      { id: 8, titre: 'NetworkGuard - Enterprise Security', description: 'Zero-Trust network security architecture with VPN, end-to-end encryption, and advanced threat detection', auteur: 'NetworkGuard', annee: 2024, filiere: 'RESEAU', departement: 'Network', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 3012000, downloadCount: 167, viewCount: 451, uploadedAt: '2024-04-10', keywords: ['security'], likeCount: 79, likedByMe: false, status: 'APPROVED', uploaderId: 8, uploaderName: 'NetworkGuard', uploaderRole: 'COMPANY' },
      { id: 9, titre: 'SmartCity Solutions - IoT Platform', description: 'Urban IoT sensors and management system for traffic, environmental monitoring, and public services optimization', auteur: 'SmartCity Solutions', annee: 2024, filiere: 'GL', departement: 'GL', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 2876000, downloadCount: 192, viewCount: 589, uploadedAt: '2024-04-05', keywords: ['iot'], likeCount: 86, likedByMe: false, status: 'APPROVED', uploaderId: 9, uploaderName: 'SmartCity Solutions', uploaderRole: 'COMPANY' },
      { id: 10, titre: 'ChainTrace Innovation - Supply Chain', description: 'Blockchain-based product traceability system for supply chain transparency and authenticity verification', auteur: 'ChainTrace Innovation', annee: 2024, filiere: 'GL', departement: 'GL', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 3234000, downloadCount: 156, viewCount: 478, uploadedAt: '2024-03-30', keywords: ['blockchain'], likeCount: 91, likedByMe: false, status: 'APPROVED', uploaderId: 10, uploaderName: 'ChainTrace Innovation', uploaderRole: 'COMPANY' },
      { id: 11, titre: 'NLPVerse - Conversational AI', description: 'Multi-language NLP chatbot using BERT and Transformers for customer support and information retrieval', auteur: 'NLPVerse', annee: 2024, filiere: 'IA', departement: 'IA', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 2987000, downloadCount: 134, viewCount: 401, uploadedAt: '2024-03-25', keywords: ['nlp'], likeCount: 77, likedByMe: false, status: 'PENDING', uploaderId: 11, uploaderName: 'NLPVerse', uploaderRole: 'COMPANY' },
      { id: 12, titre: 'StreamPro Media - Video Platform', description: 'Adaptive video streaming platform with HLS, CDN distribution, and ML-based content recommendations', auteur: 'StreamPro Media', annee: 2024, filiere: 'GL', departement: 'GL', documentUrl: 'data:application/pdf;base64,JVBERi0xLjQK', fileType: 'PDF', fileSize: 4567000, downloadCount: 245, viewCount: 823, uploadedAt: '2024-03-20', keywords: ['video'], likeCount: 98, likedByMe: false, status: 'APPROVED', uploaderId: 12, uploaderName: 'StreamPro Media', uploaderRole: 'COMPANY' }
    ];

    this.allBooks = mockBooks;
    this.displayedBooks = mockBooks.filter(b => b.status === 'APPROVED');
    this.pendingBooks = mockBooks.filter(b => b.status === 'PENDING');
    this.onFilterChange();
  }

  onFilterChange(): void {
    let result = this.displayedBooks.filter(book => {
      const matchesSearch = !this.searchQuery || book.titre.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesFilter = !this.filterFiliere || book.filiere === this.filterFiliere;
      return matchesSearch && matchesFilter;
    });

    this.filteredBooks = result;
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredBooks.length / this.pageSize);
    this.updatePagedBooks();
  }

  updatePagedBooks(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedBooks = this.filteredBooks.slice(start, end);
  }

  downloadBook(book: PfeBook): void {
    const link = document.createElement('a');
    link.href = book.documentUrl;
    link.download = book.titre + '.pdf';
    link.click();
    this.notif.success(this.lang.t('pfe.downloadedSuccess') + book.titre);
  }

  viewBook(book: PfeBook): void {
    this.viewerModal = book;
    book.viewCount++;
    this.pfeService.incrementView(book.id).subscribe();
  }

  closeViewer(): void {
    this.viewerModal = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  submitBook(): void {
    if (this.uploadForm.invalid) return;
    this.notif.success(this.lang.t('pfe.uploadSuccess'));
    this.uploadForm.reset();
    this.showUploadForm = false;
    this.adminTab = 'all';
  }

  approveBook(book: PfeBook): void {
    book.status = 'APPROVED';
    this.pendingBooks = this.pendingBooks.filter(b => b.id !== book.id);
    this.notif.success(this.lang.t('pfe.approvedSuccess'));
  }

  rejectBook(book: PfeBook): void {
    this.pendingBooks = this.pendingBooks.filter(b => b.id !== book.id);
    this.notif.success(this.lang.t('pfe.rejectedSuccess'));
  }

  getTotalDownloads(): number {
    return this.displayedBooks.reduce((sum, b) => sum + b.downloadCount, 0);
  }

  getTotalViews(): number {
    return this.displayedBooks.reduce((sum, b) => sum + b.viewCount, 0);
  }
}
