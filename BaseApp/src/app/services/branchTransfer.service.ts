import { Injectable } from '@angular/core';
import { BranchTransferDataService } from "../api/branchTransfer-data.service";

@Injectable({
    providedIn: 'root'
})

export class BranchTransferService {
    constructor(private branchTransferDataService: BranchTransferDataService) { }

    public createBranchTransfer(data) {
        return this.branchTransferDataService.createBranchTransfer(data);
    }
    //Get BranchTransfer By Staff Id
    public getBranchTransferbyStaffId(staffId) {
        return this.branchTransferDataService.getBranchTransferbyStaffId(staffId);
    }
    public deleteBranchTransferbyId(id) {
        return this.branchTransferDataService.deleteBranchTransferById(id);
    }
    public getBranchTransferbyId(branchId) {
        return this.branchTransferDataService.getBranchTransferbyId(branchId);
    }
    public updateBranchTransferById(updateBranchDataId) {
        return this.branchTransferDataService.updateBranchTransferById(updateBranchDataId);
    }
}