import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MentoringComponent } from './mentoring.component';

@NgModule({
  declarations: [MentoringComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: MentoringComponent }])
  ]
})
export class MentoringModule {}
