
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ReportDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //Get Activity Report Data
    public getActivityReport(data): Observable<any> {
        return this.httpClient.post('report/activityReport', data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Get Therapist Report Data
    public getTherapistReport(data): Observable<any> {
        return this.httpClient.post('report/therapistReport', data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

      //Get travelexpense Report Data
      public getTravelExpenseReport(data): Observable<any> {
        return this.httpClient.post('report/travelExpenseReport', data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
}