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
  public editEmpId:boolean;
  public roleNameArr: any=[];
  addressLongitude: any;
  addressLatitude: any;
  public staffData: any;
 public branchDataList: any=[];
  roleDataList: any;


  constructor(private router: Router, public staffService: StaffService,private toastr :ToastrService, private fb: FormBuilder,private httpClient:HttpClient,
    public roleService: RoleService, public branchService: BranchService,
    public flashMessageService: FlashMessageService, public route: ActivatedRoute) {
    this.route.params.subscribe((param) => {
      this.routerData = param['id'];
      console.log(param, this.routerData)
    })
  }

  ngOnInit(): void {
    this.initializeStaffForm();
    this.getAllBranch();
    this.getAllRole();
    console.log("this.routerData",this.routerData)
    if (this.routerData != undefined) {
      this.getByStaffId(this.routerData);
      this.showAddEdit = true;
      this.editEmpId=true;
    } else {
      this.showAddEdit = false;
      this.editEmpId=false;
    }
  }
 

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

  getByStaffId(id)
  {
    console.log("id",id);
    this.staffService.getStaffById(id).subscribe(res=>{
      if(res.status)
      {
        this.staffData=res.data;
        console.log("this.staffData",this.staffData.branchId);
        this.staffForm.patchValue({
          empId: this.staffData.empId,
          staffName: this.staffData.staffName,
          branchId: this.staffData.branchId,
          email: this.staffData.email,
          address: this.staffData.address,
          phone: this.staffData.phone,
          staffRole:this.staffData.staffRole
        })
if(this.editEmpId)
{
  this.staffForm.controls['empId'].disable();
}
        // this.editEmpId = (this.staffData.empId != '') ? false : true;
        // if (!this.editEmpId) {
        //   this.staffForm.controls['empId'].setValue(this.staffData.empId);
        // }
      }
      console.log("this.staffData",this.staffForm)
    })
    //this.getAllBranch();
    //this.getAllRole();
  }

  getAllBranch()
  {
    this.branchService.getAllBranches().subscribe(res=>{
      if(res.status)
      {
        console.log(res.data)
       // this.branchDataList=res.data;
        this.branchData = res.data;
        this.branchData.forEach(branchValue => {
          if (branchValue.status == 0) {
            
            this.branchDataList.push(branchValue);
          }
        });
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
  getRolebyId(event)
  {
    var id=event.target.value;
    this.roleService.getRolebyId(id).subscribe(res=>{
      if(res.status)
      {

      }
    })
  }
  addStaff() {
    this.isStaffFormSubmitted = true;
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