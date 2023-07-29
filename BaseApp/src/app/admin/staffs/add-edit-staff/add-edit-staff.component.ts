import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffService } from 'src/app/services/staff.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RoleService } from 'src/app/services/role.service';
import { BranchService } from 'src/app/services/branch.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-add-edit-staff',
  templateUrl: './add-edit-staff.component.html',
  styleUrls: ['./add-edit-staff.component.scss']
})

export class AddEditStaffComponent implements OnInit {
  @ViewChild("placesRef") placesRef: GooglePlaceDirective;
  public staffForm: any;
  public isStaffFormSubmitted: boolean = false;
  public roleData: any;
  public roleList: any = [];
  public branchData: any;
  public branchList: any = [];
  public routerData: any;
  public showAddEdit: boolean;
  public formattedAddress: any;
  public branchId: any = [];
  public BranchName: any = [];
  public BranchAddress: any = [];
  public BranchStatus: any = [];
  public BranchDataArr: any = [];
  public branchEnableOrDisable: boolean;
  public BranchNameArr: any = [];
  public roleId: any = [];
  public roleName: any = [];
  public RoleStatus: any = [];
  public RoleDataArr: any = [];
  public RoleNameArr: any = [];
  public Role: any;
  public roleNameArr: any=[];
  addressLongitude: any;
  addressLatitude: any;
  public staffData: any;
 public branchDataList: any;
  roleDataList: any;


  constructor(private router: Router, public staffService: StaffService,private toastr :ToastrService, private fb: FormBuilder,private httpClient:HttpClient,
    public roleService: RoleService, public branchService: BranchService,
    public flashMessageService: FlashMessageService, public route: ActivatedRoute) {
    this.route.params.subscribe((param) => {
      this.routerData = param['id'];
      console.log(param, this.routerData)
    })
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }

  ngOnInit(): void {
    this.initializeStaffForm();
    console.log("this.routerData",this.routerData)
    this.getByStaffId(this.routerData);
   
    // // this.getAllRoles();
    // // this.getAllBranches();
    // this.getAllBranchInBase4App()
    // this.getAllRolebase4App()

    if (this.routerData != undefined) {
      this.getRoleByIdBase4App(this.routerData)
      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;
    }
  }
  // bsConfig:Partial<BsDatepickerConfig> = {
  //   containerClass:'theme-red',
  //   dateInputFormat:'DD MMM YYYY'
  // }

  //Initialize Staff Form
  initializeStaffForm() {
    this.staffForm = this.fb.group({

      empId: ['', Validators.required],
      address: ['', Validators.required],
      staffName: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['',Validators.required],
      staffRole: ['', Validators.required],
      branchId: ['', Validators.required],
      // Address: ['', Validators.required]
    })
  }

  //Navigation for Back Button
  back() {
    this.router.navigateByUrl('admin/staffs')
  }

 
  //Ngx-google Autocomplete --NPM
  options: any = {
    componentRestrictions: { country: ['IND'] }
  }

