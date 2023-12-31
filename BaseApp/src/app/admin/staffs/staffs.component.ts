import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { StaffService } from 'src/app/services/staff.service';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
@Component({
  selector: 'app-staffs',
  templateUrl: './staffs.component.html',
  styleUrls: ['./staffs.component.scss']
})

export class StaffsComponent implements OnInit {
  public staffList: any;
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public staffId: any = [];
  public empId: any = [];
  public Address: any = [];
  public StaffName: any = [];
  public password: any = [];
  public Email: any = [];
  public Phone: any = [];
  public Branch: any = [];
  public Status: any = [];
  public StaffRole: any = [];
  public staffDataArr: any = [];
  public staffStatusEnableAndDisable: any;
  public branchId: any = [];
  public BranchName: any = [];
  public BranchDataArr: any = [];
  public BranchNameArr: any = [];
  public branchid: any;
  public branchId1: any;
  public BranchNameArray: any = [];
  public staffDataArr1: any = [];
  public role: any;
  public roleId: any = [];
  public roleName: any = [];
  public addRoleArr: any = [];
  public EndTime: any = [];
  public RoleStatus: any = [];
  public RoleDataArr: any = [];
  public RoleArr: any=[];

  constructor(private router: Router, public staffService: StaffService, public flashMessageService: FlashMessageService) {
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false
    }
    console.log("adasda")
     this.getAllStaffs();
  }

  //Get All Staffs
  getAllStaffs() {
    this.staffService.getAllStaffs().subscribe(res => {
      if (res.status) {
        this.staffList = res.data;
        function compare( a, b ) {
          if ( a.staffName < b.staffName ){
            return -1;
          }
          if ( a.staffName > b.staffName ){
            return 1;
          }
          return 0;
        }
        
        this.staffList.sort( compare );
        // console.log(res.data,"normal");
        console.log(this.staffList,"sorted");
        this.dtTrigger.next(null);
      }
    })
  }

  //Navigation Add Staff Form
  addStaffs() {
    this.router.navigateByUrl('admin/staffs/addEditStaff');
  }

  //Navigation for Edit Staff Form
  editStaff(id) {
    console.log("id",id);
    this.router.navigateByUrl('admin/staffs/addEditStaff/' + id);
  }

  //Navigation for View Staff/BranchTransfer
  viewStaff(id) {
    this.router.navigateByUrl('admin/staffs/viewStaff/' + id);
  }

  //Navigation for branch Transfer
  branchTransfer(id) {
    this.router.navigateByUrl('admin/staffs/branch-Transfer/'+id)
  }

  // Enable or Disable Staff         // 0 - enable, 2 - disable (status)
  enableDisableStaff(id) {
    var staffId = id;
    this.staffService.enableDisableStaff(staffId).subscribe(res => {
      console.log("res",res.status)
      if (res.status) {
        if (res.data.status == 0) {
          this.flashMessageService.successMessage("Staff Enabled Successfully", 2);
          this.getAllStaffs();
          //this.router.navigateByUrl('admin/staff');
        }
        if (res.data.status == 1) {
          this.flashMessageService.errorMessage("Staff Disabled Successfully", 2);
          this.getAllStaffs();
        }
      }
    })
  }
  
}