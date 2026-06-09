import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { StatisticsComponent } from './statistics.component';

@NgModule({
  declarations: [AdminDashboardComponent, StatisticsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: AdminDashboardComponent },
      { path: 'statistics', component: StatisticsComponent }
    ])
  ]
})
export class AdminModule {}

