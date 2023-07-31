
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

    // SaveSettings(data: any) {
    //     throw new Error('Method not implemented.');
    // }
  

    //Get All setting
    public getAllSettings(): Observable<any> {
        return this.httpClient.get('settings/get/allSettings').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }



      //Add New Staff
      public SaveSettings(data): Observable<any> {
        return this.httpClient.post('settings/', data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    
    //Get Staff By Id
    public getSettingsById(id): Observable<any> {
        return this.httpClient.get('settings/'+ id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

  

    //Update Setting
    public updateSetting(id,data): Observable<any> {
        return this.httpClient.put('settings/' +id,data).pipe(tap(res => {
          return res;
        }), catchError(error => throwError(error)));
      }


}