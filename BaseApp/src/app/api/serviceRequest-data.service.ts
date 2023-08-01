
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ServiceRequestDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //Get All setting
    public getAllServiceRequests(): Observable<any> {
        return this.httpClient.get('serviceRequest/get/allserviceRequest').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Update Setting
    public getServiceRequestById(id): Observable<any> {
        return this.httpClient.get('serviceRequest/'+id).pipe(tap(res => {
          return res;
        }), catchError(error => throwError(error)));
      }
}