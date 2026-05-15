import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JobsComponent } from './jobs.component';

@NgModule({
  declarations: [JobsComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild([{ path: '', component: JobsComponent }])]
})
export class JobsModule {}
