import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMaterialTimepickerComponent } from "ngx-material-timepicker";
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from 'src/app/services/role.service';
import { FlashMessageService } from "../../../shared/flash-message/flash-message.service";
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
@Component({
  selector: 'app-add-edit-role',
  templateUrl: './add-edit-role.component.html',
  styleUrls: ['./add-edit-role.component.scss']
})
export class AddEditRoleComponent implements OnInit {
  public roleForm: any;
  @ViewChild("startpicker")
  public ngxMaterialStartTimepicker!: NgxMaterialTimepickerComponent;
  @ViewChild("endpicker")
  public ngxMaterialEndTimepicker!: NgxMaterialTimepickerComponent;
  public startpickerOpened: boolean = false;
  public endpickerOpened: boolean = false;
  public endMinTime: any;
  public isroleFormSubmitted: Boolean = false;
  public routerData: any;
  public showAddEdit: boolean;
  public destroy$ = new Subject();
  public roleDatavalue: any;
  public currentValue: any
  public pastValue: any;
  public diff: number;
  public showError: boolean;
  public slotarr: FormArray;
  public slotNameArr: any=[];
  public startTimeArr: any=[];
  public endTimeArr: any=[];
  public role: any;

  constructor(private fb: FormBuilder, private router: Router, public RoleService: RoleService, private flashMessageService: FlashMessageService, private route: ActivatedRoute,) {
    this.route.params.subscribe((param) => {
      this.routerData = param['id'];
    })
  }

  ngOnInit(): void {
    this.initializeroleForm();
   
    this.slotarr.push(this.initializeAddSlotForm());
    if (this.routerData != undefined) {
      // this.getRolebyId(this.routerData);
      this.getRoleByIdBase4App(this.routerData)
      
      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;

    }
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }

  //initializeRoleForm
  initializeroleForm() {
    this.roleForm = this.fb.group({
      role: ['', [Validators.required]],
     
      // addSlot: this.fb.array([ this.createItem() ]),
      addSlot: this.fb.array([]),
      // startTime: ['', [Validators.required]],
      // endTime: ['', [Validators.required]],
      // slotName:['', [Validators.required]]
  
     
    });
    this.slotarr = this.roleForm.get('addSlot') as FormArray
  }


  initializeAddSlotForm() {
    return this.fb.group({
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      slotName:['', [Validators.required]]
    });
  }
  ngOnDestroy() {
    if (this.startpickerOpened && this.ngxMaterialStartTimepicker)
      this.ngxMaterialStartTimepicker.close();
    if (this.endpickerOpened && this.ngxMaterialEndTimepicker)
      this.ngxMaterialEndTimepicker.close();
  }

  //-----------------------------------ROLE API INTEGRATION - START -------------------------------------------// 

  //save Role
  saveRole() {
    this.isroleFormSubmitted = true;
    console.log(this.roleForm.value, "value")
    if (this.roleForm.valid) {
      var data = {
        role: this.roleForm.value.role,
        startTime: this.roleForm.value.startTime,
        endTime: this.roleForm.value.endTime
      }
      console.log("data", data)
      this.RoleService.createRole(data).subscribe((res) => {
        if (res.status) {
          this.flashMessageService.successMessage("Role Created Successfully", 2);
          this.router.navigateByUrl("admin/role");
        }
        else {
          this.flashMessageService.errorMessage("Role Created failed!", 2);
        }
      })
    }
  }

