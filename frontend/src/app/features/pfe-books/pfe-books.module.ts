import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { PfeBooksComponent } from './pfe-books.component';

const routes: Routes = [
  {
    path: '',
    component: PfeBooksComponent
  }
];

@NgModule({
  declarations: [PfeBooksComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes)
  ]
})
export class PfeBooksModule { }
