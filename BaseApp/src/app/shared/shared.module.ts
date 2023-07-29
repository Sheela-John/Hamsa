import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlashMessageModule } from './flash-message/flash-message.module';

@NgModule({
  declarations: [
  ],

  imports: [
    CommonModule,
    FlashMessageModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],

  exports: [
  ],

  providers: [
  ]
})

export class SharedModule { }