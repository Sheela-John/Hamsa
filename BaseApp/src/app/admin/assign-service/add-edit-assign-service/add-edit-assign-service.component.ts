import { ViewChild, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StaffService } from 'src/app/services/staff.service';
import { ServiceService } from 'src/app/services/service.service';
import { NgxMaterialTimepickerComponent } from 'ngx-material-timepicker';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { BranchService } from 'src/app/services/branch.service';
import { ClientService } from 'src/app/services/client.service';
import { FlashMessageService } from "../../../shared/flash-message/flash-message.service";
import { AssignService } from 'src/app/services/assign.service';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceRequestService } from 'src/app/services/serviceRequest.service';
import { RoleService } from 'src/app/services/role.service';

@Component({
  selector: 'app-add-edit-assign-service',
  templateUrl: './add-edit-assign-service.component.html',
  styleUrls: ['./add-edit-assign-service.component.scss']
})

export class AddEditAssignServiceComponent implements OnInit {
  @ViewChild("startpicker")
  public ngxMaterialStartTimepicker!: NgxMaterialTimepickerComponent;
  public ngxMaterialEndTimepicker!: NgxMaterialTimepickerComponent;
  public ngxMateriaTimepicker!: NgxMaterialTimepickerComponent;
  @ViewChild("placesRef") placesRef: GooglePlaceDirective;
  public assignServiceForm: any;
  public isassignServiceFormSubmitted: Boolean = false;
  public staffList: any = [];
  public serviceList: any = [];
  public startpickerOpened: boolean = false;
  public timepickerOpened: boolean = false;
  public formattedAddress: any;
  public endpickerOpened: boolean = false;
  public assignServiceClientForm: any
  public isassignServiceClientFormSubmitted: Boolean = false;
  public assignServiceBranchForm: any
  public isassignServiceBranchFormSubmitted: Boolean = false;
  public branchList: any = [];
  public destroy$ = new Subject();
  public showAddEdit: boolean = false;
  public staffData: any;
  public serviceData: any;
  public branchData: any;
  public staffId: any = [];
  public showOp: boolean = false;
  public showOnline: boolean = false;
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
  public opTypes = [{
    'id': 0,
    'Name': 'Same Branch'
  },
  {
    'id': 1,
    'Name': 'Other Branch'
  }]
  public clientId: {
    enableCheckAll: boolean; singleSelection: boolean; idField: string; textField: string;
    allowSearchFilter: boolean;
  };
  public clientArr: any = [];
  public showonline: boolean;
  public slotName: any = [];
  public serviceRequestId: any;
  public assignServiceId: any;
  public assignServiceArray: any = [];
  public clientData: any;
  public clientList: any[];
  public addressLatitude: any;
  public addressLongitude: any;
  public changeValue: any;
  public typeSelection: boolean;
  public isShowSlotTime: boolean = false;
  public AssignServiceDate: any;
  public StaffId: any;
  public startTime: any;
  public endTime: any;
  public timeInterval: any[];
  public slotDuration: any;
  public slotTime: any;
  public startTimeData: Date;
  public endTimeData: Date;
  public slotSelectedIndex: any;
  public homeBranchAdress: any;
  public homeBranchId: any;
  public clientAddressLatitude: any;
  public clientAddressLongitude: any;
  public slotStartTime: any;
  public slotEndTime: any;
  public showAppointmentTable: boolean = false;
  public assignSercieDataArr: any;
  public duration: any;
  public slotId: any;
  public assignId: any;
  public show: any;
  public update: boolean = false

  constructor(private fb: FormBuilder, public StaffService: StaffService, public ClientService: ClientService, private route: ActivatedRoute, public ServiceService: ServiceService, public BranchService: BranchService, public AssignService: AssignService, public ServiceRequestService: ServiceRequestService, private FlashMessageService: FlashMessageService, private router: Router, private RoleService: RoleService) {
    this.route.params.subscribe((param) => {
      this.assignServiceId = param['assignServiceId'];
      this.serviceRequestId = param['serviceRequestId']
      this.show = param['show']
      console.log(param)
    })
  }