  handleAddressChange(address: any) {
    console.log("Address Changed", address);
    this.addressLatitude = address.geometry.location.lat()
    this.addressLongitude = address.geometry.location.lng()
    console.log( this.addressLatitude, this.addressLongitude,"lat")
    this.formattedAddress = address.address_components
    this.staffForm.controls['address'].setValue(address.formatted_address)
  }


 
  async addStaffBase4App() {
    this.isStaffFormSubmitted = true;
    const staff = new Parse.Object("Staff");
    const user: Parse.User = new Parse.User();
    staff.set("StaffRole",this.Role)
    staff.set("empId", this.staffForm.value.empId)
    staff.set("Address", this.staffForm.value.address);
    staff.set("StaffName", this.staffForm.value.staffName)
    staff.set("Password", this.staffForm.value.empId)
    staff.set("StaffRole", this.staffForm.value.staffRole)
    staff.set("Email", this.staffForm.value.email);
    staff.set("Phone", this.staffForm.value.phone)
    staff.set("Branch", this.staffForm.value.Branch);
    staff.set("Status", 0);


    user.set("empId", this.staffForm.value.empId)
    user.set("password", this.staffForm.value.empId)
    user.set("username", this.staffForm.value.staffName)
    user.set("phone", (this.staffForm.value.phone))
    user.set("email", this.staffForm.value.email)
    

    try {
      let userResult: Parse.User = await user.signUp();
  if(userResult){
    let result = await staff.save()
  }

      this.flashMessageService.successMessage("Staff Created Successfully", 2);
      this.router.navigateByUrl('admin/staffs')
    } catch (error) {
      this.flashMessageService.errorMessage("Error while Creating Staff", 2);
    }
  }
  //Get All Branch In Base4App
  async getAllBranchInBase4App() {
    const branch = Parse.Object.extend('Branch');
    const query = new Parse.Query(branch);
    try {
      const branchName = await query.find()
      branchName.forEach(element => {
        this.branchId.push(element.id);
      });
      for (const branchData of branchName) {
        this.BranchName.push(branchData.get("BranchName"));
        this.BranchStatus.push(branchData.get("BranchStatus"))
      }
      for (let i = 0; i < this.branchId.length; i++) {
        console.log(this.BranchStatus)
        this.BranchDataArr.push(
          {
            "BranchName": this.BranchName[i],
            "Branchstatus": this.BranchStatus[i],
            "BranchId": this.branchId[i]
          }

        )
      }
      console.log(this.BranchDataArr)
      for (let i = 0; i < this.branchId.length; i++) {
        if (this.BranchStatus[i] == 0)
          this.BranchNameArr.push({
            "BranchName": this.BranchName[i],
            "BranchId": this.branchId[i]
          })
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
      for (const RoleData of RoleName) {
        console.log("RoleData",RoleData.id,RoleData.get("Role"),RoleData.get("RoleStatus"))
        
        this.roleNameArr.push(RoleData.get("StaffRoleName"))
        this.roleName.push(RoleData.get("Role"));
        this.RoleStatus.push(RoleData.get("RoleStatus"))
      }
      for (let i = 0; i < this.roleId.length; i++) {
        this.RoleDataArr.push(
          {
            "Role": this.roleName[i],
            "RoleId": this.roleId[i],
            "status": this.RoleStatus[i],
          }
        )
      }
      for (let i = 0; i < this.roleId.length; i++) {
        console.log(this.RoleStatus[i])
        if (this.RoleStatus[i] == 0) {
          this.RoleNameArr.push({
            "Role": this.roleName[i],
            "RoleId": this.roleId[i],
          })
        }

      }

    }
    catch (error) {
      alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }


  }
  //Base4App  staff by Id
  async getRoleByIdBase4App(id) {
    const staffs = Parse.Object.extend('Staff');
    const query = new Parse.Query(staffs);

    query.equalTo('objectId', id);
    console.log(id)
    try {
      const staff = await query.get(id)
      const empid = staff.get("empId")
      const address = staff.get("Address");
      const staffName = staff.get("StaffName",)
      //const password = staff.get("Password",)
      const staffRole = staff.get("StaffRole")
      const Email = staff.get("Email");
      const phone = staff.get("Phone")
      const Branch = staff.get("Branch");
      
      console.log(address)
      this.staffForm.get("empId").patchValue(empid)
      this.staffForm.get("address").patchValue(address)
      this.staffForm.get('staffName').patchValue(staffName)
      this.staffForm.get("address").patchValue(address)
      this.staffForm.get('staffRole').patchValue(staffRole)
      this.staffForm.get("email").patchValue(Email)
      this.staffForm.get("phone").patchValue(phone)
      this.staffForm.get('Branch').patchValue(Branch)
    }

    catch (error) {
      console.error( error);
    }
  }
  //Base4App  Update staff

  async updateStaffInBase4App() {
    this.isStaffFormSubmitted = true;
    console.log("this.staffForm",this.staffForm.value)
    console.log("objectId",this.routerData,this.staffForm.valid)
     if (this.staffForm.valid) {
    const staff = new Parse.Object("Staff");
    staff.set('objectId', this.routerData);
    console.log(this.routerData)
    staff.set("StaffRoleName",this.Role)
    staff.set("empId", this.staffForm.value.empId)
    staff.set("Address", this.staffForm.value.address);
    staff.set("StaffName", this.staffForm.value.staffName)
    staff.set("Password", this.staffForm.value.password)
    staff.set("StaffRole", this.staffForm.value.staffRole)
    staff.set("Email", this.staffForm.value.email);
    staff.set("Phone", this.staffForm.value.phone)
    staff.set("Branch", this.staffForm.value.Branch);
    staff.set("Status", 0);
    try {
      let result = await staff.save();
      console.log("result",result)
      this.flashMessageService.successMessage("Staff Updated Successfully", 2);
      this.router.navigateByUrl('admin/staffs')
    } catch (error) {
      console.log("error",error)
      this.flashMessageService.errorMessage("Error while Updating Staff", 2);
    }
  }
  }
  //Get All Branch In Base4App
  async getRolebyIdBack4App(e){
    console.log(e.target.value)
    const role = Parse.Object.extend('RolePosition');
    const query = new Parse.Query(role);
  
    query.equalTo('objectId', e.target.value);
   
     try{
      const role = await query.get(e.target.value)
      const Role= role.get('Role')
      const addRole = role.get('AddRole')
      console.log(Role)
      this.Role=Role
        const endTime = role.get('EndTime')
      
    
        // this.roleForm.get('addSlot').patchValue(addRole)
     
     }
    
    catch (error) {
      console.error(error);
    }
  }


  getByStaffId(id)
  {
    console.log("id",id);
    this.staffService.getStaffById(id).subscribe(res=>{
      if(res.status)
      {
        this.staffData=res.data;
        this.staffForm.patchValue({
          empId: this.staffData.empId,
          staffName: this.staffData.staffName,
          branchId: this.staffData.branchId,
          email: this.staffData.email,
          address: this.staffData.address,
          phone: this.staffData.phone,
          staffRole:this.staffData.staffRole
        })
      
      }
      console.log("this.staffData",this.staffData)
    })
    this.getAllBranch();
    this.getAllRole();
  }
  getAllBranch()
  {
    this.branchService.getAllBranches().subscribe(res=>{
      if(res.status)
      {
        console.log(res.data)
        this.branchDataList=res.data;
        console.log("this.branchDataList",this.branchDataList)
      }
    })
  }
  getAllRole()
  {
    this.roleService.getAllRole().subscribe(res=>{
      if(res.status)
      {
        console.log(res.data)
        this.roleDataList=res.data;
        console.log("this.branchDataList",this.roleDataList)
      }
    })
  }
  addStaff() {
    this.isStaffFormSubmitted = false;
    if (this.staffForm.valid) {
     
      var data = this.staffForm.value;
console.log("data",data)
      //save api
      this.staffService.addStaff(data).subscribe((res) => {
        if (res.status) {
          this.flashMessageService.successMessage("Staff Created Successfully");
          this.router.navigateByUrl("admin/staffs");
        }
        else {
          this.flashMessageService.errorMessage("Staff  Failed");
        }
      })
    }
  }
  updateStaffByID() {
    var data = this.staffForm.value;
    console.log(this.routerData,"data",data)
    this.staffService.updateStaff(this.routerData, data).subscribe(res => {
      if (res.status) {
        this.flashMessageService.successMessage("Staff Details Updated Successfully");
        this.router.navigateByUrl('admin/staffs')
      }
    })
  }

  //**************************************************Base4App  API Intergration End***************************************************** */
}