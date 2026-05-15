import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyDashboardComponent } from './company-dashboard.component';

@NgModule({
  declarations: [CompanyDashboardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: CompanyDashboardComponent }])
  ]
})
export class CompanyModule {}
