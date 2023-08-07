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
    this.getAllRole();
  }

  //getAll Role
  getAllRole() {
    this.roleService.getAllRole().subscribe(res => {
      if (res.status) {
        this.roleList = res.data;
        this.dtTrigger.next(null);
        console.log(this.roleList ,"this.roleList ")
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
    console.log("roleId",roleId)
    this.roleService.enableDisableRole(roleId).subscribe(res => {
      if (res.status) {
        console.log("res.status",res.status)
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
 

  //-----------------------------------ROLE Base4App API INTEGRATION - END -------------------------------------------// 
}