import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FlashMessageService } from './flash-message.service';

@Component({
  selector: 'app-flash-message',
  templateUrl: './flash-message.component.html',
  styleUrls: ['./flash-message.component.scss']
})
export class FlashMessageComponent implements OnInit {
  displayMessage: boolean;
  message: string;
  isError: boolean;
  type: number;
  flashMessageSubscription: Subscription;

  constructor(private flashService: FlashMessageService) {
    this.displayMessage = false;
  }

  ngOnInit() {
    this.flashMessageSubscription = this.flashService.flashMessage.subscribe(msg => {
      this.displayFlashMessage(msg.msg, msg.isError, msg.type)
    });
  }

  ngOnDestroy() {
    this.flashMessageSubscription.unsubscribe();
  }

  displayFlashMessage(msg: string, isError: boolean, type: number) {
    this.isError = isError;
    this.type = type;
    if (msg && msg != '' && msg != null) {
      this.message = msg;
      this.displayMessage = true;
      if (this.type != 3) {
        setTimeout(() => {
          this.flashService.removeMessage(isError, this.type);
          this.displayMessage = false;
        }, 3000);
      }
    }
  }
}