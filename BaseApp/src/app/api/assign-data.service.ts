
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class AssignDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //save Client
    public createAssignServiceClient(data): Observable<any> {
        return this.httpClient.post("assignService/", data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)))
    }

    //getAll all Client
    public getAllAssignServiceAllClient(): Observable<any> {
        return this.httpClient.get('assignService/allAssignedServices/allServices').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //getAll Client by Id 
    public getAllAssignServiceClientbyId(id): Observable<any> {
        return this.httpClient.get('assignService/' + id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //save Branch
    public createAssignServiceBranch(data): Observable<any> {
        return this.httpClient.post("assignService/branch", data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)))
    }

    //getAll all Branch
    public getAllAssignServiceAllBranch(): Observable<any> {
        return this.httpClient.get('assignService/allAssignedServices/allBranches').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //getAll Branch by Id 
    public getAllAssignServiceBranchbyId(id): Observable<any> {
        return this.httpClient.get('assignService/ofBranch/' + id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
    //getAll AssignService by Id 
    public getAssignServiceById(id): Observable<any> {
        return this.httpClient.get('assignService/' + id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
    //Get All Assign Service
    public getAllAssignService(): Observable<any> {
        return this.httpClient.get('assignService/allAssignedServices').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
    //Get All Assign Service
    public getAssignServiceDataByStaffIdAndDate(data): Observable<any> {
        return this.httpClient.post('assignService/getAssignServiceDataByStaffIdAndDate', data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //getSlotByStaffIdAndSlotId
    public getSlotByStaffIdAndSlotId(Data): Observable<any> {
        return this.httpClient.post('assignService/getRoleDetailsByStaffIdAndSlotId',Data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

     //getSlotsForAssignService
     public getSlotsForAssignService(Data): Observable<any> {
        return this.httpClient.post('assignService/getSlotsForAssignService',Data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
}