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
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators'
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
  }

  ]
  public opTypes = [{
    'id': 0,
    'Name': 'Same Branch'
  },
  {
    'id': 1,
    'Name': 'Other Branch'
  },
  ]
  public clientId: {
    enableCheckAll: boolean; singleSelection: boolean; idField: string; textField: string;
    allowSearchFilter: boolean;
  };
  public clientArr: any = [];
  public showonline: boolean;
  public slotName: any = [];
  public serviceRequestId: any;
  public assignServiceId: any;
  public assignServiceArray: any;
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
  assignSercieDataArr: any;
  duration: any;

  constructor(private fb: FormBuilder, public StaffService: StaffService, public ClientService: ClientService, private route: ActivatedRoute, public ServiceService: ServiceService, public BranchService: BranchService, public AssignService: AssignService, public ServiceRequestService: ServiceRequestService, private FlashMessageService: FlashMessageService, private router: Router, private RoleService: RoleService) {
    this.route.params.subscribe((param) => {
      this.assignServiceId = param['assignServiceId'];
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

  }


  //initialAssignServiceForm
  initializeassignServiceForm() {
    this.assignServiceForm = this.fb.group({
      staffId: [''],
      date: ['', [Validators.required]],
    });
  }

  //initialAssignServiceClientForm
  initializeassignServiceClientForm() {
    this.assignServiceClientForm = this.fb.group({
      phone: [''],
      clientId: [''],
      address: ['', [Validators.required]],
      serviceId: ['',],
      opType: [''],
      typeOfTreatment: [''],
      otherBranchAddress: [''],
      otherBranchId: [''],
      onlineLink: [''],
      duration: [''],
      branchId: [''],
      branchAddress: [''],
      branchType: [''],
      slot: [''],
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
          if (staffValue.status == 0) {
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
        this.assignServiceArray = res.data;
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
          if (clientValue.status == 0) {
            this.clientList.push({
              _id: clientValue._id,
              clientName: clientValue.clientName
            });
          }
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

  //getAll Services
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
    this.StaffId = event.target.value
    this.getStaffById(this.StaffId);
  }

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
    var id = event.target.value
    this.isShowSlotTime = true
    this.AssignServiceDate = this.formatDate(this.assignServiceForm.value.date)
    var data = {
      staffId: this.StaffId,
      slotId: id
    }
    this.getSlotByStaffIdAndSlotId(data)
  }

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
    this.duration = event.target.value
    var formattedDates = this.formattedDate(this.assignServiceForm.value.date)
    var data = {
      staffId: this.assignServiceForm.value.staffId,
      date: formattedDates,
      slotId: this.assignServiceClientForm.value.slot,
      duration: this.assignServiceClientForm.value.duration,
      typeOfTreatment: this.assignServiceClientForm.value.typeOfTreatment
    }
    this.getSlotsForAssignService(data);
  }

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

  //saveAssignService
  saveAssignService() {
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
    this.AssignService.createAssignServiceClient(data).subscribe(res => {
      if (res.status) {
        this.FlashMessageService.successMessage("Assign service Client Created Successfully", 2);
        this.router.navigateByUrl("admin/assignService")
      }
      else {
        this.FlashMessageService.errorMessage("Assign service Client Created Failed", 2);
      }
    })
  }




  //editAssignServiceClient by Id
  editAssignServiceClient(id) {
    this.showAddEdit = true
  }

  //updateassignService
  updateassignService() {

  }

  //getAssignServiceById

  getAssignServiceById(id) {
    this.AssignService.getAssignServiceById(id).subscribe(res => {
      if (res.status) {
        this.assignSercieDataArr = res.data;
        this.assignServiceForm.patchValue({
          staffId: this.assignSercieDataArr.staffId,
          date: this.formatDate(this.assignSercieDataArr.date),
        })
        if (this.assignSercieDataArr.staffId != '') {
          this.getStaffById(this.assignSercieDataArr.staffId)
        }
        if (this.assignSercieDataArr.typeOfTreatment != '') {
          this.changeOP(this.assignSercieDataArr.typeOfTreatment)
        }
        if (this.assignSercieDataArr.slot != '') {
          this.AssignServiceDate = this.formatDate(this.assignSercieDataArr.date)
          var datas = {
            staffId: this.assignSercieDataArr.staffId,
            slotId: this.assignSercieDataArr.slot
          }
          this.getSlotByStaffIdAndSlotId(datas)
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
        }
        this.clientArr = []
        this.ClientService.getClientById(this.assignSercieDataArr.clientId).subscribe(res => {
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
          // branchId: this.assignSercieDataArr.branchId,
          serviceId: this.assignSercieDataArr.serviceId,
          slot: this.assignSercieDataArr.slot,
          typeOfTreatment: this.assignSercieDataArr.typeOfTreatment,
          opType: this.assignSercieDataArr.opType,
        })

      }
    })
  }









  // //getBranchbyId to patch branchaddress while selecting Branch
  // getBranchbyId() {
  //   var id = this.assignServiceBranchForm.value.branchId
  //   this.BranchService.getBranchbyId(id).pipe(takeUntil(this.destroy$)).subscribe(res => {
  //     if (res.status) {
  //       this.BranchDatavalue = res.data
  //       this.assignServiceBranchForm.controls['branchAddress'].patchValue(this.BranchDatavalue.branchAddress);
  //     }
  //   })
  // }



  // //getAllAssignService For both allClient and allBranch 
  // getAllAssignService() {
  //   this.AssignService.getAllAssignServiceAllClient().subscribe(res => {
  //     if (res.status) {
  //       this.assignServiceList1 = res.data;
  //       this.assignServiceClientList = []
  //       this.assignServiceList1.forEach(element => {
  //         var clientData = {
  //           _id: element._id,
  //           staffName: element.staffData.staffName,
  //           date: this.formatDate(element.date),
  //           clientName: element.clientName,
  //           address: element.address,
  //           phone: element.phone,
  //           serviceName: element.servicesData.serviceName,
  //           time: element.time.slice(11, 16),
  //           status: element.status
  //         }
  //         this.assignServiceClientList.push(clientData)
  //       });
  //     }
  //   })
  //   this.AssignService.getAllAssignServiceAllBranch().subscribe(res => {
  //     if (res.status) {
  //       this.assignServiceList2 = res.data;
  //       this.assignServiceBranchList = []

  //       this.assignServiceList2.forEach(element => {
  //         var BranchData = {
  //           _id: element._id,
  //           staffName: element.staffData.staffName,
  //           date: this.formatDate(element.date),
  //           branchName: element.branchData.branchName,
  //           phoneForBranch: element.phoneForBranch,
  //           startTime: element.startTime.slice(11, 16),
  //           endTime: element.endTime.slice(11, 16),
  //           branchAddress: element.branchAddress,
  //           status: element.status
  //         }
  //         this.assignServiceBranchList.push(BranchData)
  //       });
  //     }
  //   })
  // }

  // //-----------------------------------CLIENT API INTEGRATION - START -------------------------------------------//

  // //save API for Client
  // saveassignServiceclient() {
  //   this.isassignServiceClientFormSubmitted = true
  //   this.isassignServiceFormSubmitted = true


  //   if (this.assignServiceClientForm.valid && this.assignServiceForm.valid) {
  //     var data = {
  //       date: this.assignServiceForm.value.date,
  //       staffId: this.assignServiceForm.value.staffId,
  //       clientName: this.assignServiceClientForm.value.clientName,
  //       address: this.assignServiceClientForm.value.address,
  //       phone: this.assignServiceClientForm.value.phone,
  //       service: this.assignServiceClientForm.value.service,
  //       time: this.assignServiceClientForm.value.time
  //     }
  //     this.AssignService.createAssignServiceClient(data).subscribe((res) => {
  //       if (res.status) {
  //         this.FlashMessageService.successMessage("Assign service Client Created Successfully", 2);
  //         this.getAllAssignService();
  //       }
  //       else {
  //         this.FlashMessageService.errorMessage("Assign service Client Created failed!", 2)
  //       }
  //     })
  //   }
  // }

  // //edit-Patch API for Client
  // async editAssignServiceClient(id) {


  //   this.showAddEdit = true
  //   const assignService = Parse.Object.extend('AssignService');
  //   const query = new Parse.Query(assignService);

  //   query.equalTo('objectId', id);

  //   this.routerData = id
  //   try {
  //     const results = await query.find();

  //     for (const branch of results) {
  //       // Access the Parse Object attributes using the .GET method
  //       const staffName = branch.get('StaffId')
  //       const Date = branch.get('Date')
  //       const ClientId = branch.get('ClientId')
  //       const Phone = branch.get('Phone')
  //       const Address = branch.get('Address')
  //       const patientType = branch.get('PatientType')
  //       const Duration = branch.get('Duration')
  //       this.Slotdata = branch.get('Slot')
  //       const branchId = branch.get('BranchId')
  //       const BranchAddress = branch.get('BranchAddress')
  //       const Service = branch.get('Service')
  //       const BranchType = branch.get('BranchType')
  //       const OtherBranchId = branch.get('OtherBranchId')
  //       const otherBranchAddress = branch.get('OtherBranchAddress')

  //       this.assignServiceForm.get('staffId').patchValue(staffName)
  //       this.assignServiceForm.get('date').patchValue(Date.toLocaleString("en-CA").slice(0, 10))
  //       this.assignServiceClientForm.get('clientName').patchValue(ClientId)
  //       this.assignServiceClientForm.get('phone').patchValue(Phone)
  //       this.assignServiceClientForm.get('address').patchValue(Address)
  //       this.assignServiceClientForm.get('patientType').patchValue(patientType)
  //       this.assignServiceClientForm.get('duration').patchValue(Duration)
  //       this.assignServiceClientForm.get('slot').patchValue(this.Slotdata)
  //       this.assignServiceClientForm.get('branchId').patchValue(branchId)
  //       this.assignServiceClientForm.get('branchAddress').patchValue(BranchAddress)
  //       this.assignServiceClientForm.get('service').patchValue(Service)
  //       this.assignServiceClientForm.get('branchType').patchValue(BranchType)
  //       this.assignServiceClientForm.get('otherBranchId').patchValue(OtherBranchId)
  //       this.assignServiceClientForm.get('otherBranchAddress').patchValue(otherBranchAddress)
  //     }
  //   } catch (error) {
  //     console.error('Error while fetching ToDo', error);
  //   }
  //   if (this.Slotdata) {

  //     var duration = 30
  //     console.log(typeof (duration), duration)

  //     var start_time = this.parseTime(this.startTime)
  //     var end_time = this.parseTime(this.endTime)
  //     var interval: any = 30
  //     console.log(start_time, end_time)

  //     var times_ara = this.calculate_time_slot(start_time, end_time, interval);

  //     this.timeInterval = [];



  //     for (let i = 0; i < times_ara.length; i++) {

  //       if (i != times_ara.length - 1) {

  //         this.timeInterval.push(times_ara[i] + "-" + times_ara[i + 1])
  //         //  const tt={... this.timeInterval}
  //         //  console.log(tt)
  //         //  this.timeIntervalSlot.splice(index,1,this.timeInterval)
  //       }
  //     }

  //   }
  // }


  // //save API for Branch
  // saveassignServiceBranch() {
  //   this.isassignServiceBranchFormSubmitted = true
  //   this.isassignServiceFormSubmitted = true

  //   if (this.assignServiceBranchForm.valid && this.assignServiceForm.valid) {
  //     var data = {
  //       date: this.assignServiceForm.value.date,
  //       staffId: this.assignServiceForm.value.staffId,
  //       branchId: this.assignServiceBranchForm.value.branchId,
  //       branchAddress: this.assignServiceBranchForm.value.branchAddress,
  //       phoneForBranch: this.assignServiceBranchForm.value.phoneForBranch,
  //       startTime: this.assignServiceBranchForm.value.startTime,
  //       endTime: this.assignServiceBranchForm.value.endTime
  //     }

  //     this.AssignService.createAssignServiceBranch(data).subscribe((res) => {
  //       if (res.status) {
  //         this.FlashMessageService.successMessage("Assign service Branch Created Successfully", 2);
  //         this.getAllAssignService();
  //       }
  //       else {
  //         this.FlashMessageService.errorMessage("Assign service Branch Created failed!", 2)
  //       }
  //     })
  //   }
  // }

  // //edit-patch API for Branch
  // editAssignServiceBranch(id) {

  //   this.showAddEdit = true
  //   this.AssignService.getAllAssignServiceBranchbyId(id).subscribe((res) => {
  //     if (res.status) {
  //       this.assignServiceBranchData = res.data
  //       var startTime = this.assignServiceBranchData.startTime.slice(11, 16)
  //       var endTime = this.assignServiceBranchData.endTime.slice(11, 16)

  //       this.assignServiceForm.controls['staffId'].patchValue(this.assignServiceBranchData.staffId);
  //       this.assignServiceForm.controls['date'].patchValue(this.formattedDate(this.assignServiceBranchData.date));
  //       this.assignServiceBranchForm.controls['branchId'].patchValue(this.assignServiceBranchData.branchId);
  //       this.assignServiceBranchForm.controls['branchAddress'].patchValue(this.assignServiceBranchData.branchAddress);
  //       this.assignServiceBranchForm.controls['phoneForBranch'].patchValue(this.assignServiceBranchData.phoneForBranch);
  //       this.assignServiceBranchForm.controls['startTime'].patchValue(startTime);
  //       this.assignServiceBranchForm.controls['endTime'].patchValue(endTime);
  //     }
  //   })
  // }

  // //update API for Branch
  // updateassignServiceBranch() {


  // }

  // //-----------------------------------BRANCH API INTEGRATION - END -------------------------------------------//

  // //radio click Client
  // clickClient() {
  //   this.assignServiceForm.reset();
  //   this.assignServiceClientForm.reset();
  //   this.initializeassignServiceForm();
  //   this.initializeassignServiceClientForm();
  // }

  // //radio click Branch
  // clickBranch() {
  //   this.assignServiceForm.reset();
  //   this.assignServiceBranchForm.reset();
  //   this.initializeassignServiceForm();
  //   this.initializeassignServiceBranchForm();
  // }

  // //formatDate -dd/mm/yyyy
  // formatDate(date) {
  //   var d = new Date(date),
  //     month = '' + (d.getMonth() + 1),
  //     day = '' + d.getDate(),
  //     year = d.getFullYear();
  //   if (month.length < 2)
  //     month = '0' + month;
  //   if (day.length < 2)
  //     day = '0' + day;

  //   return [day, month, year].join('-');
  // }

  // //formattedDate -yyyy/mm/dd
  // formattedDate(date) {
  //   var d = new Date(date),
  //     month = '' + (d.getMonth() + 1),
  //     day = '' + d.getDate(),
  //     year = d.getFullYear();
  //   if (month.length < 2)
  //     month = '0' + month;
  //   if (day.length < 2)
  //     day = '0' + day;
  //   return [year, month, day].join('-');
  // }


  // //-----------------------------------Back4App API INTEGRATION - START -------------------------------------------//
  // //staff getAll
  // async getAllStaffbase4App() {
  //   const staff = Parse.Object.extend('Staff');
  //   const query = new Parse.Query(staff);


  //   try {
  //     const StaffData = await query.find()
  //     StaffData.forEach(element => {

  //       this.staffId.push(element.id);
  //     });

  //     for (const staffs of StaffData) {
  //       this.StaffName.push(staffs.get("StaffName"))
  //       this.staffStatus.push(staffs.get("Status"))
  //     }


  //     for (let i = 0; i < this.staffId.length; i++) {
  //       this.staffDataArr.push(
  //         {
  //           "_id": this.staffId[i],
  //           "StaffName": this.StaffName[i],
  //           "status": this.staffStatus[i]

  //         }
  //       )
  //     }

  //     for (let i = 0; i < this.staffId.length; i++) {
  //       if (this.staffStatus[i] == 0)
  //         this.staffNameArr.push({
  //           "staffId": this.staffId[i],
  //           "staffName": this.StaffName[i],
  //         })
  //     }

  //     this.staffNameArr.forEach(element => {

  //       this.staffNameData = element.staffName
  //       this.staffIdData = element.staffNameArr

  //     });
  //   }
  //   catch (error) {
  //     alert(`Failed to retrieve the object, with error code: ${error.message}`);
  //   }

  // }
  // //Client getAll
  // async getAllClientInBase4App() {
  //   const branch = Parse.Object.extend('Client');
  //   const query = new Parse.Query(branch);


  //   try {
  //     const clientName = await query.find()
  //     clientName.forEach(element => {
  //       this.ClientId.push(element.id);
  //     });
  //     for (const ClientData of clientName) {
  //       this.ClientName.push(ClientData.get("ClientName"));
  //       this.ClientStatus.push(ClientData.get("ClientStatus"))

  //       //  this.ClientStatus.push(ClientData.get("BranchStatus"))
  //     }

  //     // this.dtTrigger.next(null);
  //     for (let i = 0; i < this.ClientId.length; i++) {



  //       this.ClientDataArr.push(
  //         {
  //           "ClientName": this.ClientName[i],
  //           "ClientId": this.ClientId[i],
  //           "status": this.ClientStatus[i],

  //         }
  //       )

  //     }

  //     for (let i = 0; i < this.ClientId.length; i++) {
  //       if (this.ClientStatus[i] == 0)
  //         this.clientNameArr.push({
  //           "ClientName": this.ClientName[i],
  //           "ClientId": this.ClientId[i],
  //         })
  //     }

  //   }
  //   catch (error) {
  //     alert(`Failed to retrieve the object, with error code: ${error.message}`);
  //   }

  // }
  // //Add Staff Base4 App
  // //Get All Branch In Base4App
  // async getAllBranchInBase4App() {
  //   const branch = Parse.Object.extend('Branch');
  //   const query = new Parse.Query(branch);
  //   try {
  //     const branchName = await query.find()
  //     branchName.forEach(element => {
  //       this.branchId.push(element.id);
  //     });
  //     for (const branchData of branchName) {
  //       this.BranchName.push(branchData.get("BranchName"));
  //       this.BranchStatus.push(branchData.get("BranchStatus"))
  //     }
  //     for (let i = 0; i < this.branchId.length; i++) {
  //       this.BranchDataArr.push(
  //         {
  //           "BranchName": this.BranchName[i],
  //           "Branchstatus": this.BranchStatus[i],
  //           "BranchId": this.branchId[i]
  //         }

  //       )
  //     }

  //     for (let i = 0; i < this.branchId.length; i++) {
  //       if (this.BranchStatus[i] == 0)
  //         this.BranchNameArr.push({
  //           "BranchName": this.BranchName[i],
  //           "BranchId": this.branchId[i]
  //         })
  //     }

  //   }
  //   catch (error) {
  //     alert(`Failed to retrieve the object, with error code: ${error.message}`);
  //   }

  // }
  // //Get All Service In Base4App
  // async getAllServicesInBase4App() {
  //   const service = Parse.Object.extend('Service');
  //   const query = new Parse.Query(service);


  //   try {
  //     const serviceName = await query.find()
  //     serviceName.forEach(element => {

  //       this.serviceid.push(element.id);
  //     });
  //     for (const serviceData of serviceName) {
  //       this.ServiceName.push(serviceData.get("ServiceName"));
  //       this.Duration.push(serviceData.get("Duration"));
  //       this.ServiceStaus.push(serviceData.get("Status"))

  //     }
  //     for (let i = 0; i < this.serviceid.length; i++) {
  //       this.serviceDataArr.push(
  //         {
  //           "serviceName": this.ServiceName[i],
  //           "Duration": this.Duration[i],
  //           "objectId": this.serviceid[i],
  //           "status": this.ServiceStaus[i]
  //         }
  //       )
  //     }
  //     for (let i = 0; i < this.serviceid.length; i++) {
  //       if (this.ServiceStaus[i] == 0)
  //         this.seviceArr.push({
  //           "serviceName": this.ServiceName[i],
  //         })
  //     }




  //   }
  //   catch (error) {
  //     alert(`Failed to retrieve the object, with error code: ${error.message}`);
  //   }

  // }

  // //onlinechange
  // // changeOnline(e){
  // //   this.showOnline=(e.target.value=2)?! this.showOnline: this.showOnline
  // // }
  // async dividBySlotTime(e) {

  //   var value;
  //   if (e.target == undefined) {
  //     value = e
  //     this.staffIdData1 = e;
  //   }
  //   else {
  //     value = e.target.value
  //     this.staffIdData1 = e.target.value
  //   }

  //   this.getstaff = value

  //   const staffs1 = Parse.Object.extend('Staff');
  //   const query = new Parse.Query(staffs1);

  //   query.equalTo('objectId', value);

  //   try {
  //     const staff = await query.get(value)

  //     const staffName = staff.get("StaffName",)

  //     this.staffName = staffName
  //   }

  //   catch (error) {
  //     console.error('Error while fetching ToDo', error);
  //   }


  //   const staffs = Parse.Object.extend('Staff');
  //   this.query3 = new Parse.Query(staffs);


  //   this.query3.equalTo('objectId', value);

  //   try {
  //     const staff = await this.query3.get(value)
  //     this.staffRole = staff.get("StaffRole")
  //   }

  //   catch (error) {
  //     console.error('Error while fetching ToDo', error);
  //   }
  //   const role = Parse.Object.extend('RolePosition');
  //   const query1 = new Parse.Query(role);

  //   query1.equalTo('objectId', this.staffRole);

  //   try {
  //     const role = await query1.get(this.staffRole)
  //     const Role = role.get('Role')
  //     this.addRole = role.get('AddRole')
  //     const endTime = role.get('EndTime')


  //   }

  //   catch (error) {
  //     console.error('Error while fetching ToDo', error);
  //   }

  //   var branchId = this.assignServiceClientForm.value.branchId
  //   const branch = Parse.Object.extend('Branch');
  //   const query6 = new Parse.Query(branch);

  //   query6.equalTo('objectId', branchId);

  //   try {
  //     const results = await query.find();

  //     for (const branch of results) {

  //       const BranchAddress = branch.get('BranchAddress')
  //       const BranchName = branch.get('BranchName')
  //       this.homeBranchLatitude = branch.get('Latitude')
  //       this.homeBranchLongitude = branch.get('Longitude')



  //       this.branchNamedata = BranchName

  //       this.assignServiceClientForm.get('branchAddress').patchValue(BranchAddress)

  //     }


  //   } catch (error) {
  //     console.error('Error while fetching ToDo', error);
  //   }
  //   this.AssignServiceData = []
  //   let parseQuery = new Parse.Query('AssignService');

  //   parseQuery.contains('StaffId', e.target.value);
  //   var queryResults = await parseQuery.find();

  //   queryResults.forEach((element) => {
  //     this.assignId.push(element.id)
  //   })
  //   for (let i = 0; i < queryResults.length; i++) {

  //     var assignserviceData = {
  //       StaffName: queryResults[i].get("StaffName"),
  //       ClientName: queryResults[i].get('ClientName'),
  //       Address: queryResults[i].get("Address"),
  //       Date: queryResults[i].get('Date').toLocaleString("en-CA").slice(0, 10),
  //       Phone: queryResults[i].get("Phone"),
  //       Service: queryResults[i].get("Service"),
  //       StartTime: this.getTime(queryResults[i].get('StartTime')),
  //       EndTime: this.getTime(queryResults[i].get('EndTime')),
  //       Status: queryResults[i].get("Status"),
  //       Action: this.assignId[i],

  //     }

  //     this.AssignServiceData.push(assignserviceData)

  //   }

  // }
  // async getBranchbyIdBack4App(e) {

  //   var branchId = this.assignServiceClientForm.value.branchId
  //   const branch = Parse.Object.extend('Branch');
  //   const query = new Parse.Query(branch);

  //   query.equalTo('objectId', branchId);

  //   try {
  //     const results = await query.find();

  //     for (const branch of results) {

  //       const BranchAddress = branch.get('BranchAddress')
  //       const BranchName = branch.get('BranchName')
  //       this.homeBranchLatitude = branch.get('Latitude')
  //       this.homeBranchLongitude = branch.get('Longitude')



  //       this.branchNamedata = BranchName

  //       this.assignServiceClientForm.get('branchAddress').patchValue(BranchAddress)

  //     }


  //   } catch (error) {

  //   }

  // }
  // async getClientById(event) {


  //   var id = event.target.value;

  //   this.ClientService.getClientById(id).subscribe(res => {
  //     if (res.status) {
  //       this.clientByIdData = res.data;
  //     }
  //     this.assignServiceClientForm.controls['phone'].patchValue(this.clientByIdData.phoneNumber);
  //     this.assignServiceClientForm.get('address').patchValue(this.clientByIdData.address)
  //     this.assignServiceClientForm.get('service').patchValue(this.clientByIdData.serviceId)
  //     if (this.clientByIdData.homeBranchId) {
  //       this.assignServiceClientForm.get('branchType').patchValue(0)
  //     }
  //     this.assignServiceClientForm.get('branchAddress').patchValue(this.clientByIdData.homeBranchaddress)
  //     this.assignServiceClientForm.get('type').patchValue(this.clientByIdData.typeofTreatment)
  //     this.handleAddressChange(this.clientByIdData.address)
  //   })
  // }
  // async getotherBranchbyId() {

  //   var branchId = this.assignServiceClientForm.value.otherBranchId
  //   const branch = Parse.Object.extend('Branch');
  //   const query = new Parse.Query(branch);

  //   query.equalTo('objectId', branchId);

  //   try {
  //     const results = await query.find();

  //     for (const branch of results) {

  //       const BranchAddress = branch.get('BranchAddress')

  //       this.assignServiceClientForm.get('otherBranchAddress').patchValue(BranchAddress)

  //     }
  //   } catch (error) {
  //     console.error('Error while fetching ToDo', error);
  //   }
  // }

  // async saveAssignServiceback4App() {

  //   var dateAndStartTime = this.assignServiceForm.value.date + "t" + this.assignServiceClientForm.value.startTime
  //   var dateAndEndTime = this.assignServiceForm.value.date + " t" + this.assignServiceClientForm.value.endTime
  //   const event = new Date(dateAndStartTime);
  //   //  console.log(this.assignServiceForm.value.date, "this.assignServiceForm.value.date", new Date(this.assignServiceForm.value.date))
  //   const assignService = new Parse.Object("AssignService");

  //   if (this.serviceRequestId != undefined) {

  //     var parts = this.assignServiceForm.value.date.split('-');
  //     var mydate = new Date(parseInt(parts[2]), parseInt((parts[1])) - 1, parseInt(parts[0]));

  //     assignService.set("Date", (mydate));
  //   }
  //   else {

  //     assignService.set("Date", (this.assignServiceForm.value.date))
  //   }
  //   assignService.set("BranchName", this.branchNamedata)
  //   assignService.set("ClientName", this.ClientNameData)
  //   assignService.set("StaffName", this.staffName)
  //   assignService.set("StaffId", this.assignServiceForm.value.staffId)

  //   assignService.set("AssignService", 0);
  //   assignService.set("ClientId", this.assignServiceClientForm.value.clientName)
  //   assignService.set("Phone", this.assignServiceClientForm.value.phone);
  //   assignService.set("Address", this.assignServiceClientForm.value.address);
  //   assignService.set("Service", this.assignServiceClientForm.value.service)
  //   // assignService.set("StartTime", dateAndStartTime);
  //   // assignService.set("EndTime",dateAndEndTime);

  //   assignService.set("PatientType", this.assignServiceClientForm.value.patientType)
  //   assignService.set("OtherBranchAddress", this.assignServiceClientForm.value.otherBranchAddress);
  //   assignService.set("OtherBranchId", this.assignServiceClientForm.value.otherBranchId);
  //   assignService.set("OnlineLink", this.assignServiceClientForm.value.onlineLink);
  //   assignService.set("Duration", this.assignServiceClientForm.value.duration)
  //   assignService.set("BranchId", this.assignServiceClientForm.value.branchId);
  //   assignService.set("BranchAddress", this.assignServiceClientForm.value.branchAddress);
  //   assignService.set("OpType", this.assignServiceClientForm.value.opType);
  //   assignService.set("BranchType", this.assignServiceClientForm.value.branchType);
  //   assignService.set("Slot", this.assignServiceClientForm.value.slot);
  //   assignService.set("Duration", this.assignServiceClientForm.value.duration);
  //   assignService.set("StartTime", this.startTimeData);
  //   assignService.set("EndTime", this.endTimeData);
  //   assignService.set("Rating", "");
  //   assignService.set("Feedback", "");
  //   assignService.set("Location", "")
  //   assignService.set("Transport", "");
  //   assignService.set("TransportCharge", "");
  //   assignService.set("Latitude", this.homeBranchLatitude);
  //   assignService.set("Longitude", this.homeBranchLongitude);
  //   assignService.set("Status", "0");
  //   assignService.set("SLat", "")
  //   assignService.set("SLong", "");
  //   assignService.set("Reason", "");
  //   assignService.set("ELat", "");
  //   assignService.set("ELong", "");
  //   assignService.set("PaymentNumber", "");
  //   assignService.set("actualStartTime",)
  //   assignService.set("actualEndTime",)



  //   try {
  //     let result = await assignService.save()

  //     this.FlashMessageService.successMessage("Assign Service Created Successfully", 2);
  //     this.router.navigateByUrl('admin/assignService')
  //   } catch (error) {

  //     this.FlashMessageService.errorMessage("Error while Creating Assign Service", 2);
  //   }
  //   if (this.serviceRequestId != undefined) {
  //     const service2 = new Parse.Object('RequestService');
  //     service2.set('objectId', this.serviceRequestId);
  //     service2.set("isAssigned", true);
  //     try {
  //       let result = await service2.save();
  //     }
  //     catch (e) {
  //       console.log("error", e)
  //     }
  //   }
  // }

  // public inputdobValidator(event: any) {
  //   const pattern = /^\-[0-9]*$/;
  //   if (!pattern.test(event.target.value)) {
  //     event.target.value = event.target.value.replace(/[^\-0-9]/g, "");
  //   }
  // }
  // async updateassignServiceclient() {
  //   var dateAndStartTime = this.assignServiceForm.value.date + "t" + this.assignServiceClientForm.value.startTime
  //   var dateAndEndTime = this.assignServiceForm.value.date + " t" + this.assignServiceClientForm.value.endTime
  //   const event = new Date(dateAndStartTime);
  //   const assignService = new Parse.Object("AssignService");
  //   assignService.set('objectId', this.routerData);
  //   assignService.set("BranchName", this.branchNamedata)
  //   assignService.set("ClientName", this.ClientNameData)
  //   assignService.set("StaffName", this.staffName)
  //   assignService.set("StaffId", this.assignServiceForm.value.staffId)
  //   assignService.set("Date", new Date(this.assignServiceForm.value.date));
  //   assignService.set("AssignService", 0);
  //   assignService.set("ClientId", this.assignServiceClientForm.value.clientName)
  //   assignService.set("Phone", this.assignServiceClientForm.value.phone);
  //   assignService.set("Address", this.assignServiceClientForm.value.address);
  //   assignService.set("Service", this.assignServiceClientForm.value.service)
  //   // assignService.set("StartTime", dateAndStartTime);
  //   // assignService.set("EndTime",dateAndEndTime);
  //   assignService.set("PatientType", this.assignServiceClientForm.value.patientType)
  //   assignService.set("OtherBranchAddress", this.assignServiceClientForm.value.otherBranchAddress);
  //   assignService.set("OtherBranchId", this.assignServiceClientForm.value.otherBranchId);
  //   assignService.set("OnlineLink", this.assignServiceClientForm.value.onlineLink);
  //   assignService.set("Duration", this.assignServiceClientForm.value.duration)
  //   assignService.set("BranchId", this.assignServiceClientForm.value.branchId);
  //   assignService.set("BranchAddress", this.assignServiceClientForm.value.branchAddress);
  //   assignService.set("OpType", this.assignServiceClientForm.value.opType);
  //   assignService.set("BranchType", this.assignServiceClientForm.value.branchType);
  //   assignService.set("Slot", this.assignServiceClientForm.value.slot);
  //   assignService.set("Duration", this.assignServiceClientForm.value.duration);
  //   assignService.set("StartTime", this.startTimeData);
  //   assignService.set("EndTime", this.endTimeData);
  //   assignService.set("Rating", "");
  //   assignService.set("Feedback", "");
  //   assignService.set("Location", "")
  //   assignService.set("Transport", "");
  //   assignService.set("TransportCharge", "");
  //   assignService.set("Latitude", this.homeBranchLatitude);
  //   assignService.set("Longitude", this.homeBranchLongitude);
  //   assignService.set("Status", "0");
  //   assignService.set("SLat", "")
  //   assignService.set("SLong", "");
  //   assignService.set("Reason", "");
  //   assignService.set("ELat", "");
  //   assignService.set("ELong", "");
  //   assignService.set("PaymentNumber", "");
  //   assignService.set("actualStartTime",)
  //   assignService.set("actualEndTime",)



  //   try {
  //     let result = await assignService.save()

  //     this.FlashMessageService.successMessage("Assign Service Created Successfully", 2);
  //     this.router.navigateByUrl('admin/assignService')
  //   } catch (error) {
  //     this.FlashMessageService.errorMessage("Error while Creating Assign Service", 2);
  //   }
  // }

  // Slot(e) {

  //   this.slotTime = e.target.value

  //   this.addRole.forEach(element => {
  //     if (element.slotName == this.slotTime) {
  //       this.startTime = element.startTime
  //       this.endTime = element.endTime

  //     }
  //   });
  // }
  // getTime(date) {
  //   var d = new Date(date);
  //   var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  //   var nd = new Date(utc + (3600000 * +5.5));
  //   var ist = nd.toLocaleString();
  //   var ist1 = ist.split(", ")[1];
  //   var startTime = ist1;

  //   return (startTime)
  // }
  // async date(e, status) {
  //   if (status == 0) {
  //     this.AssignServiceDate = this.formattedDate(e);
  //   }
  //   else {
  //     this.AssignServiceDate = e;
  //   }
  //   var data = {
  //     staffId: this.staffIdData1,
  //     date: this.AssignServiceDate
  //   }
  //   // this.getAllAssignServceByStaffIdAndDate(data);
  //   // console.log("this.AssignServiceDate", this.AssignServiceDate, this.staffIdData1)
  //   // this.sdate = new Date(e)
  //   // console.log(this.sdate)
  //   // // this.isShowSlotTime = true
  //   // this.AssignServiceData = []
  //   // let parseQuery = new Parse.Query('AssignService');
  //   // parseQuery.contains('StaffId', this.staffIdData1);
  //   // parseQuery.equalTo('Date', this.sdate);
  //   // var queryResults = await parseQuery.find();
  //   // console.log(queryResults);
  //   // for (let i = 0; i < queryResults.length; i++) {
  //   //   var assignserviceData = {
  //   //     StaffName: queryResults[i].get("StaffName"),
  //   //     ClientName: queryResults[i].get('ClientName'),
  //   //     Address: queryResults[i].get("Address"),
  //   //     Date: queryResults[i].get('Date').toLocaleString("en-CA").slice(0, 10),
  //   //     Phone: queryResults[i].get("Phone"),
  //   //     Service: queryResults[i].get("Service"),
  //   //     StartTime: this.getTime(queryResults[i].get('StartTime')),
  //   //     EndTime: this.getTime(queryResults[i].get('EndTime')),
  //   //     Status: queryResults[i].get("Status"),
  //   //     Action: queryResults[i].id,
  //   //   }

  //   //   console.log(assignserviceData)
  //   //   this.AssignServiceData.push(assignserviceData)
  //   //   console.log(this.AssignServiceData)
  //   // }


  //   // for (let result of queryResults) {
  //   //   // You access `Parse.Objects` attributes by using `.get`
  //   //   console.log(queryResults[0]);
  //   // };

  // }
  // parseTime(s) {
  //   var c = s.split(':');
  //   return parseInt(c[0]) * 60 + parseInt(c[1]);
  // }
  // //-------------------------------------------------------------------------------------------------------------------------------
  // convertHours(mins) {
  //   var hour = Math.floor(mins / 60);
  //   var mins: any = mins % 60;
  //   var converted = this.pad(hour, 2) + ':' + this.pad(mins, 2);
  //   return converted;
  // }

  // pad(str, max) {
  //   str = str.toString();
  //   return str.length < max ? this.pad("0" + str, max) : str;
  // }

  // calculate_time_slot(start_time, end_time, interval) {

  //   var i, formatted_time;
  //   var time_slots = new Array();
  //   for (var i = start_time; i <= end_time; i = i + interval) {
  //     formatted_time = this.convertHours(i);
  //     time_slots.push(formatted_time);
  //   }
  //   return time_slots;
  // }

  // async getServiceRequestById(id) {
  //   this.ServiceRequestService.getServiceRequestById(id).subscribe(res => {
  //     if (res.status) {
  //       this.serviceRequestData = res.data;

  //       this.date(this.formatDate(this.serviceRequestData.get("Date")), 1);
  //       this.assignServiceClientForm.get('staffId').patchValue(this.serviceRequestData.clientId)
  //       this.assignServiceClientForm.get('clientName').patchValue(this.serviceRequestData.clientId)
  //       this.assignServiceClientForm.get('phone').patchValue(this.serviceRequestData.phone)
  //       this.assignServiceClientForm.get('address').patchValue(this.serviceRequestData.address)
  //       // this.assignServiceClientForm.get('patientType').patchValue(this.serviceRequestData[0].get("typeofTreatment"))
  //       // this.assignServiceClientForm.get('branchId').patchValue(branchData[0].id)
  //       // this.assignServiceClientForm.get('branchType').patchValue('0')
  //       // this.assignServiceClientForm.get('branchAddress').patchValue(branchData[0].get("BranchAddress"))
  //       this.assignServiceClientForm.get('service').patchValue(this.serviceRequestData.serviceId)
  //     }
  //   })
  // }
  // async getServiceRequestFromBack4App(id) {
  //   this.serviceData = [];

  //   const service = Parse.Object.extend('RequestService');
  //   const query = new Parse.Query(service);
  //   const serviceRequestData = await query.get(id)
  //   const client = Parse.Object.extend('Client');
  //   const query2 = new Parse.Query(client);
  //   query2.equalTo('objectId', serviceRequestData.get("ClientId"));
  //   const ClientData = await query2.find()

  //   const service2 = Parse.Object.extend('Service');
  //   const query3 = new Parse.Query(service2);
  //   query3.equalTo('objectId', serviceRequestData.get("ServiceId"));
  //   const serviceData = await query3.find()

  //   const branch = Parse.Object.extend('Branch');
  //   const query4 = new Parse.Query(branch);
  //   query4.equalTo('objectId', ClientData[0].get("HomeBranch"));
  //   const branchData = await query4.find()
  //   let StaffDataId;

  //   if (serviceRequestData.get("Status") == 1) {
  //     const staff = Parse.Object.extend('Staff');
  //     const query2 = new Parse.Query(staff);
  //     query2.equalTo('objectId', serviceRequestData.get("StaffId"));
  //     const StaffData = await query2.find()
  //     StaffDataId = StaffData[0].id;

  //     this.assignServiceForm.get('staffId').patchValue(StaffData[0].id)
  //     this.dividBySlotTime(StaffData[0].id);

  //   }
  //   var data = {
  //     id: serviceRequestData.id,
  //     patientName: ClientData[0].get("ClientName"),
  //     date: serviceRequestData.get("Date"),
  //     service: serviceData[0].get("ServiceName"),
  //   }

  //   this.assignServiceForm.get('date').patchValue(this.formatDate(serviceRequestData.get("Date")))

  //   this.date(this.formatDate(serviceRequestData.get("Date")), 1);
  //   this.assignServiceClientForm.get('clientName').patchValue(ClientData[0].id)
  //   this.assignServiceClientForm.get('phone').patchValue(ClientData[0].get("PhoneNumber"))
  //   this.assignServiceClientForm.get('address').patchValue(ClientData[0].get("Address"))
  //   this.assignServiceClientForm.get('patientType').patchValue(ClientData[0].get("typeofTreatment"))
  //   this.assignServiceClientForm.get('branchId').patchValue(branchData[0].id)
  //   this.assignServiceClientForm.get('branchType').patchValue('0')
  //   this.assignServiceClientForm.get('branchAddress').patchValue(branchData[0].get("BranchAddress"))
  //   this.assignServiceClientForm.get('service').patchValue(serviceData[0].get("ServiceName"))

  // }
  // dividingSlot(e) {

  //   var duration = e.target.value
  //   var start_time = this.parseTime(this.startTime)
  //   var end_time = this.parseTime(this.endTime)
  //   var interval: any = parseInt(duration);

  //   var times_ara = this.calculate_time_slot(start_time, end_time, interval);
  //   this.timeInterval = [];
  //   for (let i = 0; i < times_ara.length; i++) {
  //     if (i != times_ara.length - 1) {
  //       this.timeInterval.push(times_ara[i] + "-" + times_ara[i + 1])
  //     }
  //   }
  //   this.isShowSlotTime = true
  // }
  // slotSelection(e, index) {
  //   this.slotTime = e
  //   var slotStartTime = this.slotTime.slice(0, 5);
  //   var slotEndTime = this.slotTime.slice(6);
  //   this.startTimeData = new Date(this.AssignServiceDate + " " + slotStartTime)
  //   this.endTimeData = new Date(this.AssignServiceDate + " " + slotEndTime)
  //   this.slotSelectedIndex = index
  // }
  // //Get All Branch In Base4App
  // async getAllAssignInBase4App() {


  //   const assignService = Parse.Object.extend('AssignService');
  //   const query = new Parse.Query(assignService);
  //   try {
  //     const assignService = await query.find()
  //     for (const assignServicehData of assignService) {
  //       // this.assignServiceData.push(assignService.get("BranchName"));
  //       this.ClientId.push(assignServicehData.get("ClientId"));
  //       this.StaffId.push(assignServicehData.get("StaffId"))
  //       this.Phone.push(assignServicehData.get("Phone"));
  //       this.Address.push(assignServicehData.get("Address"))
  //       this.Service.push(assignServicehData.get("Service"));
  //       this.SlotTime.push(assignServicehData.get("SlotTime"))
  //       this.Date.push(assignServicehData.get("Date"))
  //       this.Status.push(assignServicehData.get("Status"))

  //     }

  //     for (let i = 0; i < this.assignServiceId.length; i++) {


  //       this.assignServiceArr.push(
  //         {
  //           "ClientId": this.ClientId[i],
  //           // "BranchAddress": this.BranchAddress[i],
  //           "StaffId": this.StaffId[i],
  //           "Phone": this.Phone[i],
  //           "Address": this.Address[i],
  //           "SlotTime": this.SlotTime[i],
  //           "Date": this.Date[i],
  //           "Service": this.Service[i],
  //           "Status": this.Status[i]
  //         }
  //       )

  //     }
  //   }
  //   catch (error) {
  //     alert(`Failed to retrieve the object, with error code: ${error.message}`);
  //   }

  // }

  //-----------------------------------Back4App API INTEGRATION - End -------------------------------------------//

}
