import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobsComponent } from './jobs.component';

@NgModule({
  declarations: [JobsComponent],
  imports: [CommonModule, RouterModule.forChild([{ path: '', component: JobsComponent }])]
})
export class JobsModule {}