  ngOnInit(): void {
    this.initializeassignServiceForm();
    this.initializeassignServiceClientForm();
    this.getAllBranch();
    this.getAllStaffs();
    this.getAllClient();
    this.getAllServices();

    if (this.startpickerOpened && this.ngxMaterialStartTimepicker)
      this.ngxMaterialStartTimepicker.close();
    if (this.endpickerOpened && this.ngxMaterialEndTimepicker)
      this.ngxMaterialEndTimepicker.close();
    if (this.timepickerOpened && this.ngxMateriaTimepicker)
      this.ngxMateriaTimepicker.close();
    if (this.assignServiceId != undefined) {
      this.showAddEdit = true
      this.getAssignServiceById(this.assignServiceId);
    }
    if (this.serviceRequestId != undefined) {
      this.getServiceRequestById(this.serviceRequestId)
    }
    if (this.show == 'edit') {
      this.update = true
    }
    else {
      this.update = false
    }
  }

  //initialAssignServiceForm
  initializeassignServiceForm() {
    this.assignServiceForm = this.fb.group({
      staffId: ['', [Validators.required]],
      date: ['', [Validators.required]],
    });
  }

  //initialAssignServiceClientForm
  initializeassignServiceClientForm() {
    this.assignServiceClientForm = this.fb.group({
      phone: ['', [Validators.required]],
      clientId: ['', [Validators.required]],
      address: ['', [Validators.required]],
      serviceId: ['', [Validators.required]],
      opType: ['', [Validators.required]],
      typeOfTreatment: ['', [Validators.required]],
      otherBranchAddress: ['', [Validators.required]],
      otherBranchId: ['', [Validators.required]],
      onlineLink: [''],
      duration: ['', [Validators.required]],
      branchId: ['', [Validators.required]],
      branchAddress: ['', [Validators.required]],
      branchType: ['', [Validators.required]],
      slot: ['', [Validators.required]],

    });
  }

  //addEdit-Back Route
  addeditForm() {
    this.router.navigateByUrl('admin/assignService')
  }

  //getAll Staffs
  getAllStaffs() {
    this.staffList = []
    this.StaffService.getAllStaffs().subscribe(res => {
      if (res.status) {
        this.staffData = res.data;
        this.staffData.forEach(staffValue => {
          if (staffValue.isDeleted == 0) {
            this.staffList.push({
              _id: staffValue._id,
              staffName: staffValue.staffName
            });
          }
        });
      }
    })
  }

  //formatDate -dd/mm/yyyy
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

