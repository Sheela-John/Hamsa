
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class ClientDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //Get All Clients
    public getAllClients(): Observable<any> {
        return this.httpClient.get('client/get/allClient').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    // //Create Branch
    // public createBranch(data): Observable<any> {
    //     return this.httpClient.post("branch/", data).pipe(tap(res => {
    //         return res;
    //     }), catchError(error => throwError(error)))
    // }

    //Get Client By Id 
    public getClientbyId(clientId): Observable<any> {
        return this.httpClient.get('client/' + clientId).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    // //Update Branch By Id
    // public updateBranchById(updateBranchDataId): Observable<any> {
    //     return this.httpClient.put('branch/' + updateBranchDataId._id, updateBranchDataId).pipe(tap(res => {
    //         return res;
    //     }), catchError(error => throwError(error)));
    // }

    //Enable or Disable Branch
    public enableDisableClient(id): Observable<any> {
        return this.httpClient.get('client/enableanddisable/' + id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
}