import { Injectable } from '@angular/core';
import { BranchDataService } from "../api/branch-data.service";

@Injectable({
    providedIn: 'root'
})

export class BranchService {
    constructor(private branchDataService: BranchDataService) { }

    //Get All Branches
    public getAllBranches() {
        return this.branchDataService.getAllBranches();
    }

    //Create Branch
    public createBranch(data) {
        return this.branchDataService.createBranch(data);
    }

    //Get Branch By Id
    public getBranchbyId(branchId) {
        return this.branchDataService.getBranchbyId(branchId);
    }

    //Update Branch By Id
    public updateBranchById(updateBranchDataId) {
        return this.branchDataService.updateBranchById(updateBranchDataId);
    }

    //Enable or Disable Service
    public enableDisableBranch(id) {
        return this.branchDataService.enableDisableBranch(id);
    }
}