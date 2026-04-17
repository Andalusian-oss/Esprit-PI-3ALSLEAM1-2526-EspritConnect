import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Post } from '../../core/models/models';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-feed',
  template: `
    <div class="feed">
      <h2>Feed</h2>

      <!-- Create Post -->
      <form [formGroup]="postForm" (ngSubmit)="createPost()">
        <textarea formControlName="contenu" placeholder="What's on your mind?" rows="3"></textarea>
        <button type="submit" [disabled]="postForm.invalid">Post</button>
      </form>

      <!-- Posts -->
      <div class="post" *ngFor="let post of posts">
        <p>{{ post.contenu }}</p>
        <small>By user #{{ post.userId }} — {{ post.createdAt | date:'short' }}</small>
        <div class="actions">
          <button (click)="toggleLike(post)">❤ {{ post.likeCount }}</button>
          <button (click)="toggleComments(post)">💬 {{ post.commentCount }}</button>
          <button *ngIf="post.userId === currentUserId" (click)="deletePost(post)">🗑</button>
        </div>

        <!-- Comments -->
        <div *ngIf="expandedPostId === post.id">
          <div *ngFor="let c of comments[post.id]">
            <p>{{ c.texte }} <small>— user #{{ c.userId }}</small></p>
          </div>
          <form (ngSubmit)="addComment(post.id)">
            <input [(ngModel)]="newComment" name="comment" placeholder="Add a comment..." />
            <button type="submit">Send</button>
          </form>
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

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.postForm = this.fb.group({ contenu: ['', Validators.required] });
    this.currentUserId = this.authService.getCurrentUser()?.id ?? null;
  }

  ngOnInit(): void { this.loadPosts(); }

  loadPosts(): void {
    this.postService.getAllPosts().subscribe(posts => this.posts = posts);
  }

  createPost(): void {
    if (this.postForm.invalid) return;
    this.postService.createPost(this.postForm.value).subscribe(() => {
      this.postForm.reset();
      this.loadPosts();
    });
  }

  deletePost(post: Post): void {
    this.postService.deletePost(post.id).subscribe(() => this.loadPosts());
  }

  toggleLike(post: Post): void {
    this.postService.toggleLike(post.id).subscribe(() => this.loadPosts());
  }

  toggleComments(post: Post): void {
    if (this.expandedPostId === post.id) {
      this.expandedPostId = null;
    } else {
      this.expandedPostId = post.id;
      this.postService.getComments(post.id).subscribe(c => this.comments[post.id] = c);
    }
  }

  addComment(postId: number): void {
    if (!this.newComment.trim()) return;
    this.postService.addComment(postId, this.newComment).subscribe(c => {
      if (!this.comments[postId]) this.comments[postId] = [];
      this.comments[postId].push(c);
      this.newComment = '';
    });
  }
}
