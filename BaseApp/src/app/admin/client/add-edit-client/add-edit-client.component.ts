import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, ViewChild } from '@angular/core';
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
  public packageId: any;
  public clientData: any;
  public allDate: any = [];
  public editClientData: boolean = false;
  public showAddPackage: boolean = false;
  public showPackage: boolean = false;
  public packageData: any = [];
  public type: any = [];
  public showEditPackage: boolean = false;
  public hideButton: boolean = false;
  public packageIds: any;
  public minDate: any;
  public hideUpdateButton: boolean = false;
  public clientLatitude: any;
  public clientLongitude: any;
  public showError: boolean = false;
  public wrongLocationError: boolean;
  public isShowable: boolean = true;
  public locationData: any = [];
  public hidesession: Boolean = false
  public edit: boolean;
  public show: boolean = false
  public count: number = 0;
  public showlatti: boolean = false;
  public onchangeaddress: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, public BranchService: BranchService,
    private flashMessageService: FlashMessageService, private assignService: AssignService,
    private route: ActivatedRoute, private staffService: StaffService, private roleService: RoleService,
    private serviceService: ServiceService, private clientService: ClientService) {
    this.datePickerConfig = Object.assign({}, { containerClass: 'theme-dark-blue' })
    this.route.params.subscribe((param) => {
      this.clientId = param['clientId'];
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
    if (this.clientId != undefined) {
      this.getClientById(this.clientId);
      this.showAddPackage = true;
      this.showPackage = true
    }

  }

  // Initialize ClientForm
  initializeClientForm() {
    this.clientForm = this.fb.group({
      uhid: [''],
      clientName: [''],
      phoneNumber: [''],
      email: [''],
      address: [''],
      clientAddressLatitude: [''],
      clientAddressLongitude: [''],
      emergencyNumber: [''],
      homeBranchId: [''],
      homeBranchAddress: [''],
      clientHomeBranchLattitude: [''],
      clientHomeBranchLongitude: [''],
      addSession: this.fb.array([this.initializeAddSessionForm()]),
      packageId: [''],
      noOfSession: [''],
      onWeekDay: [''],
      amount: [''],
      staffId: [''],
      startDate: [''],
      endDate: [''],
      serviceId: [''],
      typeOfTreatment: [''],
      slot: [''],
      duration: [''],
      startTime: [''],
      endTime: ['']
    })
    this.sessionArr = this.clientForm.get('addSession') as FormArray
    this.setvalidator();
    this.clearvalidator()
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

  //phone no validation
  onKeyUp(control) {
    if (this.clientForm.controls[control].phoneNumber) {
      if (control === 'phone') {
        this.showError = true;
      }
    }
  }

  // checkLocation(event) {
  //   if (!(this.locationData.includes(event.item))) {
  //     this.wrongLocationError = true;
  //   }
  //   else {
  //     this.wrongLocationError = false;
  //   }
  // }

  //validation for the slot start time
  setvalidation() {
    for (let i = 0; i < this.sessionArr.value.length; i++) {
      if (this.showAddSession == true) {
        var addSession = this.clientForm.get('addSession') as FormArray
        addSession.at(i)['controls']["slotStartTime"].setValidators([Validators.required]);
        addSession.at(i)['controls']["slotEndTime"].setValidators([Validators.required]);
        addSession.at(i)['controls']["slotStartTime"].updateValueAndValidity();
        addSession.at(i)['controls']["slotEndTime"].updateValueAndValidity();
      }
      else {
        for (let i = 0; i < this.sessionArr.value.length; i++) {
          var addSession = this.clientForm.get('addSession') as FormArray
          addSession.at(i)['controls']["slotStartTime"].clearValidator();
          addSession.at(i)['controls']["slotEndTime"].clearValidator();
          addSession.at(i)['controls']["slotStartTime"].updateValueAndValidity();
          addSession.at(i)['controls']["slotEndTime"].updateValueAndValidity();
        }
      }
    }

  }

  //validation for the edit the client details like address name and phnone number
  setvalidator() {
    this.clientForm.controls["uhid"].setValidators([Validators.required]);
    this.clientForm.controls["uhid"].updateValueAndValidity();
    this.clientForm.controls["clientName"].setValidators([Validators.required]);
    this.clientForm.controls["clientName"].updateValueAndValidity();
    this.clientForm.controls["phoneNumber"].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]);
    this.clientForm.controls["phoneNumber"].updateValueAndValidity();
    this.clientForm.controls["address"].setValidators([Validators.required]);
    this.clientForm.controls["address"].updateValueAndValidity();
    this.clientForm.controls["homeBranchId"].setValidators([Validators.required]);
    this.clientForm.controls["homeBranchId"].updateValueAndValidity();
    this.clientForm.controls["homeBranchAddress"].setValidators();
    this.clientForm.controls["homeBranchAddress"].updateValueAndValidity();
    this.clientForm.controls["noOfSession"].clearValidators();
    this.clientForm.controls["noOfSession"].updateValueAndValidity();
    this.clientForm.controls["onWeekDay"].clearValidators();
    this.clientForm.controls["onWeekDay"].updateValueAndValidity();
    this.clientForm.controls["staffId"].clearValidators();
    this.clientForm.controls["staffId"].updateValueAndValidity();
    this.clientForm.controls["startDate"].clearValidators();
    this.clientForm.controls["startDate"].updateValueAndValidity();
    this.clientForm.controls["endDate"].clearValidators();
    this.clientForm.controls["endDate"].updateValueAndValidity();
    this.clientForm.controls["serviceId"].clearValidators();
    this.clientForm.controls["serviceId"].updateValueAndValidity();
    this.clientForm.controls["typeOfTreatment"].clearValidators();
    this.clientForm.controls["typeOfTreatment"].updateValueAndValidity();
    this.clientForm.controls["slot"].clearValidators();
    this.clientForm.controls["slot"].updateValueAndValidity();
    this.clientForm.controls["duration"].clearValidators();
    this.clientForm.controls["duration"].updateValueAndValidity();
    this.clientForm.controls["startTime"].clearValidators();
    this.clientForm.controls["startTime"].updateValueAndValidity();
    this.clientForm.controls["endTime"].clearValidators();
    this.clientForm.controls["endTime"].updateValueAndValidity();
  }

  // validation for the add session while edit
  clearvalidator() {
    this.clientForm.controls["noOfSession"].setValidators([Validators.required]);
    this.clientForm.controls["noOfSession"].updateValueAndValidity();
    this.clientForm.controls["onWeekDay"].setValidators([Validators.required]);
    this.clientForm.controls["onWeekDay"].updateValueAndValidity();
    this.clientForm.controls["staffId"].setValidators([Validators.required]);
    this.clientForm.controls["staffId"].updateValueAndValidity();
    this.clientForm.controls["startDate"].setValidators([Validators.required]);
    this.clientForm.controls["startDate"].updateValueAndValidity();
    this.clientForm.controls["endDate"].setValidators([Validators.required]);
    this.clientForm.controls["endDate"].updateValueAndValidity();
    this.clientForm.controls["serviceId"].setValidators([Validators.required]);
    this.clientForm.controls["serviceId"].updateValueAndValidity();
    this.clientForm.controls["typeOfTreatment"].setValidators([Validators.required]);
    this.clientForm.controls["typeOfTreatment"].updateValueAndValidity();
    this.clientForm.controls["slot"].setValidators([Validators.required]);
    this.clientForm.controls["slot"].updateValueAndValidity();
    this.clientForm.controls["duration"].setValidators([Validators.required]);
    this.clientForm.controls["duration"].updateValueAndValidity();
    this.clientForm.controls["startTime"].setValidators([Validators.required]);
    this.clientForm.controls["startTime"].updateValueAndValidity();
    this.clientForm.controls["endTime"].setValidators([Validators.required]);
    this.clientForm.controls["endTime"].updateValueAndValidity();
    this.clientForm.controls["uhid"].clearValidators();
    this.clientForm.controls["uhid"].updateValueAndValidity();
    this.clientForm.controls["clientName"].clearValidators();
    this.clientForm.controls["clientName"].updateValueAndValidity();
    this.clientForm.controls["phoneNumber"].clearValidators();
    this.clientForm.controls["phoneNumber"].updateValueAndValidity();
    this.clientForm.controls["address"].clearValidators();
    this.clientForm.controls["address"].updateValueAndValidity();
    this.clientForm.controls["homeBranchId"].clearValidators();
    this.clientForm.controls["homeBranchId"].updateValueAndValidity();
    this.clientForm.controls["homeBranchAddress"].clearValidators();
    this.clientForm.controls["homeBranchAddress"].updateValueAndValidity();
  }

  // validation for the add form
  validation() {
    this.clientForm.controls["uhid"].setValidators([Validators.required]);
    this.clientForm.controls["uhid"].updateValueAndValidity();
    this.clientForm.controls["clientName"].setValidators([Validators.required]);
    this.clientForm.controls["clientName"].updateValueAndValidity();
    this.clientForm.controls["phoneNumber"].setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]);
    this.clientForm.controls["phoneNumber"].updateValueAndValidity();
    this.clientForm.controls["address"].setValidators([Validators.required]);
    this.clientForm.controls["address"].updateValueAndValidity();
    this.clientForm.controls["homeBranchId"].setValidators([Validators.required]);
    this.clientForm.controls["homeBranchId"].updateValueAndValidity();
    this.clientForm.controls["homeBranchAddress"].setValidators();
    this.clientForm.controls["homeBranchAddress"].updateValueAndValidity();
    this.clientForm.controls["noOfSession"].setValidators([Validators.required]);
    this.clientForm.controls["noOfSession"].updateValueAndValidity();
    this.clientForm.controls["onWeekDay"].setValidators([Validators.required]);
    this.clientForm.controls["onWeekDay"].updateValueAndValidity();
    this.clientForm.controls["staffId"].setValidators([Validators.required]);
    this.clientForm.controls["staffId"].updateValueAndValidity();
    this.clientForm.controls["startDate"].setValidators([Validators.required]);
    this.clientForm.controls["startDate"].updateValueAndValidity();
    this.clientForm.controls["endDate"].setValidators([Validators.required]);
    this.clientForm.controls["endDate"].updateValueAndValidity();
    this.clientForm.controls["serviceId"].setValidators([Validators.required]);
    this.clientForm.controls["serviceId"].updateValueAndValidity();
    this.clientForm.controls["typeOfTreatment"].setValidators([Validators.required]);
    this.clientForm.controls["typeOfTreatment"].updateValueAndValidity();
    this.clientForm.controls["slot"].setValidators([Validators.required]);
    this.clientForm.controls["slot"].updateValueAndValidity();
    this.clientForm.controls["duration"].setValidators([Validators.required]);
    this.clientForm.controls["duration"].updateValueAndValidity();
    this.clientForm.controls["startTime"].setValidators([Validators.required]);
    this.clientForm.controls["startTime"].updateValueAndValidity();
    this.clientForm.controls["endTime"].setValidators([Validators.required]);
    this.clientForm.controls["endTime"].updateValueAndValidity();
  }

  // Back Button - Route
  addeditClientForm() {
    this.router.navigateByUrl('admin/client')
  }

  // Get Latitude and Longitude for Address
  handleAddressChange(address: any) {
    this.showlatti = true
    this.count = this.count + 1;
    this.clientForm.controls['address'].patchValue(address.formatted_address)
    this.clientLatitude = address.geometry.location.lat();
    this.clientLongitude = address.geometry.location.lng();
    this.clientForm.controls['clientAddressLatitude'].setValue(address.geometry.location.lat());
    this.clientForm.controls['clientAddressLongitude'].setValue(address.geometry.location.lng());
  }

  //get All Branch Details for home branch
  getAllBranch() {
    this.BranchService.getAllBranches().subscribe(res => {
      if (res.status) {
        var branchData = res.data;
        branchData.forEach(branchValue => {
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
        var brandchData = res.data;
        this.clientForm.controls['homeBranchAddress'].patchValue(brandchData.branchAddress);
        this.clientForm.controls['clientHomeBranchLattitude'].setValue(brandchData.latitude);
        this.clientForm.controls['clientHomeBranchLongitude'].setValue(brandchData.longitude);
      }
    })
  }

  // To Show the add session cards based on the values are changed or not
  changeaddsession() {
    this.showAddSession = false
  }

  // Add Session Array based on Number of session count
  addSessionBasedOnSessionCount(eve) {
    this.sessionArr.clear();
    if (eve.target) {
      var noOfSession = eve.target.value;
    }
    else {
      var noOfSession = eve;
    }
    for (let i = 0; i < noOfSession; i++) {
      this.sessionArr.push(this.initializeAddSessionForm());
    }
  }

  // Get all Staff List
  getAllStaffs() {
    this.staffService.getAllStaffs().subscribe(res => {
      if (res.status) {
        var staffData = res.data;
        staffData.forEach(staff => {
          if (staff.status == 0) {
            this.staffList.push(staff);
          }
        })
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
          if (service.status == 0) {
            this.serviceList.push(service);
          }
        })
      }
    })
  }

  //Get all Slot based on staff Id
  getSlotbasedOnStaff(event) {
    if (event.target) {
      var StaffId = event.target.value;
    }
    else {
      var StaffId = event;
    }
    this.staffService.getStaffById(StaffId).subscribe(res => {
      if (res.status) {
        var staffRoleId = res.data.staffRole
        this.roleService.getRolebyId(staffRoleId).subscribe(res => {
          if (res.status) {
            var roleData = res.data
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

  // Get Start and Time from slot Id
  Slot(eve) {
    if (eve.target != undefined) {
      var id = eve.target.value;
    }
    else {
      var id = eve;
    }
    var data = {
      staffId: this.clientForm.value.staffId,
      slotId: id
    }
    if (this.clientForm.value.staffId != '') {
      this.assignService.getSlotByStaffIdAndSlotId(data).subscribe(res => {
        if (res.status) {
          this.startTime = res.data.startTime;
          this.endTime = res.data.endTime;
        }
      })
    }
  }

  //Calculate End Time From start Time and Duration
  calculateEndTime(eve) {
    var date = new Date();
    var duration = this.clientForm.value.duration;
    var startTime = eve;
    var setHoursInDate = date.setHours(startTime.split(':')[0], startTime.split(':')[1]);
    var findEndTime = new Date(new Date(setHoursInDate).getTime() + duration * 60000);
    this.endTime = findEndTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    this.clientForm.controls['endTime'].patchValue(this.endTime);
  }

  // Format Date in  DD-MM-YYYY format
  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    return [day, month, year].join('-');
  }

  //Format Date in YYYY-MM-DD format
  reverseFormatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    return [year, month, day].join('-');
  }

  // On change event for start date
  onDateChangeStart(eve) {
    this.editClientData = false;
    this.minDate = eve;
    this.clientForm.controls['endDate'].patchValue('');
  }

  //On change duration empty the start and end time
  onChangeDuration() {
    this.clientForm.controls['startTime'].patchValue('');
    this.clientForm.controls['endTime'].patchValue('');
  }

  // while Click The Edit and then change the start date the add session will be hide
  onClickTheDate() {
    if (this.clientData != undefined || this.clientId != null) {
      if (this.formatDate(this.clientData.startDate) == this.clientForm.value.startDate) {
        this.showAddSession = true;
      }
      else {
        this.showAddSession = false;
      }
    }
  }

  //While Click The  Edit And Change The End Date It Will Hide The Add Session Slots
  onClickTheEndDate() {
    this.count = this.count + 1;
    if (this.clientData != undefined || this.clientId != null) {
      if (this.count <= 4) {
        this.showAddSession = true;
      }
      else {
        if (this.reverseFormatDate(this.clientData.endDate) == this.clientForm.value.endDate) {
          this.showAddSession = true;
        }
        else {
          this.showAddSession = false;
        }

      }
    }
  }

  //While Click The  Edit And Change The Starttime It Will Hide The Add Session Slots
  onClickTheTime() {
    if (this.clientId != null || this.clientId != undefined) {
      if (this.clientForm.value.startTime = '') {
        if (this.clientData.startTime == this.clientForm.value.startTime) {
          this.showAddSession = true;
        }
        else {
          this.showAddSession = false;
        }
      }
      else {
        this.showAddSession = false;
      }
    }
  }

  //While Click The  edit and change the select days it will hide the add session slots
  onClickWeekDays() {
    if (this.clientId != null || this.clientId != undefined) {
      if (this.clientData.onWeekDay == this.clientForm.value.onWeekDay) {
        this.showAddSession = true;
      }
      else {
        this.showAddSession = false;
      }
    }
  }

  // When click add session button this function will work
  addClient() {
    this.showAddSession = true;
    this.isClientFormSubmitted = true;
    this.validation()
    if (this.clientForm.value.clientAddressLatitude != "" || this.clientForm.value.clientAddressLongitude != "") {
      if (this.clientForm.valid) {
        var data = {
          startDate: (this.editClientData) ? this.reverseFormatDate(this.clientData.startDate) : this.reverseFormatDate(this.clientForm.value.startDate),
          endDate: (this.editClientData) ? this.reverseFormatDate(this.clientData.endDate) : this.reverseFormatDate(this.clientForm.value.endDate),
          noOfSession: this.clientForm.value.noOfSession,
          staffId: this.clientForm.value.staffId,
          slotId: this.clientForm.value.slot,
          duration: this.clientForm.value.duration,
          typeOfTreatment: this.clientForm.value.typeOfTreatment,
          weekDaysArr: this.clientForm.value.onWeekDay,
          startTime: this.clientForm.value.startTime,
          endTime: this.clientForm.value.endTime
        }
        this.setvalidator();
        this.clearvalidator()
        // if (this.clientForm.value.staffId != '' && this.clientForm.value.typeOfTreatment != '') {
        this.clientService.createSession(data).subscribe(res => {
          if (res.status) {
            this.addSessionData = res.data;
            this.allDate = [];
            this.sessionDate = [];
            this.addSessionData.forEach((value) => {
              this.allDate.push(value.date);
              this.sessionDate.push(this.formatDate(value.date));
            })
            if (this.clientId != undefined) {
              if (this.clientData.startTime == this.clientForm.value.startTime ||
                this.clientData.endTime == this.clientForm.value.endTime) {
                this.clientData.addSession.forEach((ele, i) => {
                  if (this.allDate.includes(ele.date)) {
                    var session = this.clientForm.get('addSession') as FormArray;
                    session.at(i)['controls']['slotStartTime'].patchValue(ele.slotStartTime);
                    session.at(i)['controls']['slotEndTime'].patchValue(ele.slotEndTime);
                  }
                  else {
                    this.addSessionData.forEach((ele, index) => {
                      if (ele.isAvailable == true) {
                        var session = this.clientForm.get('addSession') as FormArray;
                        session.at(index)['controls']['slotStartTime'].patchValue(this.clientForm.value.startTime);
                        session.at(index)['controls']['slotEndTime'].patchValue(this.clientForm.value.endTime);
                      }
                      else {
                        var session = this.clientForm.get('addSession') as FormArray;
                        session.at(index)['controls']['slotStartTime'].patchValue('');
                        session.at(index)['controls']['slotEndTime'].patchValue('');
                      }
                    })
                  }
                })
              }
              else {
                this.addSessionData.forEach((ele, index) => {
                  if (ele.isAvailable == true) {
                    var session = this.clientForm.get('addSession') as FormArray;
                    session.at(index)['controls']['slotStartTime'].patchValue(this.clientForm.value.startTime);
                    session.at(index)['controls']['slotEndTime'].patchValue(this.clientForm.value.endTime);
                  }
                  else {
                    var session = this.clientForm.get('addSession') as FormArray;
                    session.at(index)['controls']['slotStartTime'].patchValue('');
                    session.at(index)['controls']['slotEndTime'].patchValue('');
                  }
                })
              }
            }
            else {
              this.addSessionData.forEach((ele, index) => {
                if (ele.isAvailable == true) {
                  var session = this.clientForm.get('addSession') as FormArray;
                  session.at(index)['controls']['slotStartTime'].patchValue(this.clientForm.value.startTime);
                  session.at(index)['controls']['slotEndTime'].patchValue(this.clientForm.value.endTime);
                }
                else {
                  var session = this.clientForm.get('addSession') as FormArray;
                  session.at(index)['controls']['slotStartTime'].patchValue('');
                  session.at(index)['controls']['slotEndTime'].patchValue('');
                }
              })
            }

          }
          else {
            this.flashMessageService.errorMessage(res.message);
          }
        })
        this.Slot(this.clientForm.value.slot);
      }
      else {
        this.showAddSession = false;
      }
    }
    else {
      this.flashMessageService.errorMessage("Please select Address From The List");
      this.showAddSession = false;
    }

  }

  // When click slot the start and end time will patch in session slot start and end time
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

  // Save Client Data
  saveClient() {
    this.isClientFormSubmitted = true;
    this.showError = false
    var data = this.clientForm.value;
    this.setvalidator();
    this.clearvalidator();
    data.startDate = this.reverseFormatDate(this.clientForm.value.startDate);
    data.endDate = this.reverseFormatDate(this.clientForm.value.endDate);
    for (let i = 0; i < this.sessionArr.value.length; i++) {
      data.addSession[i].date = this.addSessionData[i].date;
      data.addSession[i].slot = this.clientForm.value.slot;
      data.addSession[i].duration = this.clientForm.value.duration;
      data.addSession[i].slotStartTime = this.sessionArr.value[i].slotStartTime;
      data.addSession[i].slotEndTime = this.sessionArr.value[i].slotEndTime;
    }
    data.packageId = (Math.floor((Math.random() * 100000000000) + 1)).toString();
    this.assignService.getAllAssignService().subscribe((res) => {
      if (res.status) {
        if (res.data.packageId == data.packageId) {
          data.packageId = (Math.floor((Math.random() * 100000000000) + 1)).toString();
        }
      }
    })
    this.setvalidation()
    if (this.clientForm.valid) {
      this.clientService.createClient(data).subscribe(res => {
        if (res.status) {
          this.flashMessageService.successMessage("Client Added Sucessfully!!!");
          this.router.navigateByUrl('admin/client');
        }
        else {
          this.flashMessageService.errorMessage(res.message);
        }
      })
    }
    else {
      this.flashMessageService.errorMessage("Please Select All The Required Fields");
    }
  }

  // When edit client to patch the slot
  editClient(i) {
    this.setvalidator();
    this.clearvalidator();
    var data = {
      startDate: this.reverseFormatDate(this.clientData.packageId[i].startDate),
      endDate: this.reverseFormatDate(this.clientData.packageId[i].endDate),
      noOfSession: this.clientForm.value.noOfSession,
      staffId: this.clientForm.value.staffId,
      slotId: this.clientForm.value.slot,
      duration: this.clientForm.value.duration,
      typeOfTreatment: this.clientForm.value.typeOfTreatment,
      weekDaysArr: this.clientForm.value.onWeekDay,
      startTime: this.clientForm.value.startTime,
      endTime: this.clientForm.value.endTime,
      clientAddressLongitude: this.clientForm.value.clientAddressLongitude,
      clientAddressLatitude: this.clientData.clientAddressLatitude,
      clientHomeBranchLongitude: this.clientData.clientHomeBranchLongitude,
      clientHomeBranchLattitude: this.clientData.clientHomeBranchLattitude
    }
    this.clientService.createSession(data).subscribe(res => {
      if (res.status) {
        this.editClientData = true;
        this.addSessionData = res.data;
        this.sessionDate = [];
        if (this.clientId != undefined) {
          this.clientData.packageId[i].addSession.forEach((ele, index) => {
            this.sessionDate.push(this.formatDate(ele.date));
            var session = this.clientForm.get('addSession') as FormArray;
            session.at(index)['controls']['slotStartTime'].patchValue(ele.slotStartTime);
            session.at(index)['controls']['slotEndTime'].patchValue(ele.slotEndTime);
          })
        }
      }
    })
  }

  // Get Client Details By client Id
  getClientById(clientId) {
    this.show = true
    this.clientService.getClientById(clientId).subscribe(res => {
      if (res.status) {
        this.showAddEdit = true;
        this.clientData = res.data;
        this.type = [];
        this.clientData.packageId.forEach((ele, index) => {
          if (ele.typeOfTreatment == 0) {
            this.type.push("Home");
          }
          if (ele.typeOfTreatment == 1) {
            this.type.push("OP");
          }
          if (ele.typeOfTreatment == 2) {
            this.type.push("Teletherapy");
          }
          if (ele.typeOfTreatment == 3) {
            this.type.push("IP");
          }
          if (ele.typeOfTreatment == 4) {
            this.type.push("Assessment");
          }
          var data = {
            packageId: ele.id
          }
          this.clientService.getAssignServiceByPackageId(data).subscribe(res => {
            if (res.status) {
              this.packageData.push({
                packageId: ele.id,
                _id: this.clientData._id,
                startDate: this.formatDate(ele.startDate),
                endDate: this.formatDate(ele.endDate),
                noOfSession: ele.noOfSession,
                typeOfTreatment: this.type[index],
                staffName: ele.staffName,
                status: (res.data.length == 0) ? 0 : 1,
                clientAddressLatitude: this.clientData.clientAddressLatitude,
                clientAddressLongitude: this.clientData.clientAddressLongitude,
              })
            }
          })
        })
        this.clientLatitude = this.clientData.clientAddressLatitude;
        this.clientLongitude = this.clientData.clientAddressLongitude;
        this.clientForm.patchValue({
          uhid: this.clientData.uhid,
          clientName: this.clientData.clientName,
          email: this.clientData.email,
          phoneNumber: this.clientData.phoneNumber,
          address: this.clientData.address,
          homeBranchId: this.clientData.homeBranchId,
          homeBranchAddress: this.clientData.homeBranchAddress,
          emergencyNumber: this.clientData.emergencyNumber,
          clientAddressLatitude: this.clientData.clientAddressLatitude,
          clientAddressLongitude: this.clientData.clientAddressLongitude,
        })
      }
    })
  }

  //While Click to edit package
  editpackageId(id, packageId, index, show) {
    if (show == 'edit') {
      this.hideUpdateButton = false;
    }
    else {
      this.hideUpdateButton = true;
    }
    this.showEditPackage = true
    this.showPackage = true
    this.hideButton = true
    this.packageIds = packageId
    // packageId.forEach(element => {
    //   this.packageIds = element.id
    // });
    var data = {
      _id: id,
      packageId: packageId
    }
    this.clientService.getDetailsByPackageId(data).subscribe(res => {
      if (res.status) {
        this.count = 0;
        this.showAddSession = true
        this.setvalidation()
        this.packageId = res.data.packageId;
        this.clientForm.patchValue(res.data);
        this.clientForm.controls['startDate'].patchValue(this.formatDate(res.data.startDate));
        this.clientForm.controls['endDate'].patchValue(this.formatDate(res.data.endDate));
        this.clientForm.controls['clientAddressLatitude'].setValue(res.data.clientAddressLatitude);
        this.clientForm.controls['clientAddressLongitude'].setValue(res.data.clientAddressLongitude);
        this.addSessionBasedOnSessionCount(res.data.noOfSession);
        this.getSlotbasedOnStaff(res.data.staffId);
        this.Slot(res.data.slot);
        this.editClient(index);
      }
    })
    // this.clientService.getClientById(clientId).subscribe(res => {
    //   if (res.status) {
    //     this.showAddSession = true
    //     this.packageId = res.data.packageId;
    //     this.clientForm.patchValue(res.data);
    //     this.clientForm.controls['startDate'].patchValue(this.formatDate(res.data.startDate));
    //     this.clientForm.controls['endDate'].patchValue(this.formatDate(res.data.endDate));
    //     this.clientForm.controls['clientAddressLatitude'].setValue(res.data.clientAddressLatitude);
    //     this.clientForm.controls['clientAddressLongitude'].setValue(res.data.clientAddressLongitude);
    //     this.addSessionBasedOnSessionCount(res.data.noOfSession);
    //     this.getSlotbasedOnStaff(res.data.staffId);
    //     this.Slot(res.data.slot);
    //     this.editClient();
    //   }
    // })
  }


  //While click to add Package
  showPackageForm() {
    this.show = true
    this.showPackage = false
    this.showEditPackage = false
    this.showAddSession = false
    this.hideButton = false
    this.clientForm.patchValue({
      packageId: '',
      noOfSession: '',
      onWeekDay: '',
      amount: '',
      staffId: '',
      startDate: '',
      endDate: '',
      serviceId: '',
      typeOfTreatment: '',
      slot: '',
      duration: '',
      startTime: '',
      endTime: '',
    })
  }

  //to throw error while address is not selected from the adress dropdown
  check() {
    this.onchangeaddress = true
  }

  //update the client  name address and the phonenumber separately in the edit client
  updateClientdetails() {
    this.isClientFormSubmitted = true;
    this.setvalidator();
    if (this.showlatti) {
      this.clientForm.value.clientAddressLongitude = this.clientForm.value.clientAddressLongitude;
      this.clientForm.value.clientAddressLatitude = this.clientForm.value.clientAddressLatitude;
    }
    else {
      this.clientForm.value.clientAddressLongitude = this.clientData.clientAddressLongitude;
      this.clientForm.value.clientAddressLatitude = this.clientData.clientAddressLatitude
    }

    if (this.onchangeaddress && !this.showlatti) {
      this.clientForm.value.clientAddressLongitude = "";
      this.clientForm.value.clientAddressLatitude = "";
    }
    else {
      this.clientForm.value.clientAddressLongitude = this.clientForm.value.clientAddressLongitude;
      this.clientForm.value.clientAddressLatitude = this.clientForm.value.clientAddressLatitude;
    }

    this.clientForm.value._id = this.clientId;
    var data = {
      _id: this.clientId,
      uhid: this.clientForm.value.uhid,
      clientName: this.clientForm.value.clientName,
      email: this.clientForm.value.email,
      phoneNumber: this.clientForm.value.phoneNumber,
      address: this.clientForm.value.address,
      homeBranchId: this.clientForm.value.homeBranchId,
      homeBranchAddress: this.clientForm.value.homeBranchAddress,
      emergencyNumber: this.clientForm.value.emergencyNumber,
      clientAddressLatitude: this.clientForm.value.clientAddressLatitude,
      clientAddressLongitude: this.clientForm.value.clientAddressLongitude,
    }
    if (this.clientForm.value.clientAddressLatitude != "" || this.clientForm.value.clientAddressLongitude != "") {
      if (this.clientForm.valid) {
        this.clientService.updateClientdetails(this.clientId, data).subscribe(res => {
          if (res.status) {
            this.flashMessageService.successMessage("Client Updated Sucessfully!!!");
          }
        })
      }
      else {
        this.flashMessageService.errorMessage("Please fill all the required field");
      }
    }
    else if (this.onchangeaddress && !this.showlatti && this.clientForm.value.clientAddressLatitude == "" || this.clientForm.value.clientAddressLongitude == "") {
      this.flashMessageService.errorMessage("Please select Address From The List");
    }
  }

  // Update Client
  updateClient() {
    this.isClientFormSubmitted = true;
    var data = this.clientForm.value;
    this.setvalidation()
    this.clearvalidator()
    data.clientAddressLatitude = this.clientLatitude;
    data.clientAddressLongitude = this.clientLongitude;
    data.startDate = (this.editClientData) ? this.reverseFormatDate(this.clientData.startDate) : this.reverseFormatDate(this.clientForm.value.startDate);
    data.endDate = (this.editClientData) ? this.reverseFormatDate(this.clientData.endDate) : this.reverseFormatDate(this.clientForm.value.endDate);
    for (let i = 0; i < this.sessionArr.value.length; i++) {
      data.addSession[i].date = this.addSessionData[i].date;
      data.addSession[i].slot = this.clientForm.value.slot;
      data.addSession[i].duration = this.clientForm.value.duration;
      data.addSession[i].slotStartTime = this.sessionArr.value[i].slotStartTime;
      data.addSession[i].slotEndTime = this.sessionArr.value[i].slotEndTime;
    }
    var packageId;
    if (this.hideButton) {
      packageId = this.packageIds;
    }
    else {
      packageId = (Math.floor((Math.random() * 100000000000) + 1)).toString();
    }
    var packageArr = {
      id: packageId,
      addSession: data.addSession,
      startDate: data.startDate,
      endDate: data.endDate,
      noOfSession: data.noOfSession,
      staffId: data.staffId,
      typeOfTreatment: data.typeOfTreatment,
      serviceId: data.serviceId,
      onWeekDay: data.onWeekDay,
      amount: data.amount,
      slot: data.slot,
      duration: data.duration,
      startTime: data.startTime,
      endTime: data.endTime,
      clientAddressLongitude: data.clientAddressLongitude,
      clientAddressLatitude: data.clientAddressLatitude,
      clientHomeBranchLongitude: data.clientHomeBranchLongitude,
      clientHomeBranchLattitude: data.clientHomeBranchLattitude,
    }
    data.packageId = [packageArr];
    this.setvalidation()
    this.setvalidator();
    this.clearvalidator()
    if (this.clientForm.valid) {
      this.clientService.updateClient(this.clientId, data).subscribe(res => {
        if (res.status) {
          this.flashMessageService.successMessage("Client Updated Sucessfully!!!");
          this.router.navigateByUrl('admin/client');
        }
      })
    }
    else {
      this.flashMessageService.errorMessage("Please select All The Requried Fields");
    }
  }
}