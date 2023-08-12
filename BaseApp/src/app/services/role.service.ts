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
    public updateRoleById(updateRoleDataId,id) {
        return this.RoleDataService.updateRoleById(updateRoleDataId,id);
    }

    //Enable or Disable Role
    public enableDisableRole(id) {
        return this.RoleDataService.enableDisableRole(id);
    }

    //delete role 
    public deleteSlot(id,data){
        return this.RoleDataService.deleteSlot(id,data);
    }
}