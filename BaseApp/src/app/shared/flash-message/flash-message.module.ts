import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashMessageComponent } from './flash-message.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [FlashMessageComponent],
  exports: [FlashMessageComponent]
})

export class FlashMessageModule { }