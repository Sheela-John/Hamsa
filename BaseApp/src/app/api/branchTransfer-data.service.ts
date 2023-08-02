
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class BranchTransferDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }


    public createBranchTransfer(data): Observable<any> {
        return this.httpClient.post("branchTransfer/", data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)))
    }
    //Get BranchTransfer By Staff Id 
    public getBranchTransferbyStaffId(staffId): Observable<any> {
        return this.httpClient.get('branchTransfer/getBranchTransferByStaffId/' + staffId).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
    public deleteBranchTransferById(id):Observable<any> {
        return this.httpClient.delete('branchTransfer/deleteBranchTransfer/' + id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
     //Get Branch Transfer By Id 
     public getBranchTransferbyId(id): Observable<any> {
        return this.httpClient.get('branchTransfer/' + id).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
    public updateBranchTransferById(updateBranchDataId): Observable<any> {
        return this.httpClient.put('branchTransfer/' + updateBranchDataId._id, updateBranchDataId).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
}