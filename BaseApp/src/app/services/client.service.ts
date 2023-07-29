import { Injectable } from '@angular/core';
import { ClientDataService } from "../api/client-data.service";

@Injectable({
    providedIn: 'root'
})

export class ClientService {
    constructor(private clientDataService: ClientDataService) { }

    //Get All Clients
    public getAllClients() {
        return this.clientDataService.getAllClients();
    }

    // //Create Branch
    // public createBranch(data) {
    //     return this.branchDataService.createBranch(data);
    // }

    // //Get Branch By Id
    // public getBranchbyId(branchId) {
    //     return this.branchDataService.getBranchbyId(branchId);
    // }

    // //Update Branch By Id
    // public updateBranchById(updateBranchDataId) {
    //     return this.branchDataService.updateBranchById(updateBranchDataId);
    // }

    // //Enable or Disable Service
    // public enableDisableBranch(id) {
    //     return this.branchDataService.enableDisableBranch(id);
    // }
}