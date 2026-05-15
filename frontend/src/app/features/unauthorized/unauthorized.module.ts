import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UnauthorizedComponent } from './unauthorized.component';

@NgModule({
  declarations: [UnauthorizedComponent],
  imports: [CommonModule, RouterModule.forChild([{ path: '', component: UnauthorizedComponent }])]
})
export class UnauthorizedModule {}
