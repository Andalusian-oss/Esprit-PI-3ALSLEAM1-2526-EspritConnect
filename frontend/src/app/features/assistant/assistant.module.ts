import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssistantComponent } from './assistant.component';

@NgModule({
  declarations: [AssistantComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: AssistantComponent }])
  ]
})
export class AssistantModule {}
