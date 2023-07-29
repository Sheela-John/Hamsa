
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class BranchDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //Get All Branches
    public getAllBranches(): Observable<any> {
        return this.httpClient.get('branch/get/allBranch').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Create Branch
    public createBranch(data): Observable<any> {
        return this.httpClient.post("branch/", data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)))
    }

    //Get Branch By Id 
    public getBranchbyId(branchId): Observable<any> {
        return this.httpClient.get('branch/' + branchId).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Update Branch By Id
    public updateBranchById(updateBranchDataId): Observable<any> {
        return this.httpClient.put('branch/' + updateBranchDataId._id, updateBranchDataId).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //Enable or Disable Branch
    public enableDisableBranch(id): Observable<any> {
        return this.httpClient.get('branch/enableanddisable/' + id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
}