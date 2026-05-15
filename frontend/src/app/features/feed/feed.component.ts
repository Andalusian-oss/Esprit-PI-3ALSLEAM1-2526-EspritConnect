import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Post } from '../../core/models/models';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-feed',
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Feed</h1>
        <p>What's happening at ESPRIT</p>
      </div>

      <div class="compose">
        <form [formGroup]="postForm" (ngSubmit)="createPost()">
          <textarea formControlName="contenu" placeholder="Share something with your campus..." rows="3"></textarea>
          <div class="compose-footer">
            <button type="submit" class="btn btn-primary" style="width:auto;padding:8px 20px" [disabled]="postForm.invalid">
              Publish
            </button>
          </div>
        </form>
      </div>

      <div *ngIf="posts.length === 0" class="empty">
        <div class="empty-icon">📝</div>
        <p>No posts yet. Be the first!</p>
      </div>

      <div class="post-card" *ngFor="let post of posts">
        <div class="post-header">
          <div class="post-avatar">{{ getInitials(post.userName) }}</div>
          <div class="post-meta">
            <div class="post-author">{{ post.userName }}</div>
            <div class="post-time">{{ post.createdAt | date:'MMM d, h:mm a' }}</div>
          </div>
          <button *ngIf="post.userId === currentUserId" class="btn btn-danger" (click)="deletePost(post)">Delete</button>
        </div>
        <div class="post-body">{{ post.contenu }}</div>
        <div class="post-actions">
          <button class="btn btn-icon" [class.active]="false" (click)="toggleLike(post)">
            ❤ {{ post.likeCount }}
          </button>
          <button class="btn btn-icon" (click)="toggleComments(post)">
            💬 {{ post.commentCount }}
          </button>
        </div>

        <div class="comments-section" *ngIf="expandedPostId === post.id">
          <div class="comment-item" *ngFor="let c of comments[post.id]">
            <div class="comment-avatar">{{ getInitials(c.userName) }}</div>
            <div class="comment-bubble">
              <div class="comment-author">{{ c.userName }}</div>
              {{ c.texte }}
            </div>
          </div>
          <div class="comment-input">
            <input [(ngModel)]="newComment" placeholder="Write a comment..." (keyup.enter)="addComment(post.id)" />
            <button class="btn btn-primary" style="width:auto" (click)="addComment(post.id)">Send</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  postForm: FormGroup;
  expandedPostId: number | null = null;
  comments: { [postId: number]: any[] } = {};
  newComment = '';
  currentUserId: number | null = null;

  constructor(private postService: PostService, private authService: AuthService, private fb: FormBuilder) {
    this.postForm = this.fb.group({ contenu: ['', Validators.required] });
    this.currentUserId = this.authService.getCurrentUser()?.id ?? null;
  }

  ngOnInit(): void { this.loadPosts(); }

  loadPosts(): void {
    this.postService.getAllPosts().subscribe(posts => {
      this.posts = posts;
      this.resolveAuthorNames(posts);
    });
  }

  private resolveAuthorNames(posts: Post[]): void {
    const ids = new Set<number>();
    posts.forEach(p => {
      if (!p.userName || p.userName.startsWith('User #')) {
        ids.add(p.userId);
      }
    });
    
    if (ids.size > 0) {
      this.authService.getUsersByIds(Array.from(ids)).subscribe(users => {
        const nameMap = new Map(users.map(u => [Number(u.id), `${u.prenom} ${u.nom}`]));
        this.posts.forEach(p => {
          const authorId = Number(p.userId);
          if (nameMap.has(authorId)) {
            p.userName = nameMap.get(authorId)!;
          }
        });
      });
    }
  }

  createPost(): void {
    if (this.postForm.invalid) return;
    this.postService.createPost(this.postForm.value).subscribe(() => { this.postForm.reset(); this.loadPosts(); });
  }

  deletePost(post: Post): void { this.postService.deletePost(post.id).subscribe(() => this.loadPosts()); }

  toggleLike(post: Post): void { this.postService.toggleLike(post.id).subscribe(() => this.loadPosts()); }

  toggleComments(post: Post): void {
    if (this.expandedPostId === post.id) { this.expandedPostId = null; }
    else { this.expandedPostId = post.id; this.postService.getComments(post.id).subscribe(c => this.comments[post.id] = c); }
  }

  addComment(postId: number): void {
    if (!this.newComment.trim()) return;
    this.postService.addComment(postId, this.newComment).subscribe(c => {
      if (!this.comments[postId]) this.comments[postId] = [];
      this.comments[postId].push(c);
      this.newComment = '';
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    if (name.startsWith('User #')) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }
}
