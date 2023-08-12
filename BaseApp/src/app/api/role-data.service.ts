
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class RoleDataService {
  constructor(private router: Router, private httpClient: HttpClient) { }

  /*create ROLE*/
  public createRole(data): Observable<any> {
    return this.httpClient.post("role/", data).pipe(tap(res => {
      return res;
    }), catchError(error => throwError(error)))
  }

  //get All Role
  public getAllRole(): Observable<any> {
    return this.httpClient.get('role/get/allRole').pipe(tap(res => {
      return res;
    }), catchError(error => throwError(error)));
  }

  //get Role by Id
  public getRolebyId(roleId): Observable<any> {
    return this.httpClient.get('role/' + roleId).pipe(tap(res => {
      return res;
    }), catchError(error => throwError(error)));
  }

  //Update Role By Id 
  public updateRoleById(updateRoleDataId,id): Observable<any> {
    return this.httpClient.put('role/' + id, updateRoleDataId).pipe(tap(res => {
      console.log(res, "iam res in data services")
      return res;
    }), catchError(error => throwError(error)));
  }

  //Enable or Disabl Role
  public enableDisableRole(id): Observable<any> {
    return this.httpClient.get('role/enableanddisable/' + id).pipe(tap(res => {
      return res;
    }), catchError(error => throwError(error)));
  }

  //deleteSlot
  public deleteSlot(id,data): Observable<any> {
    return this.httpClient.put('role/deleteSlot/' + id,data).pipe(tap(res => {
      return res;
    }), catchError(error => throwError(error)));
  }

}