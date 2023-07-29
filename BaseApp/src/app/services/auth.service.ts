import { Injectable } from '@angular/core';
import { AuthDataService } from "../api/auth-data.service";

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    constructor(private authDataService: AuthDataService) { }

    public login(loginData) {
        return this.authDataService.login(loginData);
    }

    public ForgetPassword(data) {
        return this.authDataService.ForgetPassword(data);
    }

    /*3.Verify ResetToken*/
    public verifyResetToken(token) {
        return this.authDataService.verifyResetToken(token);
    }

    /*4.Reset password*/
    public resetPassword(data) {
        return this.authDataService.resetPassword(data);
    }

    /*5.Change Password*/
    public changePassword(data) {
        return this.authDataService.changePassword(data);
    }

    /*6. Forgot Username */
    public requestForgotUsername(data) {
        return this.authDataService.requestForgotUsername(data);
    }
}