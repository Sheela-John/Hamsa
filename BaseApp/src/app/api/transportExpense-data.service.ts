
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class TransportExpenseDataService {
    constructor(private router: Router, private httpClient: HttpClient) { }

    //Add Travel Expense
    public addtravelExpense(data): Observable<any> {
        return this.httpClient.post('travelAllowance/', data).pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }
 //getAll Travel Expense
    public getAlltravelExpense(): Observable<any> {
        return this.httpClient.get('travelAllowance/get/alltravelAllowance').pipe(tap(res => {
            return res;
        }), catchError(error => throwError(error)));
    }

    //get Travel Exoense by Id
  public gettravelExpensebyId(travelAllowanceId): Observable<any> {
    return this.httpClient.get('travelAllowance/' + travelAllowanceId).pipe(tap(res => {
      return res;
    }), catchError(error => throwError(error)));
  }
  
  //Update Role By Id 
  public updatetravelExpenseById(updatetravelExpenseDataId): Observable<any> {
    return this.httpClient.put('travelAllowance/' + updatetravelExpenseDataId._id, updatetravelExpenseDataId).pipe(
      tap(res => {
        console.log(res, "Travel Expense Updates");
        return res;
      }),
      catchError(error => throwError(error))
    );
  }
  
}