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
  branchId1: any;
  BranchNameArray: any = [];
  public staffDataArr1: any = [];
  role: any;
  public roleId: any = [];
  public roleName: any = [];
  public addRoleArr: any = [];
  public EndTime: any = [];
  public RoleStatus: any = [];
  public RoleDataArr: any = [];
  RoleArr: any=[];

  constructor(private router: Router, public staffService: StaffService, public flashMessageService: FlashMessageService) {
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
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
        console.log(this.staffList);
        this.dtTrigger.next(null);
      }
    })
  }

  //Navigation Add Staff Form
  addStaffs() {
    this.router.navigateByUrl('admin/addEditStaff');
  }

  //Navigation for Edit Staff Form
  editStaff(id) {
    console.log("id",id);
    this.router.navigateByUrl('admin/addEditStaff/' + id);
  }

  //Navigation for View Staff/BranchTransfer
  viewStaff(id) {
    this.router.navigateByUrl('admin/staff/viewStaff-branchTransfer/' + id);
  }

  //Navigation for branch Transfer
  branchTransfer(id) {

    this.router.navigateByUrl('admin/branch-Transfer/'+id)
  }

  // Enable or Disable Staff         // 0 - enable, 2 - disable (status)
  enableDisableStaff(id) {
    var staffId = id;
    this.staffService.enableDisableStaff(staffId).subscribe(res => {
      if (res.status) {
        if (res.data.status == 0) {
          this.flashMessageService.successMessage("Staff Enabled Successfully", 2);
          this.getAllStaffs();
        }
        if (res.data.status == 2) {
          this.flashMessageService.errorMessage("Staff Disabled Successfully", 2);
          this.getAllStaffs();
        }
      }
      else {
        this.flashMessageService.errorMessage("Error while Creating Staff", 2);
      }
    })
  }
  //**************************************************Base4App  API Intergration Start***************************************************** */
  //getAllStaff Base4App
  async getAllStaffbase4App() {
    const staff = Parse.Object.extend('Staff');
    const query = new Parse.Query(staff);
    

    try {
      const StaffData = await query.find()
      StaffData.forEach(element => {
        console.log(element)
        this.staffId.push(element.id);
      });
      console.log(this.staffId)
      for (const staffs of StaffData) {
        this.empId.push(staffs.get("empId"));
        this.Address.push(staffs.get("Address"));
        this.StaffName.push(staffs.get("StaffName"))
        this.password.push(staffs.get("password"))
        this.Phone.push(staffs.get("Phone"));
        this.Email.push(staffs.get("Email"));
        this.Branch.push(staffs.get("Branch"))
        this.Status.push(staffs.get("Status"))
        this.StaffRole.push(staffs.get("StaffRole"))
      }
      
      
      console.log(this.RoleDataArr)
 

      for (let i = 0; i < this.staffId.length; i++) {
        // this.RoleDataArr.forEach(element => {
        //   console.log(element.RoleId, this.StaffRole[i])
        //   if (element.RoleId == this.StaffRole[i]) {
          const role = Parse.Object.extend('RolePosition');
          const query = new Parse.Query(role);
        
          query.equalTo('objectId', this.StaffRole[i]);
         
           try{
            const role = await query.get(this.StaffRole[i])
            this.RoleArr= role.get('Role')
            console.log( this.RoleArr)
            const addRole = role.get('AddRole')
            console.log(addRole)
              const endTime = role.get('EndTime')   
           }
          
          catch (error) {
            console.error('Error while fetching ToDo', error);
          }
          this.dtTrigger.next(null);
            this.staffDataArr.push(
              {
                "staffId": this.staffId[i],
                "empId": this.empId[i],
                "Address": this.Address[i],
                "StaffName": this.StaffName[i],
                "Password": this.password[i],
                "StaffRole": this.RoleArr,
                "Email": this.Email[i],
                "Phone": this.Phone[i],
                "Branch": this.Branch[i],
                "Status": this.Status[i],
          //     }
          //   )
          // }
        });
      }
      console.log(this.staffDataArr)
      this.staffDataArr.forEach(elementbranch => {
        this.branchId1 = elementbranch.Branch
        console.log(this.branchId1)
      });
    }
    catch (error) {
      alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }

  }
  // Enable or Disable Staff base4App        // 0 - enable, 2 - disable (status)
  async enableDisableStaffInBase4App(id) {
    const staff = Parse.Object.extend('Staff');
    const query = new Parse.Query(staff);
    query.equalTo('objectId', id);
    console.log(id)
    try {
      const staff = await query.get(id);
      this.staffStatusEnableAndDisable = staff.get("Status");
      console.log(this.staffStatusEnableAndDisable, 'bf')
      this.staffStatusEnableAndDisable = (this.staffStatusEnableAndDisable == 0) ? 2 : 0
      console.log(this.staffStatusEnableAndDisable, 'af')
      staff.set("Status", this.staffStatusEnableAndDisable);
      let result = await staff.save()
      staff.set("Status", this.staffStatusEnableAndDisable);
      console.log(this.staffStatusEnableAndDisable)
      const statusStaff = staff.get("Status");
      if (statusStaff == 0) {
        this.flashMessageService.successMessage("staff Enabled Successfully", 2);
        window.location.reload()
      }
      if (statusStaff == 2) {
        this.flashMessageService.errorMessage("staff Disabled Successfully", 2);
        window.location.reload()
      }
    }
    catch (error) {
      this.flashMessageService.errorMessage("Error   ", 2);
    }

  }
  //Get All Branch In Base4App
  async getAllBranchInBase4App() {
    const branch = Parse.Object.extend('Branch');
    const query = new Parse.Query(branch);

    try {
      const branchName = await query.find()
      console.log(branchName)
      branchName.forEach(element => {
        this.branchId.push(element.id);

      });
      for (const branchData of branchName) {
        console.log(branchData)
        this.BranchName.push(branchData.get("BranchName"));

      }
      for (let i = 0; i < this.branchId.length; i++) {

        this.BranchDataArr.push(
          {
            "BranchName": this.BranchName[i],
            "BranchId": this.branchId[i]
          }

        )
        console.log(this.BranchDataArr)
        console.log(this.staffDataArr.length)

        this.BranchDataArr.forEach(element => {
          this.staffDataArr.forEach(stelement => {
            console.log(element.BranchName)
            console.log(stelement.Branch
            )
            if (element.BranchId == stelement.Branch) {
              this.BranchNameArr.push(element.BranchName)
            }
            console.log(this.BranchNameArr)

          });
        });
        for (let i = 0; i < this.staffId.length; i++) {
          this.role = this.StaffRole[i]

          this.staffDataArr1.push(
            {
              "staffId": this.staffId[i],
              "empId": this.empId[i],
              "Address": this.Address[i],
              "StaffName": this.StaffName[i],
              "Password": this.password[i],
              "StaffRole": this.StaffRole[i],
              "Email": this.Email[i],
              "Phone": this.Phone[i],
              "Branch": this.BranchNameArr[i],
              "Status": this.Status[i],
            }
          )
        }
        console.log(this.staffDataArr1)

      }

    }
    catch (error) {
      alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }

  }
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



      for (let i = 0; i < this.roleId.length; i++) {

        this.RoleDataArr.push(
          {
            "Role": this.roleName[i],
            "addRole": this.addRoleArr[i],
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


  //**************************************************Base4App  API Intergration End***************************************************** */
}