import { Injectable } from '@angular/core';
import { LeaveRequestDataService } from "../api/leaveRequest-data.service";


@Injectable({
    providedIn: 'root'
})

export class LeaveRequestService {
    constructor(private leaveRequestDataService: LeaveRequestDataService) { }

    //Get All Branches
    public getAllleaveRequest() {
        return this.leaveRequestDataService.getAllleaveRequest();
    }
}