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
      this.getRolebyId(this.routerData);
      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;}
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }

  //initializeRoleForm
  initializeroleForm() {
    this.roleForm = this.fb.group({
       name: ['', [Validators.required]],
      slots: this.fb.array([]),
    });
    this.slotarr = this.roleForm.get('slots') as FormArray
  }

//initializeAddSlotForm
  initializeAddSlotForm() {
    return this.fb.group({
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      slotName: ['', [Validators.required]]
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
    if (this.roleForm.valid) {
      
      var data =this.roleForm.value;
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

  //save slot
  saveSlot() {
    this.slotarr.push(this.initializeAddSlotForm());
    this.isroleFormSubmitted = true;
  }

  //get-patch Role by Id
  getRolebyId(id) {
    this.RoleService.getRolebyId(id).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.status) {
        this.roleDatavalue = res.data
        this.roleForm.controls['name'].patchValue(this.roleDatavalue.name);
        this.roleDatavalue.slots.forEach(element => {
        });
        for (let i = 1; i < this.roleDatavalue.slots.length; i++){
          this.slotarr.push(this.initializeAddSlotForm());
         }
         for (let j = 0; j < this.roleDatavalue.slots.length; j++){
          this.roleForm.controls['slots'].patchValue(this.roleDatavalue.slots);
         }
      }
    })
  }

  //enableEndTIme
  enableEndTIme(event) {
    this.endMinTime = event;
  }

  //Update Role
  updateRole() {
    this.isroleFormSubmitted = true;
    this.showError = false;
    this.roleForm.value._id = this.routerData;
    var data = {
      _id: this.routerData,
      name: this.roleForm.controls['name'].value,
       slots: this.roleForm.controls['slots'].value,
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

  //RemoveSlot
  RemoveSlot(i) {
    const control = <FormArray>this.roleForm.controls['slots'];
    control.removeAt(i);
  }

  //-----------------------------------CLIENT API INTEGRATION - END -------------------------------------------//

  //back Route
  addeditForm() {
    this.router.navigateByUrl('admin/role')
  }  

  //-----------------------------------ROLE API INTEGRATION - END -------------------------------------------// 
}
