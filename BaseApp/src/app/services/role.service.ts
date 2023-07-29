import { Injectable } from '@angular/core';
import { RoleDataService } from '../api/role-data.service';

@Injectable({
    providedIn: 'root'
})

export class RoleService {
    constructor(private RoleDataService: RoleDataService) { }

    //Create Role
    public createRole(data) {
        return this.RoleDataService.createRole(data);
    }

     //get All Role
    public getAllRole() {
        return this.RoleDataService.getAllRole();
    }

    //get Role by Id
    public getRolebyId(roleId) {
        return this.RoleDataService.getRolebyId(roleId);
    }

    //Update Role By Id 
    public updateRoleById(updateRoleDataId) {
        console.log(updateRoleDataId, "updatefromclinician")
        return this.RoleDataService.updateRoleById(updateRoleDataId);
    }

    //Enable or Disable Role
    public enableDisableRole(id) {
        return this.RoleDataService.enableDisableRole(id);
    }
}