import { Injectable } from '@angular/core';
import { AssignDataService } from '../api/assign-data.service';

@Injectable({
    providedIn: 'root'
})

export class AssignService {
    constructor(private AssignDataService: AssignDataService) { }

    //save Client
    public createAssignServiceClient(data) {
        return this.AssignDataService.createAssignServiceClient(data);
    }

    //getAll all Client
    public getAllAssignServiceAllClient() {
        return this.AssignDataService.getAllAssignServiceAllClient();
    }

    //getAll Client by Id 
    public getAllAssignServiceClientbyId(id) {
        return this.AssignDataService.getAllAssignServiceClientbyId(id);
    }

    //save Branch
    public createAssignServiceBranch(data) {
        return this.AssignDataService.createAssignServiceBranch(data);
    }

    //getAll allBranch
    public getAllAssignServiceAllBranch() {
        return this.AssignDataService.getAllAssignServiceAllBranch();
    }

    //getAll Branch by Id
    public getAllAssignServiceBranchbyId(id) {
        return this.AssignDataService.getAllAssignServiceBranchbyId(id);
    }

    //getAll Assign Service by Id
    public getAssignServiceById(id) {
        return this.AssignDataService.getAssignServiceById(id);
    }

    //Get All Assign Service
    public getAllAssignService() {
        return this.AssignDataService.getAllAssignService();
    }
    
    public getAssignServiceDataByStaffIdAndDate(data) {
        return this.AssignDataService.getAssignServiceDataByStaffIdAndDate(data);
    }

    //get Slot by staffId and slotId
    public getSlotByStaffIdAndSlotId(Data) {
        return this.AssignDataService.getSlotByStaffIdAndSlotId(Data);
    }

    //get Slots For AssignService
    public getSlotsForAssignService(Data) {
        return this.AssignDataService.getSlotsForAssignService(Data);
    }

    //update Assign Service
    public updateAssignService(data,id){
        return this.AssignDataService.updateAssignService(data,id)
    }
    //getDashboardData
    public getDashboardData(data){
        return this.AssignDataService.getDashboardData(data)
    }
}