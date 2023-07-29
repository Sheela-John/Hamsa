
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})

export class AuthDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    public login(loginData): Observable<any> {
        const body = new HttpParams()
            .set('username', loginData.username)
            .set('password', loginData.password)
            .set('role', loginData.role);
        return this.httpClient.post('auth/login', body.toString(), {
            headers: new HttpHeaders()
                .set('Content-Type', 'application/x-www-form-urlencoded')
        }).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    refreshToken(refresh_token): Observable<any> {
        const body = new HttpParams()
            .set('refresh_token', refresh_token);
        return this.httpClient.post("auth/refreshToken", body.toString(),
            {
                headers: new HttpHeaders()
                    .set('Content-Type', 'application/x-www-form-urlencoded')
            }).pipe(
                map((res) => res))
    }

    public handleLogout() {
        localStorage.removeItem('Authorization-Token');
        localStorage.removeItem('role');
        localStorage.clear();
        localStorage.setItem('islogin', 'false');
        this.router.navigateByUrl('/auth/login');
    }

    public ForgetPassword(passwordData): Observable<any> {
        return this.httpClient.post('auth/forgot-password', passwordData).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    /*4.Verifying Reset password token*/
    public verifyResetToken(token): Observable<any> {
        return this.httpClient.post("auth/verify-reset-password-token", { "token": token }).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)))
    }

    /*5.Resetting Password*/
    public resetPassword(data): Observable<any> {
        return this.httpClient.post("auth/reset-password", data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)))
    }

    /*6.Change Password*/
    public changePassword(data): Observable<any> {
        return this.httpClient.post("auth/change-password", data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)))
    }

    /*7.Forgot Username Function*/
    public requestForgotUsername(passwordData): Observable<any> {
        return this.httpClient.post('auth/forgot-username', passwordData).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
}