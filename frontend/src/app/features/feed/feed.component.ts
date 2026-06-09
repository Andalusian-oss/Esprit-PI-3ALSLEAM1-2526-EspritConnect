import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Post, Comment } from '../../core/models/models';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-feed',
  styles: [`
    .feed-root { max-width: 680px; margin: 0 auto; padding: 28px 16px 56px; }

    /* ── Header ── */
    .feed-header { margin-bottom: 24px; }
    .feed-header h1 { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; color:var(--text); }
    .feed-header p  { font-size:14px; color:var(--text-muted); margin-top:3px; }

    /* ── Compose card ── */
    .feed-compose {
      background: var(--dark2); border: 1px solid var(--border);
      border-radius: 16px; padding: 16px; margin-bottom: 20px;
      box-shadow: var(--shadow); transition: border-color 0.2s;
    }
    .compose-trigger {
      display: flex; align-items: center; gap: 12px; cursor: pointer;
    }
    .compose-ph {
      flex: 1; color: var(--text-muted); font-size: 15px;
      background: var(--dark3); border: 1px solid var(--border);
      border-radius: 24px; padding: 10px 18px;
      transition: var(--transition);
    }
    .compose-trigger:hover .compose-ph { border-color: var(--accent-cyan); color: var(--text); }

    .compose-expanded-header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
    .compose-form textarea {
      width: 100%; background: var(--dark3); border: 1px solid var(--border);
      border-radius: 12px; padding: 12px 14px; font-size: 15px;
      color: var(--text); resize: none; outline: none;
      transition: var(--transition); font-family:'DM Sans',sans-serif; line-height:1.6;
      &:focus { border-color:var(--accent-cyan); box-shadow:0 0 0 3px rgba(56,214,199,.1); }
    }
    .compose-photos { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
    .compose-photo-thumb {
      position:relative; width:76px; height:76px;
      img, video { width:100%; height:100%; object-fit:cover; border-radius:8px; border:1px solid var(--border); background:var(--dark3); }
      .remove-photo {
        position:absolute; top:-6px; right:-6px; width:20px; height:20px;
        border-radius:50%; background:var(--red); color:#fff; border:none;
        font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center;
        line-height:1;
      }
    }
    .compose-bar {
      display:flex; align-items:center; gap:8px; margin-top:12px; flex-wrap:wrap;
    }
    .compose-attach {
      display:flex; align-items:center; gap:6px; padding:7px 12px;
      border:1px solid var(--border); border-radius:8px; background:var(--dark3);
      color:var(--text-muted); font-size:13px; cursor:pointer;
      transition:var(--transition);
      .icon { width:15px; height:15px; }
      &:hover { color:var(--accent-cyan); border-color:var(--accent-cyan); }
    }
    .compose-char { margin-left:auto; font-size:12px; color:var(--text-muted); &.over { color:var(--red); } }
    .compose-btns { display:flex; gap:8px; }

    /* ── Shared buttons ── */
    .fd-btn-primary {
      background:var(--red); color:#fff; border:none;
      padding:8px 18px; border-radius:8px; font-size:13px; font-weight:600;
      cursor:pointer; transition:var(--transition); font-family:'DM Sans',sans-serif;
      &:hover:not(:disabled) { background:var(--red-light); transform:translateY(-1px); }
      &:disabled { opacity:.5; cursor:not-allowed; }
    }
    .fd-btn-ghost {
      background:transparent; color:var(--text-muted); border:1px solid var(--border);
      padding:8px 14px; border-radius:8px; font-size:13px;
      cursor:pointer; transition:var(--transition); font-family:'DM Sans',sans-serif;
      &:hover { border-color:var(--border-hover); color:var(--text); }
    }

    /* ── Avatar ── */
    .fd-avatar {
      width:40px; height:40px; border-radius:50%;
      background:linear-gradient(135deg,var(--red),#ff4a5b);
      color:#fff; font-size:14px; font-weight:700;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0; font-family:'Syne',sans-serif; letter-spacing:.5px;
    }
    .fd-avatar-sm { width:32px; height:32px; font-size:12px; }

    /* ── Loading skeletons ── */
    .fd-skeletons { display:flex; flex-direction:column; gap:16px; }
    .fd-skeleton {
      background:var(--dark2); border:1px solid var(--border);
      border-radius:16px; padding:20px;
    }
    .skel-head { display:flex; gap:12px; margin-bottom:14px; }
    .skel-circle { width:40px; height:40px; border-radius:50%; background:var(--dark3); animation:shimmer 1.4s infinite; flex-shrink:0; }
    .skel-lines { flex:1; }
    .skel-row {
      height:11px; background:var(--dark3); border-radius:6px;
      margin-bottom:8px; animation:shimmer 1.4s infinite;
    }
    @keyframes shimmer { 0%,100% { opacity:.5; } 50% { opacity:1; } }

    /* ── Empty state ── */
    .fd-empty {
      text-align:center; padding:64px 24px;
      background:var(--dark2); border:1px solid var(--border); border-radius:16px;
    }
    .fd-empty-icon { font-size:48px; margin-bottom:16px; }
    .fd-empty h3 { font-family:'Syne',sans-serif; font-size:20px; color:var(--text); margin-bottom:8px; }
    .fd-empty p  { font-size:14px; color:var(--text-muted); }

    /* ── Post cards ── */
    .fd-posts { display:flex; flex-direction:column; gap:16px; }
    .fd-card {
      background:var(--dark2); border:1px solid var(--border);
      border-radius:16px; box-shadow:var(--shadow);
      overflow:hidden; transition:border-color .2s;
      animation:cardIn .25s ease;
    }
    .fd-card:hover { border-color:rgba(56,214,199,.2); }
    @keyframes cardIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }

    /* Card header */
    .fd-card-head { display:flex; align-items:center; gap:12px; padding:16px 16px 0; }
    .fd-meta { flex:1; min-width:0; }
    .fd-author { font-weight:600; font-size:14px; color:var(--text); }
    .fd-time { font-size:12px; color:var(--text-muted); margin-top:2px; }

    /* Kebab menu */
    .fd-menu { position:relative; margin-left:auto; }
    .fd-kebab {
      background:none; border:none; color:var(--text-muted); font-size:20px;
      cursor:pointer; padding:4px 8px; border-radius:6px; line-height:1;
      transition:var(--transition);
      &:hover { background:var(--dark3); color:var(--text); }
    }
    .fd-dropdown {
      position:absolute; right:0; top:34px; z-index:100;
      background:var(--dark2); border:1px solid var(--border);
      border-radius:10px; box-shadow:var(--shadow); overflow:hidden; min-width:130px;
      animation:fadeDown .15s ease;
      button {
        width:100%; display:flex; align-items:center; gap:8px;
        padding:10px 14px; background:none; border:none;
        font-size:13px; color:var(--text-muted); cursor:pointer;
        text-align:left; transition:var(--transition); font-family:'DM Sans',sans-serif;
        .icon { width:14px; height:14px; }
        &:hover { background:var(--dark3); color:var(--text); }
        &.danger { color:var(--red); &:hover { background:var(--red-glow); } }
      }
    }
    @keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }

    /* Post body */
    .fd-body {
      padding:12px 16px 4px; font-size:15px; color:var(--text);
      line-height:1.7; white-space:pre-wrap; word-break:break-word;
    }

    /* Inline edit */
    .fd-edit { padding:10px 16px; }
    .fd-edit textarea {
      width:100%; background:var(--dark3); border:1px solid var(--border);
      border-radius:10px; padding:10px 12px; font-size:14px;
      color:var(--text); resize:none; outline:none;
      font-family:'DM Sans',sans-serif; line-height:1.6;
      &:focus { border-color:var(--accent-cyan); }
    }
    .fd-edit-actions { display:flex; gap:8px; margin-top:8px; justify-content:flex-end; }

    /* Photo grid */
    .fd-photos { margin-top:12px; display:grid; gap:2px; }
    .fd-photos img, .fd-photos video { width:100%; object-fit:cover; display:block; background:var(--dark3); }
    .fd-photos.ph-1 img, .fd-photos.ph-1 video { max-height:380px; }
    .fd-photos.ph-multi { grid-template-columns:repeat(2,1fr); }
    .fd-photos.ph-multi img, .fd-photos.ph-multi video { aspect-ratio:1/1; }

    /* Action bar */
    .fd-actions {
      display:flex; align-items:center; gap:2px;
      padding:4px 10px 4px; margin-top:10px;
      border-top:1px solid var(--border);
    }
    .fd-action {
      display:flex; align-items:center; gap:6px;
      background:none; border:none; cursor:pointer;
      padding:8px 12px; border-radius:8px; font-size:13px;
      color:var(--text-muted); transition:var(--transition);
      font-family:'DM Sans',sans-serif; font-weight:500;
      .icon { width:16px; height:16px; }
      &:hover { background:var(--dark3); color:var(--text); }
      &.liked { color:var(--red); }
      &.active { color:var(--accent-cyan); }
    }
    .fd-like-icon { font-size:16px; line-height:1; }

    .fd-reactions {
      display:flex; align-items:center; gap:6px; padding:0 10px 8px;
      border-top:1px dashed var(--border); margin-top:2px;
    }
    .fd-reaction {
      border:1px solid var(--border); background:var(--dark3); color:var(--text-muted);
      font-size:12px; border-radius:999px; padding:4px 10px; cursor:pointer; transition:var(--transition);
    }
    .fd-reaction:hover { border-color:var(--accent-cyan); color:var(--text); }
    .fd-reaction.active { border-color:var(--red); color:#fff; background:var(--red); }

    .fd-share-badge {
      margin: 0 16px 8px;
      display:inline-flex; align-items:center; gap:6px;
      font-size:11px; color:var(--text-muted);
      background:var(--dark3); border:1px solid var(--border);
      border-radius:999px; padding:3px 10px;
    }
    .fd-share-badge .icon { width:13px; height:13px; }

    /* Comments section */
    .fd-comments {
      border-top:1px solid var(--border);
      background:var(--dark3); padding:4px 16px 14px;
      animation:fadeIn .2s ease;
    }
    .fd-comment { display:flex; gap:10px; padding:10px 0; border-bottom:1px solid var(--border); }
    .fd-comment:last-of-type { border-bottom:none; }
    .fd-comment-body { flex:1; min-width:0; }
    .fd-comment-head { display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap; }
    .fd-comment-author { font-weight:600; font-size:13px; color:var(--text); }
    .fd-comment-time   { font-size:11px; color:var(--text-muted); flex:1; }
    .fd-comment-del {
      background:none; border:none; cursor:pointer;
      color:var(--text-muted); padding:2px 4px; border-radius:4px;
      opacity:0; transition:var(--transition);
      .icon { width:13px; height:13px; }
    }
    .fd-comment:hover .fd-comment-del { opacity:1; }
    .fd-comment-del:hover { color:var(--red); background:var(--red-glow); }
    .fd-comment-text { font-size:14px; color:var(--text); line-height:1.5; }
    .fd-no-comments { font-size:13px; color:var(--text-muted); text-align:center; padding:16px 0 8px; }

    .fd-comment-input {
      display:flex; align-items:center; gap:10px; margin-top:10px;
      input {
        flex:1; background:var(--dark2); border:1px solid var(--border);
        border-radius:20px; padding:9px 14px; font-size:13px;
        color:var(--text); outline:none; transition:var(--transition);
        font-family:'DM Sans',sans-serif;
        &:focus { border-color:var(--accent-cyan); }
      }
    }
    .fd-send {
      width:34px; height:34px; border-radius:50%;
      background:var(--red); border:none; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0; transition:var(--transition);
      .icon { width:15px; height:15px; color:#fff; }
      &:hover:not(:disabled) { background:var(--red-light); transform:scale(1.08); }
      &:disabled { opacity:.4; cursor:not-allowed; }
    }

    /* ── Status badges ── */
    .fd-status-badge {
      display:inline-flex; align-items:center; gap:4px;
      font-size:11px; font-weight:600; padding:3px 9px; border-radius:20px;
      margin:0 16px 10px; letter-spacing:.3px;
    }
    .fd-status-pending  { background:rgba(255,180,0,.12); color:#ffb400; border:1px solid rgba(255,180,0,.3); }
    .fd-status-rejected { background:rgba(255,80,80,.1);  color:var(--red); border:1px solid rgba(255,80,80,.3); }

    /* ── Pending notice banner ── */
    .fd-pending-notice {
      background:rgba(255,180,0,.08); border:1px solid rgba(255,180,0,.3);
      border-radius:12px; padding:14px 18px; margin-bottom:20px;
      display:flex; align-items:center; gap:12px;
    }
    .fd-pending-notice .pn-icon { font-size:22px; }
    .fd-pending-notice p { font-size:14px; color:var(--text); margin:0; line-height:1.5; }
    .fd-pending-notice strong { color:#ffb400; }

    @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }
  `],
  template: `
    <div class="feed-root" (click)="onRootClick($event)">

      <!-- ── HEADER ── -->
      <div class="feed-header">
        <h1>{{ lang.t('feed.title') }}</h1>
        <p>{{ lang.t('feed.subtitle') }}</p>
      </div>

      <!-- ── COMPOSE ── -->
      <div class="feed-compose">

        <!-- Collapsed trigger -->
        <div class="compose-trigger" *ngIf="!composeExpanded" (click)="composeExpanded = true">
          <div class="fd-avatar">{{ currentUserInitials }}</div>
          <div class="compose-ph">{{ lang.t('feed.compose') }}</div>
        </div>

        <!-- Expanded form -->
        <div *ngIf="composeExpanded">
          <div class="compose-expanded-header">
            <div class="fd-avatar">{{ currentUserInitials }}</div>
          </div>
          <div class="compose-form">
            <form [formGroup]="postForm" (ngSubmit)="createPost()">
              <textarea formControlName="contenu" [placeholder]="lang.t('feed.mindPlaceholder')" rows="3"></textarea>

              <!-- Photo previews -->
              <div class="compose-photos" *ngIf="uploadedPhotos.length > 0">
                <div class="compose-photo-thumb" *ngFor="let url of uploadedPhotos; let i = index">
                  <img *ngIf="!isVideoUrl(url)" [src]="url" />
                  <video *ngIf="isVideoUrl(url)" [src]="url" muted playsinline preload="metadata"></video>
                  <button type="button" class="remove-photo" (click)="removePhoto(i)">✕</button>
                </div>
              </div>

              <div class="compose-bar">
                <label class="compose-attach">
                  <span class="icon icon-image"></span>
                  <span>{{ uploadingPhoto ? lang.t('common.uploading') : lang.t('feed.media') }}</span>
                  <input type="file" accept="image/*,video/*" multiple (change)="attachPhoto($event)" style="display:none" [disabled]="uploadingPhoto" />
                </label>
                <span class="compose-char" [class.over]="(postForm.value.contenu?.length || 0) > 280">
                  {{ postForm.value.contenu?.length || 0 }}/280
                </span>
                <div class="compose-btns">
                  <button type="button" class="fd-btn-ghost" (click)="cancelCompose()">{{ lang.t('common.cancel') }}</button>
                  <button type="submit" class="fd-btn-primary" [disabled]="(!canPublish()) || saving || uploadingPhoto">
                    {{ saving ? lang.t('feed.publishing') : lang.t('feed.publish') }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- ── POST SUBMITTED NOTICE ── -->
      <div class="fd-pending-notice" *ngIf="postSubmitted">
        <span class="pn-icon">⏳</span>
        <p><strong>Post submitted.</strong> If this was a share, it is published instantly. Original posts may require admin review.</p>
      </div>

      <!-- ── LOADING ── -->
      <div class="fd-skeletons" *ngIf="loading">
        <div class="fd-skeleton" *ngFor="let s of [1,2,3]">
          <div class="skel-head">
            <div class="skel-circle"></div>
            <div class="skel-lines">
              <div class="skel-row" style="width:42%"></div>
              <div class="skel-row" style="width:26%"></div>
            </div>
          </div>
          <div class="skel-row"></div>
          <div class="skel-row" style="width:78%"></div>
          <div class="skel-row" style="width:52%"></div>
        </div>
      </div>

      <!-- ── EMPTY ── -->
      <div class="fd-empty" *ngIf="!loading && posts.length === 0">
        <div class="fd-empty-icon">📝</div>
        <h3>{{ lang.t('feed.emptyTitle') }}</h3>
        <p>{{ lang.t('feed.emptyDesc') }}</p>
      </div>

      <!-- ── POSTS ── -->
      <div class="fd-posts" *ngIf="!loading && posts.length > 0">
        <article class="fd-card" *ngFor="let post of posts">

          <!-- Card header -->
          <div class="fd-card-head">
            <div class="fd-avatar">{{ getInitials(post.userName) }}</div>
            <div class="fd-meta">
              <div class="fd-author">{{ post.userName }}</div>
              <div class="fd-time">{{ post.createdAt | date:'MMM d · h:mm a' }}</div>
            </div>
            <div class="fd-menu" *ngIf="post.userId === currentUserId" data-menu>
              <button class="fd-kebab" (click)="toggleMenu(post.id, $event)">···</button>
              <div class="fd-dropdown" *ngIf="menuOpenId === post.id">
                <button (click)="startEdit(post)">
                  <span class="icon icon-edit"></span> {{ lang.t('common.edit') }}
                </button>
                <button class="danger" (click)="deletePost(post)">
                  <span class="icon icon-trash"></span> {{ lang.t('common.delete') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Status badge for own posts -->
          <div *ngIf="post.userId === currentUserId && post.status && post.status !== 'APPROVED'">
            <span class="fd-status-badge fd-status-pending" *ngIf="post.status === 'PENDING'">⏳ Pending review</span>
            <span class="fd-status-badge fd-status-rejected" *ngIf="post.status === 'REJECTED'">✕ Rejected</span>
          </div>

          <!-- Post body / inline edit -->
          <div class="fd-share-badge" *ngIf="post.originalPostId">
            <span class="icon icon-share"></span>
            <span>{{ lang.t('feed.sharedFrom') }} {{ post.originalAuthorName || 'original author' }}</span>
          </div>
          <div class="fd-body" *ngIf="editingId !== post.id">{{ post.contenu }}</div>
          <div class="fd-edit" *ngIf="editingId === post.id">
            <textarea [(ngModel)]="editContent" rows="3"></textarea>
            <div class="fd-edit-actions">
              <button class="fd-btn-ghost" (click)="cancelEdit()">{{ lang.t('common.cancel') }}</button>
              <button class="fd-btn-primary" (click)="saveEdit(post)" [disabled]="saving || !editContent.trim()">
                {{ saving ? lang.t('common.saving') : lang.t('feed.saveEdit') }}
              </button>
            </div>
          </div>

          <!-- Photos -->
          <div class="fd-photos"
               *ngIf="post.photoUrls?.length"
               [class.ph-1]="post.photoUrls.length === 1"
               [class.ph-multi]="post.photoUrls.length > 1">
            <ng-container *ngFor="let url of post.photoUrls">
              <img *ngIf="!isVideoUrl(url)" [src]="url" loading="lazy" />
              <video *ngIf="isVideoUrl(url)" [src]="url" controls muted playsinline preload="metadata"></video>
            </ng-container>
          </div>

          <!-- Action bar -->
          <div class="fd-actions">
            <button class="fd-action" [class.liked]="post.likedByMe" (click)="toggleLike(post)">
              <span class="fd-like-icon">{{ post.likedByMe ? '❤️' : '🤍' }}</span>
              <span>{{ post.likeCount }}</span>
            </button>
            <button class="fd-action" [class.active]="expandedPostId === post.id" (click)="toggleComments(post)">
              <span class="icon icon-message"></span>
              <span>{{ post.commentCount }}</span>
            </button>
            <button class="fd-action" (click)="sharePost(post)">
              <span class="icon icon-share"></span>
              <span>{{ lang.t('feed.share') }}</span>
            </button>
          </div>
          <div class="fd-reactions">
            <button class="fd-reaction" [class.active]="post.reactions?.userReaction === 'LIKE'" (click)="react(post, 'LIKE')">👍 <span>{{ post.reactions?.likes || 0 }}</span></button>
            <button class="fd-reaction" [class.active]="post.reactions?.userReaction === 'WOW'" (click)="react(post, 'WOW')">😮 <span>{{ post.reactions?.wows || 0 }}</span></button>
            <button class="fd-reaction" [class.active]="post.reactions?.userReaction === 'APPRECIATE'" (click)="react(post, 'APPRECIATE')">🙏 <span>{{ post.reactions?.appreciates || 0 }}</span></button>
            <button class="fd-reaction" [class.active]="post.reactions?.userReaction === 'GG'" (click)="react(post, 'GG')">🎮 <span>{{ post.reactions?.ggs || 0 }}</span></button>
          </div>

          <!-- Comments panel -->
          <div class="fd-comments" *ngIf="expandedPostId === post.id">

            <div class="fd-comment" *ngFor="let c of comments[post.id]">
              <div class="fd-avatar fd-avatar-sm">{{ getInitials(c.userName) }}</div>
              <div class="fd-comment-body">
                <div class="fd-comment-head">
                  <span class="fd-comment-author">{{ c.userName }}</span>
                  <span class="fd-comment-time">{{ c.createdAt | date:'MMM d, h:mm a' }}</span>
                  <button class="fd-comment-del" *ngIf="c.userId === currentUserId" (click)="deleteComment(post.id, c.id)">
                    <span class="icon icon-trash"></span>
                  </button>
                </div>
                <div class="fd-comment-text">{{ c.texte }}</div>
              </div>
            </div>

            <div class="fd-no-comments" *ngIf="comments[post.id]?.length === 0">
              {{ lang.t('feed.noComments') }}
            </div>

            <div class="fd-comment-input">
              <div class="fd-avatar fd-avatar-sm">{{ currentUserInitials }}</div>
              <input
                [(ngModel)]="newComments[post.id]"
                [placeholder]="lang.t('feed.commentPlaceholder')"
                (keyup.enter)="addComment(post.id)" />
              <button class="fd-send" (click)="addComment(post.id)" [disabled]="!((newComments[post.id] || '').trim())">
                <span class="icon icon-send"></span>
              </button>
            </div>

          </div>
        </article>
      </div>
    </div>
  `
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  postForm: FormGroup;
  loading = false;
  saving = false;
  postSubmitted = false;

  composeExpanded = false;
  uploadedPhotos: string[] = [];
  uploadingPhoto = false;

  expandedPostId: number | null = null;
  comments: { [postId: number]: any[] } = {};
  newComments: { [postId: number]: string } = {};

  editingId: number | null = null;
  editContent = '';
  menuOpenId: number | null = null;

  currentUserId: number | null = null;
  currentUserInitials = 'U';

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private fb: FormBuilder,
    public lang: LanguageService
  ) {
    this.postForm = this.fb.group({ contenu: ['', Validators.required] });
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
      this.currentUserInitials = this.getInitials(`${user.prenom} ${user.nom}`);
    }
  }

  ngOnInit(): void { this.loadPosts(); }

  loadPosts(): void {
    this.loading = true;
    this.postService.getAllPosts().subscribe({
      next: (posts: Post[]) => {
        this.posts = posts;
        this.loading = false;
        this.resolveAuthorNames(posts);
      },
      error: () => { this.loading = false; }
    });
  }

  private resolveAuthorNames(posts: Post[]): void {
    const ids = new Set<number>();
    posts.forEach(p => { if (!p.userName || p.userName.startsWith('User #')) ids.add(p.userId); });
    if (!ids.size) return;
    this.authService.getUsersByIds(Array.from(ids)).subscribe((users: { id: number; prenom: string; nom: string }[]) => {
      const map = new Map<number, string>(users.map(u => [Number(u.id), `${u.prenom} ${u.nom}`]));
      this.posts.forEach(p => { if (map.has(Number(p.userId))) p.userName = map.get(Number(p.userId))!; });
    });
  }

  cancelCompose(): void {
    this.composeExpanded = false;
    this.postForm.reset();
    this.uploadedPhotos = [];
  }

  sharePost(post: Post): void {
    if (this.saving) return;
    this.saving = true;
    const sharedContent = `↻ ${post.contenu}`;
    this.postService.createPost({
      contenu: sharedContent,
      photoUrls: post.photoUrls ?? [],
      autoApprove: true,
      originalPostId: post.id,
      originalAuthorName: post.originalAuthorName || post.userName
    }).subscribe({
      next: () => {
        this.saving = false;
        this.postSubmitted = true;
        setTimeout(() => { this.postSubmitted = false; }, 8000);
      },
      error: () => { this.saving = false; }
    });
  }

  attachPhoto(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files?.length) return;
    
    // Validate file types
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
    const invalidFiles: string[] = [];
    const validFiles: File[] = [];
    
    Array.from(files).forEach(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (!ext || !validExtensions.includes(ext)) {
        invalidFiles.push(f.name);
      } else if (f.size > 10 * 1024 * 1024) {  // 10MB limit
        invalidFiles.push(`${f.name} (exceeds 10MB)`);
      } else {
        validFiles.push(f);
      }
    });
    
    if (invalidFiles.length > 0) {
      alert(`Cannot upload: ${invalidFiles.join(', ')}\nAllowed: JPG, PNG, GIF, WebP, MP4, WebM, OGG, MOV (max 10MB each)`);
      return;
    }
    
    if (validFiles.length === 0) return;
    
    this.uploadingPhoto = true;
    const uploads = validFiles.map(f => this.postService.uploadPhoto(f).toPromise());
    Promise.all(uploads).then((results: Array<{ url?: string } | undefined>) => {
      results.forEach(r => { if (r?.url) this.uploadedPhotos.push(r.url); });
      this.uploadingPhoto = false;
    }).catch((err) => { 
      this.uploadingPhoto = false;
      console.error('Upload error:', err);
      
      // Extract error message from response
      let errorMsg = 'Unknown error';
      
      if (err?.error?.message) {
        errorMsg = err.error.message;
      } else if (err?.error?.error) {
        errorMsg = err.error.error;
      } else if (typeof err?.error === 'string') {
        errorMsg = err.error;
      } else if (err?.message) {
        errorMsg = err.message;
      } else if (err?.status) {
        errorMsg = `HTTP ${err.status}: ${err.statusText}`;
      }
      
      alert('Upload failed: ' + errorMsg);
    });
  }

  removePhoto(i: number): void { this.uploadedPhotos.splice(i, 1); }

  createPost(): void {
    if ((!this.canPublish()) || this.saving) return;
    this.saving = true;
    this.postSubmitted = false;
    const payload = { contenu: (this.postForm.value.contenu || '').trim(), photoUrls: this.uploadedPhotos };
    this.postService.createPost(payload).subscribe({
      next: (_post: Post) => {
        this.cancelCompose();
        this.saving = false;
        this.postSubmitted = true;
        // Auto-hide the notice after 8 seconds
        setTimeout(() => { this.postSubmitted = false; }, 8000);
      },
      error: () => { this.saving = false; }
    });
  }

  startEdit(post: Post): void {
    this.editingId = post.id;
    this.editContent = post.contenu;
    this.menuOpenId = null;
  }

  cancelEdit(): void { this.editingId = null; this.editContent = ''; }

  saveEdit(post: Post): void {
    if (!this.editContent.trim() || this.saving) return;
    this.saving = true;
    this.postService.updatePost(post.id, { contenu: this.editContent }).subscribe({
      next: (updated: Post) => { post.contenu = updated.contenu; this.cancelEdit(); this.saving = false; },
      error: () => { this.saving = false; }
    });
  }

  toggleMenu(postId: number, event: Event): void {
    event.stopPropagation();
    this.menuOpenId = this.menuOpenId === postId ? null : postId;
  }

  onRootClick(_event: Event): void { this.menuOpenId = null; }

  deletePost(post: Post): void {
    this.posts = this.posts.filter(p => p.id !== post.id);
    this.menuOpenId = null;
    this.postService.deletePost(post.id).subscribe();
  }

  toggleLike(post: Post): void {
    post.likedByMe = !post.likedByMe;
    post.likeCount += post.likedByMe ? 1 : -1;
    this.postService.toggleLike(post.id).subscribe();
  }

  react(post: Post, reaction: 'LIKE' | 'WOW' | 'APPRECIATE' | 'GG'): void {
    if (!post.reactions) {
      post.reactions = { likes: 0, wows: 0, appreciates: 0, ggs: 0, userReaction: null };
    }
    
    const oldReaction = post.reactions.userReaction;
    
    // Optimistically update UI
    if (oldReaction) {
      switch (oldReaction) {
        case 'LIKE': post.reactions.likes--; break;
        case 'WOW': post.reactions.wows--; break;
        case 'APPRECIATE': post.reactions.appreciates--; break;
        case 'GG': post.reactions.ggs--; break;
      }
    }
    
    if (oldReaction !== reaction) {
      switch (reaction) {
        case 'LIKE': post.reactions.likes++; break;
        case 'WOW': post.reactions.wows++; break;
        case 'APPRECIATE': post.reactions.appreciates++; break;
        case 'GG': post.reactions.ggs++; break;
      }
      post.reactions.userReaction = reaction;
    } else {
      post.reactions.userReaction = null;
    }
    
    this.postService.setReaction(post.id, reaction).subscribe({
      error: () => {
        // Revert on error
        post.reactions!.userReaction = oldReaction;
        if (oldReaction) {
          switch (oldReaction) {
            case 'LIKE': post.reactions!.likes++; break;
            case 'WOW': post.reactions!.wows++; break;
            case 'APPRECIATE': post.reactions!.appreciates++; break;
            case 'GG': post.reactions!.ggs++; break;
          }
        }
        if (oldReaction !== reaction) {
          switch (reaction) {
            case 'LIKE': post.reactions!.likes--; break;
            case 'WOW': post.reactions!.wows--; break;
            case 'APPRECIATE': post.reactions!.appreciates--; break;
            case 'GG': post.reactions!.ggs--; break;
          }
        }
      }
    });
  }

  toggleComments(post: Post): void {
    if (this.expandedPostId === post.id) { this.expandedPostId = null; return; }
    this.expandedPostId = post.id;
    if (!this.comments[post.id]) {
      this.postService.getComments(post.id).subscribe((c: Comment[]) => { this.comments[post.id] = c; });
    }
  }

  addComment(postId: number): void {
    const text = (this.newComments[postId] || '').trim();
    if (!text) return;
    this.postService.addComment(postId, text).subscribe((c: Comment) => {
      if (!this.comments[postId]) this.comments[postId] = [];
      this.comments[postId].push(c);
      this.newComments[postId] = '';
      const post = this.posts.find(p => p.id === postId);
      if (post) post.commentCount++;
    });
  }

  deleteComment(postId: number, commentId: number): void {
    this.comments[postId] = this.comments[postId].filter(c => c.id !== commentId);
    const post = this.posts.find(p => p.id === postId);
    if (post) post.commentCount = Math.max(0, post.commentCount - 1);
    this.postService.deleteComment(commentId).subscribe();
  }

  getInitials(name: string): string {
    if (!name || name.startsWith('User #')) return 'U';
    const parts = name.trim().split(' ');
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }

  isVideoUrl(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url);
  }

  canPublish(): boolean {
    const text = (this.postForm.value.contenu || '').trim();
    return text.length > 0 || this.uploadedPhotos.length > 0;
  }
}
