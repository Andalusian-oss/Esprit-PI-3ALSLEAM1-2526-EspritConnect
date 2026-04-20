import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MessagesComponent } from './messages.component';

@NgModule({
  declarations: [MessagesComponent],
  imports: [CommonModule, RouterModule.forChild([{ path: '', component: MessagesComponent }])]
})
export class MessagesModule {}
