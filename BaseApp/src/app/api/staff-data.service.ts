import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class StaffDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //Get All Staffs
    public getAllStaffs(): Observable<any> {
        return this.httpClient.get('staff/get/allStaff').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Add New Staff
    public addStaff(data): Observable<any> {
        return this.httpClient.post('staff/', data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Get Staff By Id
    public getStaffById(id): Observable<any> {
        return this.httpClient.get('staff/'+ id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Update Staff By Id
    public updateStaff(id, data): Observable<any> {
        return this.httpClient.put('staff/' + id, data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Enable or Disable Staff
    public enableDisableStaff(id): Observable<any> {
        return this.httpClient.get('staff/enableanddisable/' + id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
}