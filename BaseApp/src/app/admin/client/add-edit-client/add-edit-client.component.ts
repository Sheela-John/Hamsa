import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Subject, takeUntil } from 'rxjs';
import { BranchService } from 'src/app/services/branch.service';
import { FlashMessageService } from "../../../shared/flash-message/flash-message.service";
import { NgxMaterialTimepickerComponent } from "ngx-material-timepicker";
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { RRule } from 'rrule';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { StaffService } from 'src/app/services/staff.service';
import { ServiceService } from 'src/app/services/service.service';
import { RoleService } from 'src/app/services/role.service';
import { AssignService } from 'src/app/services/assign.service';
import { ClientService } from 'src/app/services/client.service';

@Component({
  selector: 'app-add-edit-client',
  templateUrl: './add-edit-client.component.html',
  styleUrls: ['./add-edit-client.component.scss']
})

export class AddEditClientComponent implements OnInit {
  @ViewChild("placesRef") placesRef: GooglePlaceDirective;
  public options: any = {
    componentRestrictions: { country: ['IND'] }
  }

  public sessionDuration = [{
    'id': 15,
    'time': "15 mins"
  }, {
    'id': 30,
    'time': "30 mins"
  },
  {
    'id': 45,
    'time': "45 mins"
  }, {
    'id': 60,
    'time': "60 mins"
  }]

  public weekData = [
    { name: 'Mon', value: 'RRule.MO' },
    { name: 'Tue', value: 'RRule.TU' },
    { name: 'Wed', value: 'RRule.WE' },
    { name: 'Thu', value: 'RRule.TH' },
    { name: 'Fri', value: 'RRule.FR' },
    { name: 'Sat', value: 'RRule.SA' },
    { name: 'Sun', value: 'RRule.SU' }
  ];

  public weekArr = {
    enableCheckAll: true,
    singleSelection: false,
    idField: 'value',
    textField: 'name',
    allowSearchFilter: true
  };

