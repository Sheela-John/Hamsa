import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class FlashMessageService {
    private message = new BehaviorSubject({ 'msg': '', 'isError': false, 'type': 1 });
    flashMessage = this.message.asObservable();
    constructor() { }

    //Success Message    
    successMessage(message: string, type?: number) {
        if (!type) {
            type = 2; //This flash message is what we animated to show from below (Type 1 is their default which expands and shrinks)
        }
        this.message.next({ "msg": message, "isError": false, "type": type });
    }

    //Error Message    
    errorMessage(message: string, type?: number) {
        if (!type) {
            type = 2; //This flash message is what we animated to show from below
        }
        this.message.next({ "msg": message, "isError": true, "type": type });
    }

    //Remove Messages  
    removeMessage(isError: boolean, type: number) {
        this.message.next({ "msg": '', "isError": isError, "type": type });
    }
}