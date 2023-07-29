import { Injectable } from '@angular/core';
import { StaffDataService } from "../api/staff-data.service";

@Injectable({
    providedIn: 'root'
})

export class StaffService {
    constructor(private staffDataService: StaffDataService) { }

    // Get All Staffs
    public getAllStaffs() {
        return this.staffDataService.getAllStaffs();
    }

    //Add New Staff
    public addStaff(data) {
        return this.staffDataService.addStaff(data);
    }

    //Get Staff By Id
    public getStaffById(id) {
        return this.staffDataService.getStaffById(id);
    }

    //Update Staff By Id
    public updateStaff(id, data) {
        return this.staffDataService.updateStaff(id, data);
    }

    //Enable or Disable Staff
    public enableDisableStaff(id) {
        return this.staffDataService.enableDisableStaff(id);
    }
}