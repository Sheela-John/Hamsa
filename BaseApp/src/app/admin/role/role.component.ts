import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { RoleService } from 'src/app/services/role.service';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})

export class RoleComponent implements OnInit {
  public roleList: any;
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public roleId: any = [];

  public roleName: any = [];
  public startTime: any = [];
  public EndTime: any = [];
  public RoleDataArr: any = [];
  public RoleStatus: any = [];
  public addRoleArr: any = [];
  public RoleStatusEnableAndDisable: any;
  public slotArray: any = [];


  constructor(private router: Router, public roleService: RoleService, public flashMessageService: FlashMessageService) {
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }

  ngOnInit(): void {
    console.log(this.roleList)
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false
    }
    // this.getAllRole();
    this.getAllRolebase4App()
  }

  //getAll Role
  getAllRole() {
    this.roleService.getAllRole().subscribe(res => {
      if (res.status) {
        this.roleList = res.data;
        this.dtTrigger.next(null);
      }
    })
  }

  //Add Button Route
  addRole() {
    this.router.navigateByUrl('admin/addeditrole');
  }

  //Edit button Route
  editrole(id) {
    this.router.navigateByUrl('admin/role/addeditrole/' + id);
  }

  // Enable or Disable Role         // 0 - enable, 2 - disable (status)
  enableDisableRole(id) {
    var roleId = id;
    this.roleService.enableDisableRole(roleId).subscribe(res => {
      if (res.status) {
        if (res.data.status == 0) {
          this.flashMessageService.successMessage("Role Enabled Successfully", 2);
          this.getAllRole();
        }
        if (res.data.status == 2) {
          this.flashMessageService.errorMessage("Role Disabled Successfully", 2);
          this.getAllRole();
        }
      }
      else {
        this.flashMessageService.errorMessage("Error while Creating Role", 2);
      }
    })
  }
  //-----------------------------------ROLE Base4App API INTEGRATION - START -------------------------------------------// 
  //getAll base4App Role
  async getAllRolebase4App() {
    const role = Parse.Object.extend('RolePosition');
    const query = new Parse.Query(role);


    try {
      const RoleName = await query.find()
      console.log(RoleName)
      RoleName.forEach(element => {

        this.roleId.push(element.id);
      });
      console.log(this.roleId)
      console.log(RoleName)
      for (const RoleData of RoleName) {
        console.log(RoleData)
        this.roleName.push(RoleData.get("Role"));
        this.addRoleArr.push(RoleData.get("AddRole"));
        this.EndTime.push(RoleData.get("EndTime"))
        this.RoleStatus.push(RoleData.get("RoleStatus"))
      }

      console.log(this.addRoleArr)

      this.dtTrigger.next(null);
      console.log(this.addRoleArr.length)
      for (let j = 0; j < this.addRoleArr.length; j++) {
        console.log(this.addRoleArr[j].length)
        for (let k = 0; k < this.addRoleArr[j].length; k++) {
            console.log(this.addRoleArr[j])
            this.slotArray.push({
              startTime: this.addRoleArr[j][k].startTime,
              endTime:this.addRoleArr[j][k].endTime,
              slotName:this.addRoleArr[j][k].slotName
            })
            console.log(this.slotArray)
        }
        
      }
       0
      for (let i = 0; i < this.roleId.length; i++) {

    this.RoleDataArr.push(
      {
        "Role": this.roleName[i],
        "addRole":this.addRoleArr[i],
        "RoleId": this.roleId[i],
        "status": this.RoleStatus[i],
      }
    )
   

       


      }
      console.log(this.RoleDataArr)
    }
    catch (error) {
      alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }

  }
  // Enable or Disable Role base4App        // 0 - enable, 2 - disable (status)
  async enableDisableRoleInBase4App(id) {
    const role = Parse.Object.extend('RolePosition');
    const query = new Parse.Query(role);
    query.equalTo('objectId', id);
    console.log(id)
    try {
      const role = await query.get(id);
      this.RoleStatusEnableAndDisable = role.get("RoleStatus");
      console.log(this.RoleStatusEnableAndDisable)
      this.RoleStatusEnableAndDisable = (this.RoleStatusEnableAndDisable == 0) ? 2 : 0
      role.set("RoleStatus", this.RoleStatusEnableAndDisable);
      let result = await role.save()
      role.set("RoleStatus", this.RoleStatusEnableAndDisable);
      console.log(this.RoleStatusEnableAndDisable)
      const statusRole = role.get("RoleStatus");
      if (statusRole == 0) {
        this.flashMessageService.successMessage("Role Enabled Successfully", 2);
        window.location.reload()
      }
      if (statusRole == 2) {
        this.flashMessageService.errorMessage("Role Disabled Successfully", 2);
        window.location.reload()
      }
    }
    catch (error) {
      this.flashMessageService.errorMessage("Error   ", 2);
    }

  }

  //-----------------------------------ROLE Base4App API INTEGRATION - END -------------------------------------------// 
}