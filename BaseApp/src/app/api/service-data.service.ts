
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ServiceDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //Add New Service
    public addService(data): Observable<any> {
        return this.httpClient.post('services/', data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Get All Service
    public getAllServices(): Observable<any> {
        return this.httpClient.get('services/get/allServices').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Get Service By Id
    public getServiceById(id): Observable<any> {
        return this.httpClient.get('services/'+ id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Update Service By Id
    public updateService(id, data): Observable<any> {
        return this.httpClient.put('services/'+ id, data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Enable or Disable Service
    public enableDisableService(id): Observable<any> {
        return this.httpClient.get('services/enableanddisable/' + id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
}