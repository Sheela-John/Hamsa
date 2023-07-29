
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class SettingDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //Get All setting
    public getAllSetting(): Observable<any> {
        return this.httpClient.get('settings/get/allSettings').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Update Setting
    public updateSetting(data): Observable<any> {
        return this.httpClient.put('settings/', data).pipe(tap(res => {
          return res;
        }), catchError(error => throwError(error)));
      }
}