  //get-patch Role by Id
  getRolebyId(id) {
    this.RoleService.getRolebyId(id).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.status) {
        this.roleDatavalue = res.data
        this.roleForm.controls['role'].patchValue(this.roleDatavalue.role);
        // this.roleForm.controls['startTime'].patchValue(this.roleDatavalue.startTime);
        // this.roleForm.controls['endTime'].patchValue(this.roleDatavalue.endTime);
      }
    })
  }
  enableEndTIme(event) {
    console.log(event,"event")
    this.endMinTime = event;
    console.log("this.endMinTime",this.endMinTime)
  }
  //Update Role
  updateRole(){
    this.isroleFormSubmitted = true;
    this.showError = false;
    this.roleForm.value._id = this.routerData;
    var data = {
      _id: this.routerData,
      role: this.roleForm.controls.role.value,
      startTime: this.roleForm.controls.startTime.value,
      endTime: this.roleForm.controls.endTime.value,
    }
    if (this.roleForm.valid) {
      this.RoleService.updateRoleById(data).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res.status) {      
         this.flashMessageService.successMessage('Role Updated Sucessfully', 2);
          this.router.navigateByUrl("admin/role");
        }
        else this.flashMessageService.errorMessage(res.err.message, 2);
      },
        error => {
          this.flashMessageService.errorMessage('Role Updation failed!', 2);
        })
    }
  }

  //-----------------------------------CLIENT API INTEGRATION - END -------------------------------------------//

  //back Route
  addeditForm() {
    this.router.navigateByUrl('admin/role')
  }
 //-----------------------------------ROLE API INTEGRATION - START -------------------------------------------// 
 //save Role
 async saveRoleBase4App(){

  console.log(this.roleForm.value)
  console.log(this.initializeAddSlotForm().value)
  const roleFormValue=this.roleForm.value.addSlot
 
  
  this. role = new Parse.Object("RolePosition");
  this.role.set("Role", this.roleForm.value.role)
   this.role.set("AddRole",this.roleForm.value.addSlot)
   this. role.set("RoleStatus", 0);
  

  try {
    let result = await  this.role.save()

    this.flashMessageService.successMessage("Role Created Successfully", 2);
    this.router.navigateByUrl('admin/role')
  } catch (error) {
    this.flashMessageService.errorMessage("Error while role Service", 2);
  }
 }
   //Base4App  Role by Id
   async getRoleByIdBase4App(id){
    // console.log(this.roleForm.get('slotName')['controls'])
    const role = Parse.Object.extend('RolePosition');
    const query = new Parse.Query(role);
  
    query.equalTo('objectId', id);
   
     try{
      const role = await query.get(id)
      const Role= role.get('Role')
      const addRole = role.get('AddRole')
      console.log(addRole)
        const endTime = role.get('EndTime')
        for (let i = 1; i < addRole.length; i++) {
          this.slotarr.push(this.initializeAddSlotForm())
        }
        for (let j = 0; j < addRole.length; j++) {
          var addslot = this.roleForm.get('addSlot') as FormArray;
          addslot.at(j).patchValue(addRole[j])
        }
        this.roleForm.get('role').patchValue(Role)
        // this.roleForm.get('addSlot').patchValue(addRole)
     
     }
    
    catch (error) {
      console.error('Error while fetching ToDo', error);
    }
  }
  //Base4App  Update Role 
   
   async updateServiceInBase4App() {
    console.log(this.roleForm.value)
    console.log(this.initializeAddSlotForm().value)
    this .role = new Parse.Object("RolePosition");
    this.role.set('objectId', this.routerData);
    this.role.set("Role", this.roleForm.value.role)
    this.role.set("AddRole",this.roleForm.value.addSlot)
    this. role.set("RoleStatus", 0);
    try {
      let result = await this.role.save();
      this.flashMessageService.successMessage("Role Updated Successfully", 2);
      this.router.navigateByUrl('admin/role')
    } catch (error) {
      this.flashMessageService.errorMessage("Error while Updating Service", 2);
    }
  }
  roleAddSlot(empIndex: number): FormArray {
    return this.roleForm()
      .at(empIndex)
      .get('addSlot') as FormArray;
  }
  saveSlotBack4App(){
    this.slotarr.push(this. initializeAddSlotForm());
    this.isroleFormSubmitted=true
  }
  RemoveSlot(i){
    const control = <FormArray>this.roleForm.controls['addSlot'];
      control.removeAt(i);
  }
 
  //-----------------------------------ROLE API INTEGRATION - END -------------------------------------------// 
}
