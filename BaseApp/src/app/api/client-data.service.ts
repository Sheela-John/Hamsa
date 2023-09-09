
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { error } from 'jquery';

@Injectable({
    providedIn: 'root'
})

export class ClientDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //Create Session
    public createSession(data): Observable<any> {
        return this.httpClient.post("client/saveRecurringSession", data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)))
    }

    //Create Client
    public createClient(data): Observable<any> {
        return this.httpClient.post("client/", data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Get Client By Id 
    public getClientbyId(clientId): Observable<any> {
        return this.httpClient.get('client/' + clientId).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Get All Clients
    public getAllClients(): Observable<any> {
        return this.httpClient.get('client/get/allClient').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Update Client
    public updateClient(id, data): Observable<any> {
        console.log("UpdateL:", data);
        return this.httpClient.put('client/' + id, data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

      //Update Client Name ,Address and Phone Number Separately
      public updateClientdetails(id, data): Observable<any> {
        console.log("UpdateL:", data);
        return this.httpClient.put('client/updateClientDetails/' + id, data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //get Details By PackageId
    public getDetailsByPackageId(data): Observable<any> {
        return this.httpClient.post('client/getClientDetailsByPackageId', data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    // Get Assign Service Data By PackageId
    public getAssignServiceByPackageId(data): Observable<any> {
        return this.httpClient.post('client/getAssignServiceByPackageId', data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
}