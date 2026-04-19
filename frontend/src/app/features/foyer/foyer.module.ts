import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FoyerComponent } from './foyer.component';

@NgModule({
  declarations: [FoyerComponent],
  imports: [CommonModule, RouterModule.forChild([{ path: '', component: FoyerComponent }])]
})
export class FoyerModule {}
