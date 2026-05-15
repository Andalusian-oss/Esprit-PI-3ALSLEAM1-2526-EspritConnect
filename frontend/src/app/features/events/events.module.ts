import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventsComponent } from './events.component';

@NgModule({
  declarations: [EventsComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild([{ path: '', component: EventsComponent }])]
})
export class EventsModule {}