  public datePickerConfig: Partial<BsDatepickerConfig>;
  public clientForm: any;
  public isClientFormSubmitted: boolean = false;
  public ngxMaterialStartTimepicker!: NgxMaterialTimepickerComponent;
  public startpickerOpened: boolean = false;
  public sessionArr: FormArray<any>;
  public formattedAddress: any;
  public clientId: any;
  public packageIdFromParam: any;
  public branchList: any = [];
  public staffList: any = [];
  public serviceList: any = [];
  public slots: any = [];
  public startTime: any;
  public endTime: any;
  public showAddSession: boolean = false;
  public addSessionData: any = [];
  public sessionDate: any = [];
  public selectedSlot: any;
  public slotIndexForI: any;
  public slotIndexForJ: any;
  public showAddEdit: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, public BranchService: BranchService,
    private flashMessageService: FlashMessageService, private assignService: AssignService,
    private route: ActivatedRoute, private staffService: StaffService, private roleService: RoleService,
    private serviceService: ServiceService, private clientService: ClientService) {
    this.datePickerConfig = Object.assign({}, { containerClass: 'theme-dark-blue' })
    this.route.params.subscribe((param) => {
      this.clientId = param['clientId'];
      this.packageIdFromParam = param['packageId'];
    })
  }

  ngOnInit(): void {
    if (this.startpickerOpened && this.ngxMaterialStartTimepicker) {
      this.ngxMaterialStartTimepicker.close();
    }
    this.initializeClientForm();
    this.getAllBranch();
    this.getAllStaffs();
    this.getAllServices();
  }

  // Initialize ClientForm
  initializeClientForm() {
    this.clientForm = this.fb.group({
      uhid: ['', Validators.required],
      clientName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      clientAddressLatitude: ['', Validators.required],
      clientAddressLongitude: ['', Validators.required],
      emergencyNumber: [''],
      homeBranchId: ['', Validators.required],
      homeBranchAddress: ['', Validators.required],
      clientHomeBranchLattitude: ['', Validators.required],
      clientHomeBranchLongitude: ['', Validators.required],
      addSession: this.fb.array([this.initializeAddSessionForm()]),
      packageId: [''],
      noOfSession: ['', Validators.required],
      onWeekDay: [''],
      amount: ['', Validators.required],
      staffId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      serviceId: ['', Validators.required],
      typeofTreatment: [''],
      slot: ['', Validators.required],
      duration: ['', Validators.required],
      startTime: [''],
      endTime: ['']
    })
    this.sessionArr = this.clientForm.get('addSession') as FormArray
  }

  // Intialize Session Form
  initializeAddSessionForm() {
    return this.fb.group({
      date: [''],
      slot: [''],
      duration: [''],
      slotStartTime: [''],
      slotEndTime: ['']
    });
  }

  // ngOnDestroy() {
  //   if (this.startpickerOpened && this.ngxMaterialStartTimepicker)
  //     this.ngxMaterialStartTimepicker.close();
  //   if (this.endpickerOpened && this.ngxMaterialEndTimepicker)
  //     this.ngxMaterialEndTimepicker.close();
  // }

  // Back Button - Route
  addeditClientForm() {
    this.router.navigateByUrl('admin/client')
  }

  // Get Latitude and Longitude for Address
  handleAddressChange(address: any) {
    console.log("address.geometry.location.lng():", address.geometry.location.lng());
    this.clientForm.controls['address'].patchValue(address.formatted_address)
    this.clientForm.controls['clientAddressLatitude'].setValue(address.geometry.location.lat());
    this.clientForm.controls['clientAddressLongitude'].setValue(address.geometry.location.lng());
  }

  // // Get Latitude and Longitude for Home Address
  // handleAddressChange1(address: any) {
  //   this.clientForm.controls['homeBranchAddress'].setValue(address.formatted_address);
  // }

  //get All Branch Details for home branch
  getAllBranch() {
    this.BranchService.getAllBranches().subscribe(res => {
      if (res.status) {
        console.log("Data:", res.data);
        var branchData = res.data;
        branchData.forEach(branchValue => {
          console.log("branch:", branchValue);
          if (branchValue.status == 0) {
            this.branchList.push(branchValue);
          }
        });
      }
    })
  }

  // Get Home Branch Address from home branch selected id
  async getBranchbyId(event) {
    var id = event.target.value;
    this.BranchService.getBranchbyId(id).subscribe(res => {
      if (res.status) {
        console.log("res.data", res.data)
        var brandchData = res.data;
        console.log(brandchData)
        this.clientForm.controls['homeBranchAddress'].patchValue(brandchData.branchAddress);
        this.clientForm.controls['clientHomeBranchLattitude'].setValue(brandchData.latitude);
        this.clientForm.controls['clientHomeBranchLongitude'].setValue(brandchData.longitude);
      }
    })
  }

  // Add Session Array based on Number of session count
  addSessionBasedOnSessionCount(eve) {
    this.sessionArr.clear();
    var noOfSession = eve.target.value;
    for (let i = 0; i < noOfSession; i++) {
      this.sessionArr.push(this.initializeAddSessionForm());
    }
  }

  // 
  weekly(event) { }

  // Get all Staff List
  getAllStaffs() {
    console.log("Get all staff");
    this.staffService.getAllStaffs().subscribe(res => {
      console.log("res:", res);
      if (res.status) {
        var staffData = res.data;
        staffData.forEach(staff => {
          console.log("staff:", staff);
          if (staff.status == 0) {
            this.staffList.push(staff);
          }
        })
        console.log(this.staffList);
      }
    })
  }

  // Date Validators
  inputdobValidator(event: any) {
    const pattern = /^\-[0-9]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^\-0-9]/g, "");
    }
  }

  //Get All Services
  getAllServices() {
    this.serviceService.getAllServices().subscribe(res => {
      if (res.status) {
        var serviceData = res.data;
        serviceData.forEach(service => {
          console.log("Service: " + service);
          if (service.status == 0) {
            this.serviceList.push(service);
          }
        })
      }
    })
  }

  //Get all Slot based on staff Id
  getSlotbasedOnStaff(event) {
    var StaffId = event.target.value
    this.staffService.getStaffById(StaffId).subscribe(res => {
      if (res.status) {
        var staffRoleId = res.data.staffRole
        this.roleService.getRolebyId(staffRoleId).subscribe(res => {
          if (res.status) {
            var roleData = res.data
            console.log(roleData, "roleData")
            this.slots = []
            roleData.slots.forEach(element => {
              this.slots.push({
                slotName: element.slotName,
                _id: element._id
              })
            });
          }
        })
      }
    })
  }

  Slot(eve) {
    var id = eve.target.value;
    var data = {
      staffId: this.clientForm.value.staffId,
      slotId: id
    }
    this.assignService.getSlotByStaffIdAndSlotId(data).subscribe(res => {
      if (res.status) {
        this.startTime = res.data.startTime;
        this.endTime = res.data.endTime;
      }
    })
  }

  calculateEndTime(eve) {
    console.log(eve);
    var startDate = this.clientForm.value.startDate;
    var duration = this.clientForm.value.duration;
    var startTime = eve;
    var setHoursInDate = startDate.setHours(startTime.split(':')[0], startTime.split(':')[1]);
    var findEndTime = new Date(new Date(setHoursInDate).getTime() + duration * 60000);
    this.endTime = findEndTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    console.log("endTime:", this.endTime);
    this.clientForm.controls['endTime'].patchValue(this.endTime);
    for (let i = 0; i < this.sessionArr.value.length; i++) {
      var session = this.clientForm.get('addSession') as FormArray;
      session.at(i)['controls']['slotStartTime'].patchValue(startTime);
      session.at(i)['controls']['slotEndTime'].patchValue(this.clientForm.value.endTime);
    }
  }

  dividBySlotTime(eve) { }

  onDateChangeStart(eve) { }

  onDateChangeEnd(eve) { }

  dividingSlot(eve) { }

  addClient() {
    this.showAddSession = true;
    var data = {
      startDate: this.formatDate(this.clientForm.value.startDate),
      endDate: this.formatDate(this.clientForm.value.endDate),
      noOfSession: this.clientForm.value.noOfSession,
      staffId: this.clientForm.value.staffId,
      slotId: this.clientForm.value.slot,
      duration: this.clientForm.value.duration,
      typeOfTreatment: this.clientForm.value.typeOfTreatment,
      weekDaysArr: this.clientForm.value.onWeekDay
    };
    console.log("data:", data);
    this.clientService.createSession(data).subscribe(res => {
      if (res.status) {
        console.log("Res:", res.data);
        this.addSessionData = res.data;
        this.addSessionData.forEach(ele => {
          this.sessionDate.push(ele.date);
        })
      }
    })
  }

  slotSelection(slot, i, j) {
    this.slotIndexForI = i;
    this.slotIndexForJ = j;
    var selectedSlot = slot;
    var selectedStartTime = selectedSlot.split('-')[0];
    var selectedEndTime = selectedSlot.split('-')[1];
    var session = this.clientForm.get('addSession') as FormArray;
    session.at(i)['controls']['slotStartTime'].patchValue(selectedStartTime);
    session.at(i)['controls']['slotEndTime'].patchValue(selectedEndTime);
  }

  formatDate(date) {
    console.log("date", date);
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    console.log("d", d)
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    return [year, month, day].join('-');
  }

  saveClient() {
    this.isClientFormSubmitted = true;
    var data = this.clientForm.value;
    for (let i = 0; i < this.sessionArr.length; i++) {
      data.addSession[i].date = this.formatDate(this.sessionDate[i]),
        data.addSession[i].slot = this.clientForm.value.slot,
        data.addSession[i].duration = this.clientForm.value.duration,
        data.addSession[i].slotStartTime = data.addSession[i].slotStartTime,
        data.addSession[i].slotEndTime = data.addSession[i].slotEndTime
    }
    data.packageId = Math.floor((Math.random() * 100000000000) + 1);
    console.log("Data:", data, this.clientForm);
    if (this.clientForm.valid) {
      this.clientService.createClient(data).subscribe(res => {
        if (res.status) {
          this.flashMessageService.successMessage("Client Added Sucessfully!!!");
          this.router.navigateByUrl('admin/client');
        }
      })
    }
  }

  updateClient() {

  }
}