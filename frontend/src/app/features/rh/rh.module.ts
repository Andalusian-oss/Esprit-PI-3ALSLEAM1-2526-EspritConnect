import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RhDashboardComponent } from './rh-dashboard.component';

@NgModule({
  declarations: [RhDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: RhDashboardComponent }])
  ]
})
export class RhModule {}
