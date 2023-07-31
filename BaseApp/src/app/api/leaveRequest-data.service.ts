
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class LeaveRequestDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //Get All Branches
    public getAllleaveRequest(): Observable<any> {
        return this.httpClient.get('leaveRequest/get/allleaveRequest').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
}