  //formattedDate -yyyy/mm/dd
  formattedDate(date) {
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

  //while click Show Appointment ==>getAllAssignServceByStaffIdAndDate
  showAppointment() {
    this.showAppointmentTable = true
    var formattedDates = this.formattedDate(this.assignServiceForm.value.date)
    var data = {
      staffId: this.assignServiceForm.value.staffId,
      date: formattedDates
    }
    this.AssignService.getAssignServiceDataByStaffIdAndDate(data).subscribe(res => {
      if (res.status) {
        var assignServiceArray = res.data;
        assignServiceArray.forEach(element => {
          var datas = {
            _id: element._id,
            clientName: element.clientName,
            phone: element.phone,
            address: element.address,
            staffName: element.staffName,
            startTime: element.startTime,
            endTime: element.endTime,
            status: element.status,
            date: this.formatDate(element.date),
            serviceName: element.serviceName,
            startDistance: element.startDistance,
            endDistance: element.endDistance,
          }
          this.assignServiceArray.push(datas)
        })
      }
    })
  }

  //getAllClient
  getAllClient() {
    this.clientList = []
    this.ClientService.getAllClients().subscribe(res => {
      if (res.status) {
        this.clientData = res.data;
        this.clientData.forEach(clientValue => {
          this.clientList.push({
            _id: clientValue._id,
            clientName: clientValue.clientName
          });
          this.clientArr = this.clientList
          //setting for ng-multiselect-dropdown
          this.clientId = {
            enableCheckAll: true,
            singleSelection: true,
            idField: '_id',
            textField: 'clientName',
            allowSearchFilter: true
          }
        });
      }
    })
  }

  //onChangeClient
  onChangeClient(event) {
    var id = event[0]._id
    this.getClientById(id)
  }

  //get client By Id
  getClientById(id) {
    this.ClientService.getClientById(id).subscribe(res => {
      if (res.status) {
        this.homeBranchAdress = res.data.homeBranchAddress
        this.homeBranchId = res.data.homeBranchId
        this.clientAddressLatitude = res.data.clientAddressLatitude
        this.clientAddressLongitude = res.data.clientAddressLongitude
        this.assignServiceClientForm.patchValue({
          address: res.data.address,
          phone: res.data.phoneNumber
        })
      }
    })
  }

  //ChooseHomeBranch
  ChooseHomeBranch(e) {
    if (e == 0) {
      this.assignServiceClientForm.patchValue({
        branchId: this.homeBranchId,
        branchAddress: this.homeBranchAdress
      })
      this.branchList = []
      this.BranchService.getBranchbyId(this.homeBranchId).subscribe(res => {
        if (res.status) {
          this.branchList.push({
            _id: res.data._id,
            branchName: res.data.branchName
          });
        }
      })
    }
    else {
      this.getAllBranch();
      this.assignServiceClientForm.patchValue({
        branchId: '',
        branchAddress: ''
      })
    }
  }

  //Ngx-Google Autocomplete ---NPM
  options: any = {
    componentRestrictions: { country: ['IND'] }
  }

  //change Address
  handleAddressChange(address: any) {
    this.addressLatitude = address.geometry.location.lat()
    this.addressLongitude = address.geometry.location.lng()
    this.formattedAddress = address.address_components
    this.assignServiceClientForm.controls['address'].setValue(address.formatted_address)
  }

  //opchange
  changeOP(Event) {
    this.changeValue = Event
    if (this.changeValue == 1) {
      this.showOp = true
    }
    else {
      this.showOp = false
    }
    if (this.changeValue == 2) {
      this.showonline = true
      this.typeSelection = false
    }
    else {
      this.showonline = false
    }
  }

  //get All Services
  getAllServices() {
    this.serviceList = [];
    this.ServiceService.getAllServices().subscribe(res => {
      if (res.status) {
        this.serviceData = res.data;
        this.serviceData.forEach(serviceValue => {
          if (serviceValue.status == 0) {
            this.serviceList.push({
              _id: serviceValue._id,
              serviceName: serviceValue.serviceName
            });
          }
        });
      }
    })
  }

  //getAll Branch 
  getAllBranch() {
    this.branchList = [];
    this.BranchService.getAllBranches().subscribe(res => {
      if (res.status) {
        this.branchData = res.data;
        this.branchData.forEach(branchValue => {
          if (branchValue.status == 0) {
            this.branchList.push({
              _id: branchValue._id,
              branchName: branchValue.branchName
            });
          }
        });
      }
    })
  }

  //onChange Branch by Id to patch branch address
  onChangegetBranchbyId(e) {
    var branchId = e.target.value
    this.getBranchbyId(branchId)
  }

  //getBranch By Id
  getBranchbyId(branchId) {
    this.BranchService.getBranchbyId(branchId).subscribe(res => {
      if (res.status) {
        var branchAddress = res.data.branchAddress
        this.assignServiceClientForm.patchValue({
          branchAddress: branchAddress
        })
      }
    })
  }

  //onChange Op type
  onChangeOpType(event) {
    let type = event.target.value;
    if (type == 1) {
      this.getAllBranch();
      this.typeSelection = true;
    }
    else {
      this.typeSelection = false
    }
  }

  //on change getotherBranchbyId
  getotherBranchbyId(e) {
    var branchId = e.target.value
    this.getOtherBranchbyId(branchId)
  }

  //get other Branch By Id
  getOtherBranchbyId(branchId) {
    this.BranchService.getBranchbyId(branchId).subscribe(res => {
      if (res.status) {
        var branchAddress = res.data.branchAddress
        this.assignServiceClientForm.patchValue({
          otherBranchAddress: branchAddress
        })
      }
    })
  }

  //onChangeStaff
  onChangeStaff(event) {
    if (event.target) {
      this.StaffId = event.target.value
    }
    else {
      this.StaffId = event
    }
    this.getStaffById(this.StaffId);
  }

  //get Staff By Id
  getStaffById(id) {
    this.StaffService.getStaffById(id).subscribe(res => {
      if (res.status) {
        var staffRoleId = res.data.staffRole
        this.RoleService.getRolebyId(staffRoleId).subscribe(res => {
          if (res.status) {
            var roleData = res.data
            this.slotName = []
            roleData.slots.forEach(element => {
              this.slotName.push({
                slotName: element.slotName,
                _id: element._id
              })
            });
          }
        })
      }
    })
  }

  //Onchange Slot 
  Slot(event) {
    if (event.target) {
      this.slotId = event.target.value
      this.assignServiceClientForm.patchValue({
        duration: ''
      })
    }
    else {
      this.slotId = event
    }
    this.isShowSlotTime = true
    this.AssignServiceDate = this.formatDate(this.assignServiceForm.value.date);
    var data = {
      staffId: this.StaffId,
      slotId: this.slotId
    }
    this.getSlotByStaffIdAndSlotId(data)
  }

  //Get Slot by staffId and SlotId
  getSlotByStaffIdAndSlotId(data) {
    this.AssignService.getSlotByStaffIdAndSlotId(data).subscribe(res => {
      if (res.status) {
        this.startTime = res.data.startTime
        this.endTime = res.data.endTime
      }
    })
  }

  //On select the duration
  dividingSlot(event) {
    if (event.target) {
      this.duration = event.target.value
    }
    else {
      this.duration = event
    }
    var formattedDates = this.formattedDate(this.assignServiceForm.value.date)
    var data = {
      staffId: this.assignServiceForm.value.staffId,
      date: formattedDates,
      slotId: this.slotId,
      duration: this.duration,
      typeOfTreatment: this.assignServiceClientForm.value.typeOfTreatment
    }
    this.getSlotsForAssignService(data);
  }

  //get slot for Assign service
  getSlotsForAssignService(data) {
    this.AssignService.getSlotsForAssignService(data).subscribe(res => {
      if (res.status) {
        this.timeInterval = res.data
      }
    })
    this.isShowSlotTime = true
  }

  //slotSelection
  slotSelection(e, index) {
    this.slotTime = e
    let splitvalue = this.slotTime.slot.split("-")
    this.slotStartTime = splitvalue[0]
    this.slotEndTime = splitvalue[1]
    this.slotSelectedIndex = index
  }

  //to clear a value in form after closing //
  clearValidator(control, form) {
    form.get(control).clearValidators();
    form.get(control).updateValueAndValidity();
  }

  /* Set Validator */
  setValidator(control, form) {
    form.get(control).setValidators([Validators.required]);
    form.get(control).updateValueAndValidity();
  }

  //saveAssignService
  saveAssignService() {
    if (this.assignServiceClientForm.value.typeOfTreatment != 1) {
      this.clearValidator('opType', this.assignServiceClientForm);
    }
    if (this.assignServiceClientForm.value.opType != 1) {
      this.clearValidator('otherBranchAddress', this.assignServiceClientForm);
      this.clearValidator('otherBranchId', this.assignServiceClientForm);
    }
    this.isassignServiceFormSubmitted = true;
    this.isassignServiceClientFormSubmitted = true
    console.log(this.assignServiceForm)
    if (this.slotStartTime != undefined) {
      if (this.assignServiceForm.valid) {
        if (this.assignServiceClientForm.valid) {
          var formattedDates = this.formattedDate(this.assignServiceForm.value.date)
          var data = {
            staffId: this.assignServiceForm.value.staffId,
            date: formattedDates,
            clientId: this.assignServiceClientForm.value.clientId[0]._id,
            address: this.assignServiceClientForm.value.address,
            phone: this.assignServiceClientForm.value.phone,
            serviceId: this.assignServiceClientForm.value.serviceId,
            opType: this.assignServiceClientForm.value.opType,
            typeOfTreatment: this.assignServiceClientForm.value.typeOfTreatment,
            otherBranchAddress: this.assignServiceClientForm.value.otherBranchAddress,
            otherBranchId: this.assignServiceClientForm.value.otherBranchId,
            onlineLink: this.assignServiceClientForm.value.onlineLink,
            duration: this.assignServiceClientForm.value.duration,
            branchId: this.assignServiceClientForm.value.branchId,
            branchAddress: this.assignServiceClientForm.value.branchAddress,
            branchType: this.assignServiceClientForm.value.branchType,
            slot: this.assignServiceClientForm.value.slot,
            longitude: this.clientAddressLongitude,
            latitude: this.clientAddressLatitude,
            startTime: this.slotStartTime,
            endTime: this.slotEndTime
          }
          console.log(this.slotStartTime)
          console.log(data, 'gyy')
          this.AssignService.createAssignServiceClient(data).subscribe(res => {
            if (res.status) {
              if (this.serviceRequestId != undefined) {
                var data = {
                  "isAssigned": 1
                }
                this.ServiceRequestService.updateServiceRequest(data, this.serviceRequestId).subscribe(res => {
                  if (res.status) {
                    console.log(res.data, "oooo")
                  }
                })
              }
              this.FlashMessageService.successMessage("Assign service Client Created Successfully", 2);
              this.router.navigateByUrl("admin/assignService")
            }
            else {
              this.FlashMessageService.errorMessage("Assign service Client Created Failed", 2);
            }
          })
        }
      }
    }
    else {
      this.FlashMessageService.errorMessage("Please Select Your Slot");
    }
  }

  //editAssignServiceClient by Id
  editAssignServiceClient(id) {
    this.assignId = id
    this.showAddEdit = true
    this.AssignService.getAssignServiceById(id).subscribe(res => {
      if (res.status) {
        this.assignSercieDataArr = res.data;
        this.assignServiceForm.patchValue({
          staffId: this.assignSercieDataArr.staffId,
          date: this.formatDate(this.assignSercieDataArr.date),
        })
        if (this.assignSercieDataArr.typeOfTreatment != '') {
          this.changeOP(this.assignSercieDataArr.typeOfTreatment)
        }
        if (this.assignSercieDataArr.slot != '') {
          this.assignServiceClientForm.patchValue({
            slot: this.assignSercieDataArr.slot
          })
          this.Slot(this.assignSercieDataArr.slot)
        }
        if (this.assignSercieDataArr.duration != '') {
          var formattedDates = this.formattedDate(this.assignSercieDataArr.date)
          var data = {
            staffId: this.assignSercieDataArr.staffId,
            date: formattedDates,
            slotId: this.assignSercieDataArr.slot,
            duration: this.assignSercieDataArr.duration,
            typeOfTreatment: this.assignSercieDataArr.typeOfTreatment
          }
          this.getSlotsForAssignService(data);
          this.dividingSlot(this.assignSercieDataArr.duration)
        }

        this.ClientService.getClientById(this.assignSercieDataArr.clientId).subscribe(res => {
          if (res.status) {
            this.clientArr = [];
            this.clientArr.push({
              _id: res.data._id,
              clientName: res.data.clientName
            }
            )
          }
          this.assignServiceClientForm.patchValue({
            clientId: this.clientArr
          })
        })
        if (this.assignSercieDataArr.opType != '') {
          let type = this.assignSercieDataArr.opType
          if (type == 1) {
            this.typeSelection = true;
            this.getAllBranch();
            this.assignServiceClientForm.patchValue({
              otherBranchId: this.assignSercieDataArr.otherBranchId
            })
            this.getOtherBranchbyId(this.assignSercieDataArr.otherBranchId)
          }
          else {
            this.typeSelection = false
          }
        }
        if (this.assignSercieDataArr.branchType == 0) {
          this.branchList = []
          this.BranchService.getBranchbyId(this.assignSercieDataArr.branchId).subscribe(res => {
            if (res.status) {
              this.branchList.push({
                _id: res.data._id,
                branchName: res.data.branchName
              });
            }
            this.assignServiceClientForm.patchValue({
              branchId: this.assignSercieDataArr.branchId
            })
            this.getBranchbyId(this.assignSercieDataArr.branchId)
          })
        }
        else {
          this.getAllBranch();
          this.assignServiceClientForm.patchValue({
            branchId: this.assignSercieDataArr.branchId
          })
          this.getBranchbyId(this.assignSercieDataArr.branchId)
        }
        this.assignServiceClientForm.patchValue({
          duration: this.assignSercieDataArr.duration,
          branchType: this.assignSercieDataArr.branchType,
          serviceId: this.assignSercieDataArr.serviceId,
          typeOfTreatment: this.assignSercieDataArr.typeOfTreatment,
          opType: this.assignSercieDataArr.opType,
        })
      }
    })
  }

  //getAssignServiceById
  getAssignServiceById(id) {
    this.AssignService.getAssignServiceById(id).subscribe(res => {
      if (res.status) {
        this.assignSercieDataArr = res.data;
        console.log(this.assignSercieDataArr)
        this.assignServiceForm.patchValue({
          staffId: this.assignSercieDataArr.staffId,
          date: new Date(this.assignSercieDataArr.date),
        })
        if (this.assignSercieDataArr.staffId != '') {
          this.onChangeStaff(this.assignSercieDataArr.staffId)
        }
        if (this.assignSercieDataArr.typeOfTreatment != '') {
          this.changeOP(this.assignSercieDataArr.typeOfTreatment)
        }
        if (this.assignSercieDataArr.slot != '') {
          this.assignServiceClientForm.patchValue({
            slot: this.assignSercieDataArr.slot
          })
          this.Slot(this.assignSercieDataArr.slot)
        }
        if (this.assignSercieDataArr.duration != '') {
          var formattedDates = this.formattedDate(this.assignSercieDataArr.date)
          var data = {
            staffId: this.assignSercieDataArr.staffId,
            date: formattedDates,
            slotId: this.assignSercieDataArr.slot,
            duration: this.assignSercieDataArr.duration,
            typeOfTreatment: this.assignSercieDataArr.typeOfTreatment
          }
          this.getSlotsForAssignService(data);
          this.dividingSlot(this.assignSercieDataArr.duration)
        }

        this.ClientService.getClientById(this.assignSercieDataArr.clientId).subscribe(res => {
          if (res.status) {
            this.clientArr = [];
            this.clientArr.push({
              _id: res.data._id,
              clientName: res.data.clientName
            }
            )
          }
          this.assignServiceClientForm.patchValue({
            clientId: this.clientArr
          })
        })
        if (this.assignSercieDataArr.opType != '') {
          let type = this.assignSercieDataArr.opType
          if (type == 1) {
            this.typeSelection = true;
            this.getAllBranch();
            this.assignServiceClientForm.patchValue({
              otherBranchId: this.assignSercieDataArr.otherBranchId
            })
            this.getOtherBranchbyId(this.assignSercieDataArr.otherBranchId)
          }
          else {
            this.typeSelection = false
          }
        }
        if (this.assignSercieDataArr.branchType == 0) {
          this.branchList = []
          this.BranchService.getBranchbyId(this.assignSercieDataArr.branchId).subscribe(res => {
            if (res.status) {
              this.branchList.push({
                _id: res.data._id,
                branchName: res.data.branchName
              });
            }
            this.assignServiceClientForm.patchValue({
              branchId: this.assignSercieDataArr.branchId
            })
            this.getBranchbyId(this.assignSercieDataArr.branchId)
          })
        }
        else {
          this.getAllBranch();
          this.assignServiceClientForm.patchValue({
            branchId: this.assignSercieDataArr.branchId
          })
          this.getBranchbyId(this.assignSercieDataArr.branchId)
        }
        this.assignServiceClientForm.patchValue({
          duration: this.assignSercieDataArr.duration,
          branchType: this.assignSercieDataArr.branchType,
          serviceId: this.assignSercieDataArr.serviceId,
          typeOfTreatment: this.assignSercieDataArr.typeOfTreatment,
          opType: this.assignSercieDataArr.opType,
        })
      }
    })
  }

  //updateassignService
  updateassignService() {
    // var assignId = this.assignId
    if (this.assignServiceClientForm.value.typeOfTreatment != 1) {
      this.clearValidator('opType', this.assignServiceClientForm);
    }
    if (this.assignServiceClientForm.value.opType != 1) {
      this.clearValidator('otherBranchAddress', this.assignServiceClientForm);
      this.clearValidator('otherBranchId', this.assignServiceClientForm);
    }
    this.isassignServiceFormSubmitted = true;
    this.isassignServiceClientFormSubmitted = true
    if (this.slotStartTime != undefined) {
      if (this.assignServiceForm.valid) {
        if (this.assignServiceClientForm.valid) {
          var formattedDates = this.formattedDate(this.assignServiceForm.value.date)
          var data = {
            staffId: this.assignServiceForm.value.staffId,
            date: formattedDates,
            clientId: this.assignServiceClientForm.value.clientId[0]._id,
            address: this.assignServiceClientForm.value.address,
            phone: this.assignServiceClientForm.value.phone,
            serviceId: this.assignServiceClientForm.value.serviceId,
            opType: this.assignServiceClientForm.value.opType,
            typeOfTreatment: this.assignServiceClientForm.value.typeOfTreatment,
            otherBranchAddress: this.assignServiceClientForm.value.otherBranchAddress,
            otherBranchId: this.assignServiceClientForm.value.otherBranchId,
            onlineLink: this.assignServiceClientForm.value.onlineLink,
            duration: this.assignServiceClientForm.value.duration,
            branchId: this.assignServiceClientForm.value.branchId,
            branchAddress: this.assignServiceClientForm.value.branchAddress,
            branchType: this.assignServiceClientForm.value.branchType,
            slot: this.assignServiceClientForm.value.slot,
            longitude: this.clientAddressLongitude,
            latitude: this.clientAddressLatitude,
            startTime: this.slotStartTime,
            endTime: this.slotEndTime
          }
          console.log(data)
          this.AssignService.updateAssignService(data, this.assignServiceId).subscribe(res => {
            if (res.status) {
              if (this.serviceRequestId != undefined) {
                var data = {
                  "isAssigned": 1
                }
                this.ServiceRequestService.updateServiceRequest(data, this.serviceRequestId).subscribe(res => {
                  if (res.status) {
                    console.log(res.data, "gggg")
                  }
                })
              }
              this.FlashMessageService.successMessage("Assign service Client updated Successfully", 2);
              this.router.navigateByUrl("admin/assignService")
            }
            else {
              this.FlashMessageService.errorMessage("Assign service Client Updated Failed", 2);
            }
          })
        }
      }
    }
    else {
      this.FlashMessageService.errorMessage("Please Select Your Slot");
    }
  }

  //getServiceRequestById
  getServiceRequestById(id) {
    this.ServiceRequestService.getServiceRequestById(id).subscribe(res => {
      if (res.status) {
        this.serviceData = res.data
        if (this.serviceData.status != 0) {
          this.showAddEdit = true
          this.assignServiceForm.patchValue({
            staffId: this.serviceData.staffId,
            date: this.formatDate(this.serviceData.date),
          })
          this.clientArr = []
          this.ClientService.getClientById(this.serviceData.clientId).subscribe(res => {
            if (res.status) {
              this.clientArr.push({
                _id: res.data._id,
                clientName: res.data.clientName
              }
              )
            }
            this.assignServiceClientForm.patchValue({
              clientId: this.clientArr
            })
          })
          this.assignServiceClientForm.patchValue({
            serviceId: this.serviceData.serviceId
          })
          this.AssignService.getAssignServiceById(this.serviceData.assignServiceId).subscribe(res => {
            if (res.status) {
              this.assignSercieDataArr = res.data;
              if (this.assignSercieDataArr.branchType == 0) {
                this.branchList = []
                this.BranchService.getBranchbyId(this.assignSercieDataArr.branchId).subscribe(res => {
                  if (res.status) {
                    this.branchList.push({
                      _id: res.data._id,
                      branchName: res.data.branchName
                    });
                  }
                  this.assignServiceClientForm.patchValue({
                    branchId: this.assignSercieDataArr.branchId
                  })
                  this.getBranchbyId(this.assignSercieDataArr.branchId)
                })
              }
              else {
                this.getAllBranch();
                this.assignServiceClientForm.patchValue({
                  branchId: this.assignSercieDataArr.branchId
                })
                this.getBranchbyId(this.assignSercieDataArr.branchId)
              }
              if (this.serviceData.staffId != '') {
                this.onChangeStaff(this.serviceData.staffId)
              }
              if (this.assignSercieDataArr.typeOfTreatment != '') {
                this.changeOP(this.assignSercieDataArr.typeOfTreatment)
              }
              if (this.assignSercieDataArr.slot != '') {
                this.assignServiceClientForm.patchValue({
                  slot: this.assignSercieDataArr.slot
                })
                this.Slot(this.assignSercieDataArr.slot)
              }
              if (this.assignSercieDataArr.duration != '') {
                var data = {
                  staffId: this.serviceData.staffId,
                  date: this.serviceData.date,
                  slotId: this.assignSercieDataArr.slot,
                  duration: this.assignSercieDataArr.duration,
                  typeOfTreatment: this.assignSercieDataArr.typeOfTreatment
                }
                this.getSlotsForAssignService(data);
                this.dividingSlot(this.assignSercieDataArr.duration)
              }
              if (this.assignSercieDataArr.opType != '') {
                let type = this.assignSercieDataArr.opType
                if (type == 1) {
                  this.typeSelection = true;
                  this.getAllBranch();
                  this.assignServiceClientForm.patchValue({
                    otherBranchId: this.assignSercieDataArr.otherBranchId
                  })
                  this.getOtherBranchbyId(this.assignSercieDataArr.otherBranchId)
                }
                else {
                  this.typeSelection = false
                }
              }
              this.assignServiceClientForm.patchValue({
                duration: this.assignSercieDataArr.duration,
                branchType: this.assignSercieDataArr.branchType,
                typeOfTreatment: this.assignSercieDataArr.typeOfTreatment,
                opType: this.assignSercieDataArr.opType,
              })
            }
          })
        }
        else {
          this.assignServiceForm.patchValue({
            staffId: this.serviceData.staffId,
            date: this.formatDate(this.serviceData.date),
          })
          this.clientArr = []
          this.ClientService.getClientById(this.serviceData.clientId).subscribe(res => {
            if (res.status) {
              this.clientArr.push({
                _id: res.data._id,
                clientName: res.data.clientName
              }
              )
            }
            this.assignServiceClientForm.patchValue({
              clientId: this.clientArr
            })
          })
          this.assignServiceClientForm.patchValue({
            serviceId: this.serviceData.serviceId
          })
          this.onChangeStaff(this.serviceData.staffId)
        }
      }
    })
  }
}