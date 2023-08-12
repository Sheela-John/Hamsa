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
  public isdeleted: any = [];
  public slotId: any;
  public slotdata: any = [];
  public roleData: any;
  public isAddSlot: boolean = false;
  public showdelete: boolean = false;
  showDuplicatesError: any;


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
      this.showAddEdit = false;
    }
  }

  //initializeRoleForm
  initializeroleForm() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      slots: this.fb.array([]),
    });
    this.slotarr = this.roleForm.get('slots') as FormArray
    if (this.slotarr.length == 0) {

      this.showdelete = true
    }
    console.log(this.slotarr.length)
  }

  //initializeAddSlotForm
  initializeAddSlotForm() {
    return this.fb.group({
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      slotName: ['', [Validators.required]],
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
    const slotData = this.roleForm.value.slots
    if (this.roleForm.valid  && !this.checkForDuplicateItems(slotData)) {
      var data = this.roleForm.value;
      this.RoleService.createRole(data).subscribe((res) => {
        if (res.status) {
          this.flashMessageService.successMessage("Role Created Successfully", 2);
          this.router.navigateByUrl("admin/role");
        }
        else {
          this.flashMessageService.errorMessage(res.message, 2);
        }
      })
    }
  }

  //save slot
  saveSlot() {
    this.isAddSlot = true;
    this.slotarr.push(this.initializeAddSlotForm());
  }

  //get-patch Role by Id
  getRolebyId(id) {
    this.RoleService.getRolebyId(id).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.status) {
        this.roleDatavalue = res.data
        console.log("this.roleDatavalue",this.roleDatavalue)
        this.roleForm.controls['name'].patchValue(this.roleDatavalue.name);
        for (let i = 1; i < this.roleDatavalue.slots.length; i++) {
          this.slotarr.push(this.initializeAddSlotForm());
          console.log(this.slotarr.length,"slotsss")
          if (this.slotarr.length != 1) {
            this.showdelete = false
          }
        }
        for (let j = 0; j < this.roleDatavalue.slots.length; j++) {
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
    var data;
    this.RoleService.getRolebyId(this.routerData).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.status) {
        this.roleData = res.data;
        // this.slotdata = [];
        for (let i = 0; i < this.roleForm.controls['slots'].value.length; i++) {
          // this.roleForm.controls['slots'].value.forEach(data => {
            this.slotdata.push({
              slotName: this.roleForm.controls['slots'].value[i].slotName,
              startTime: this.roleForm.controls['slots'].value[i].startTime,
              endTime: this.roleForm.controls['slots'].value[i].endTime,
              isDeleted: 0,
              slotId: (this.roleData.slots[i] != undefined) ? this.roleData.slots[i]._id : ""
            })
          // })
        }
        console.log(" this.slotdata:",  this.slotdata);
        data = {
          name: this.roleForm.controls['name'].value,
          slots: this.slotdata,
        }
        const slotData = this.roleForm.value.slots
        if (this.roleForm.valid  && !this.checkForDuplicateItems(slotData)) {
          console.log("data", data)
          this.RoleService.updateRoleById(data, this.routerData).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
            if (res.status) {
              this.flashMessageService.successMessage('Role Updated Sucessfully', 2);
              this.router.navigateByUrl("admin/role");
            }
            else this.flashMessageService.errorMessage(res.message, 2);
          },
            error => {
              this.flashMessageService.errorMessage('Role Updation failed!', 2);
            })
        }
      }
    })
   
   
  }

  //RemoveSlot
  RemoveSlot(i) {
    if (this.routerData != undefined) {
      const control = <FormArray>this.roleForm.controls['slots'];
      var id = this.routerData;
      var slotname = this.roleForm.controls['slots'].value[i].slotName.toUpperCase()
      console.log("slotname:", slotname);
      this.roleDatavalue.slots.forEach(element => {
        var eleSlotName = element.slotName.toUpperCase()
        console.log("sdfs:", slotname, eleSlotName)
        if (slotname == eleSlotName) {
          console.log("yes")
          // this.slotId = element._id
          var data = {
            slotId: element._id
          }
          this.RoleService.deleteSlot(id, data).subscribe(res => {
            if (res.status) {
              control.removeAt(i);
              console.log("control.length",control.length)
              if (control.length == 1) {
                this.showdelete = true
              }
              this.flashMessageService.successMessage("Slot deleted successfully", 2);
              // if (control.length == 1) {
              //   this.showdelete = true
              // }
              // this.getRolebyId(this.routerData)
            }
          })
        }
       
      });
      if(this.isAddSlot && this.roleForm.controls['slots'].value[i].endTime == '' || 
        this.roleForm.controls['slots'].value[i].slotName == '' ||
       this.roleForm.controls['slots'].value[i].startTime == '' ) {
        control.removeAt(i);
        console.log("control.length",control.length)
        if (control.length == 1) {
          this.showdelete = true
        }
      }
    }
    else {
      const control = <FormArray>this.roleForm.controls['slots'];
      control.removeAt(i);
      console.log("control.length",control.length)
      if (control.length == 1) {
        this.showdelete = true
      }
    }
  }

   //to detect duplicate
   checkForDuplicateItems(array) {
    var hash = Object.create(null);
    this.showDuplicatesError = array.some(function (a) {
      return a.slotName.toUpperCase() && (hash[a.slotName.toUpperCase()] || !(hash[a.slotName.toUpperCase()] = true));
    });
    if (this.showDuplicatesError) {
      this.flashMessageService.errorMessage('slot Name should not contain duplicate!', 2);
    }
    return this.showDuplicatesError;
  }

  //-----------------------------------CLIENT API INTEGRATION - END -------------------------------------------//

  //back Route
  addeditForm() {
    this.router.navigateByUrl('admin/role')
  }

  //-----------------------------------ROLE API INTEGRATION - END -------------------------------------------// 
}
