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

@Component({
  selector: 'app-add-edit-client',
  templateUrl: './add-edit-client.component.html',
  styleUrls: ['./add-edit-client.component.scss']
})

export class AddEditClientComponent implements OnInit {
  // @ViewChild("placesRef") placesRef: GooglePlaceDirective;
  // @ViewChild("startpicker")
  // @ViewChild("endpicker")

  public datePickerConfig: Partial<BsDatepickerConfig>;
  public clientForm: any;
  public isclientFormSubmitted: boolean = false;
  public formattedAddress: any;
  public clientId: any;
  public showAddEdit: boolean = false;
  public destroy$ = new Subject();
  public showError: boolean;
  public branchData: any;
  public branchList: any = [];
  public BranchDatavalue: any;
  public ngxMaterialStartTimepicker!: NgxMaterialTimepickerComponent;
  public ngxMaterialEndTimepicker!: NgxMaterialTimepickerComponent;
  public startpickerOpened: boolean = false;
  public endpickerOpened: boolean = false;
  public endMinTime: string = "";
  public branchId: any = [];
  public BranchAddress: any = [];
  public BranchName: any = [];
  public BranchStatus: any = [];
  public BranchDataArr: any = [];
  public BranchNameArr: any = [];
  public serviceid: any = [];
  public ServiceName: any = [];
  public Duration: any = [];
  public ServiceStaus: any = [];
  public serviceDataArr: any = [];
  public serviceNameArr: any = [];
  public seviceArr: any = [];
  public staffId: any = [];
  public StaffName: any = [];
  public staffDataArr: any = [];
  public staffStatus: any = [];
  public staffNameArr: any = [];
  public sessionArr: FormArray<any>;
  public minDate = new Date();
  public ageOfUser: any;
  public staffRole: any;
  public addRole: any = [];
  public type=[];
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
  public slotDate: any = [];
  public slot: any;
  public startTimeAndendTimearr: any = []
  public startTimeAndendTime: any = [];
  public difference: number;
  public timeInterval: any = []
  public time: any[];
  public slotTiming: any;
  public startTime: any;
  public endTime: any;
  public times: any = []
  public slotTime: any;
  public getSlotTime: any;
  public staff: any;
  public getStaffRole: any;
  public addSession: any;
  public slotsession: any;
  public query3: any;
  // public isOpenSlot: boolean = false;
  public SlotDate: any = [];
  public visible: boolean = false
  public timeIntervalSlot: any = [];
  public slotTimearr: any = [];
  public slotArr: any = [];
  public slotIndexForI: any;
  public slotIndexForJ: any;
  public isBooked: any = [];
  public slotDataArray: any = [];
  public noOfSession: any;
  public isDisabled: boolean = true;
  public slotTimeArray: any = [];
  public addressLatitude: any;
  public addressLongitude: any;
  public homeBranchLatitude: any;
  public homeBranchLongitude: any;
  public SLOT: Date[];
  public startTimeToString: any;
  public endTimetoString: any;
  public weekdayMap = [
    RRule.MO,
    RRule.TU,
    RRule.WE,
    RRule.TH,
    RRule.FR,
    RRule.SA,
    RRule.SU
  ];
  public weekDaysArr: any = [];
  public tt: any;
  public startDateData: any = [];
  public endDateData: any = [];
  public dd: any;
  public dateSlot: any = [];
  public startTimesSlot: any;
  public endTimesSlot: any;
  public slotarray: any = [];
  public staffName: any;
  public BranchNameData: any;
  public slotEndTimeData: any;
  public duration: any;
  public clientResult: any;
  public saveClientDetails: any;
  public branchAddressLatitude: any;
  public branchAddressLongitude: any;
  public staffIdData1: any;
  public assignserviceData: any = [];
  public startgetDate: any;
  public startTimeData: Date;
  public endTimeData: Date;
  public getDataFromSlot: any;
  public slotAvail: boolean;
  public slotStartTime: any;
  public slotEndTime: any;
  public sdateArr: any = [];
  public isbooking: Boolean = false
  public slotBlocked: boolean = true;
  public duplicateIndex: any = [];
  public duplicateSlot: any = [];
  public newDuplicateSlot: any = [];
  public newDuplicateIndex: any = [];
  public newList: any = [];
  public startTimeData1: any;
  public endTimeData1: any;
  public Data = [];
  public packageId: any;
  public weekArr: IDropdownSettings;
  public assignServiceData1: any = [];
  public allStartAndEndTime: any = [];
  public splitedTimeInterval: any = [];
  public times_ara: any = [];
  public showAddSession: boolean = false;
  public dateForSlot: any = [];
  public packageIdFromParam: any;
  constructor(private fb: FormBuilder, private router: Router, public BranchService: BranchService,
    private flashMessageService: FlashMessageService, private route: ActivatedRoute) {
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
    this.datePickerConfig = Object.assign({}, { containerClass: 'theme-dark-blue' })
    this.route.params.subscribe((param) => {
      this.clientId = param['clientId'];
      this.packageIdFromParam = param['packageId'];
    })
    this.minDate.setDate(this.minDate.getDate());
  }

  ngOnInit(): void {
    const onWeekDay = new FormControl();
    if (this.clientId != undefined) {
      this.getClientByIdBase4App(this.clientId)
      this.showAddEdit = true;
    }
    else {
      this.showAddEdit = false;
    }
    this.initializeClientForm();
    this.getAllBranchInBase4App()
    this.getAllServicesInBase4App()
    this.getAllStaffbase4App()
    this.RRule();
    this.type=["1","3","4"];
  this.Data = [
      { name: 'Mon', value: 'RRule.MO' },
      { name: 'Tue', value: 'RRule.TU' },
      { name: 'Wed', value: 'RRule.WE' },
      { name: 'Thu', value: 'RRule.TH' },
      { name: 'Fri', value: 'RRule.FR' },
      { name: 'Sat', value: 'RRule.SA' },
      { name: 'Sun', value: 'RRule.SU' }
    ];
    this.weekArr = {
      enableCheckAll: true,
      singleSelection: false,
      idField: 'value',
      textField: 'name',
      allowSearchFilter: true
    };
  }

  // Initialize ClientForm
  initializeClientForm() {
    this.clientForm = this.fb.group({
      clientName: ['', Validators.required],
      PhoneNumber: ['', Validators.required],
      uhid: ['', Validators.required],
      email: ['', Validators.required],
      address: ['', Validators.required],
      homeBranch: ['', Validators.required],
      homeBranchaddress: ['', Validators.required],
      noOfSession: ['', Validators.required],
      weeklySession: ['', Validators.required],
      amount: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      service: ['', Validators.required],
      staff: ['', Validators.required],
      addSession: this.fb.array([]),
      slot: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      slotTime: [[],],
      startTime: [],
      endTime: [],
      typeofTreatment: [],
      emergencyNumber: [],
      onWeekDay: ['']

    })
   

    this.sessionArr = this.clientForm.get('addSession') as FormArray
  }

  initializeAddSessionForm() {
    return this.fb.group({
      date: ['', [Validators.required]],
      slot: ['',],
      duration: ['',],
      slotTime: ['',],
      slotStartTime: [],
      slotEndTime: []
    });
  }

  onCheckboxChange(e: any) {
    const onWeekDay: FormArray = this.clientForm.get('onWeekDay') as FormArray;
    if (e.target.checked) { onWeekDay.push(new FormControl(e.target.value)); } else {
      let i: number = 0;
      onWeekDay.controls.forEach((item: any) => {
        if (item.value == e.target.value) {
          onWeekDay.removeAt(i);
          return;
        }
        i++;
      });
    }
   
  }
  
  ngOnDestroy() {
    if (this.startpickerOpened && this.ngxMaterialStartTimepicker)
      this.ngxMaterialStartTimepicker.close();
    if (this.endpickerOpened && this.ngxMaterialEndTimepicker)
      this.ngxMaterialEndTimepicker.close();
  }
  //Ngx-google Autocomplete --NPM
  options: any = {
    componentRestrictions: { country: ['IND'] }
  }

  handleAddressChange(address: any) {
    this.formattedAddress = address.address_components
    this.clientForm.controls['address'].setValue(address.formatted_address)
    this.addressLatitude = address.geometry.location.lat()
    this.addressLongitude = address.geometry.location.lng()
  }

  handleAddressChange1(address: any) {
    this.formattedAddress = address.address_components
    this.clientForm.controls['homeBranchaddress'].setValue(address.formatted_address)
    this.branchAddressLatitude = address.geometry.location.lat()
    this.branchAddressLongitude = address.geometry.location.lng()
  }

  //getAll Branch 
  getAllBranch() {
    this.BranchService.getAllBranches().subscribe(res => {
      if (res.status) {
        this.branchData = res.data;
        this.branchData.forEach(branchValue => {
          if (branchValue.status == 0) {
            this.branchList.push(branchValue);
          }
        });
      }
    })
  }

  //getBranchbyId to patch branchaddress while selecting Branch
  async getBranchbyId() {
    var id = this.clientForm.value.homeBranch
    const branch = Parse.Object.extend('Branch');
    const query = new Parse.Query(branch);
    query.equalTo('objectId', id);
    try {
      const results = await query.find();
      for (const branch of results) {
        // Access the Parse Object attributes using the .GET method
        const BranchName = branch.get('BranchName')
        const BranchAddress = branch.get('BranchAddress')
        this.homeBranchLatitude = branch.get('Latitude')
        this.homeBranchLongitude = branch.get('Longitude')
        this.BranchNameData = branch.get('BranchName')
        this.clientForm.get('homeBranchaddress').patchValue(BranchAddress)
      }
    } catch (error) {
    
    }
  }

  //back -Route
  addeditClientForm() {
    this.router.navigateByUrl('admin/client')
  }

  addSessionBasedOnSessionCount(eve) {
    this.sessionArr.clear()
    this.noOfSession = eve.target.value
    var noOfSession = eve.target.value;
    for (let i = 1; i <= noOfSession; i++) {
      this.sessionArr.push(this.initializeAddSessionForm());
    }
  }

  async dividBySlotTime(e) {
    var value
    if (e.target == undefined) {
      value = e
    }
    else {
      value = e.target.value
    }
    this.staffIdData1 = value
    const staffs1 = Parse.Object.extend('Staff');
    const query = new Parse.Query(staffs1);
    query.equalTo('objectId', value);
    try {
      const staff = await query.get(value)
      const staffName = staff.get("StaffName",)
      this.staffName = staffName
    }
    catch (error) {
    
    }
    const staffs = Parse.Object.extend('Staff');
    this.query3 = new Parse.Query(staffs);
    this.query3.equalTo('objectId', value);
    try {
      const staff = await this.query3.get(value)
      this.staffRole = staff.get("StaffRole")
    }
    catch (error) {
      
    }
    const role = Parse.Object.extend('RolePosition');
    const query1 = new Parse.Query(role);
    query1.equalTo('objectId', this.staffRole);
    try {
      const role = await query1.get(this.staffRole)
      const Role = role.get('Role')
      this.addRole = role.get('AddRole')
      const endTime = role.get('EndTime')
    }
    catch (error) {
      
    }
  }

  weekly(event) {
   
    this.weekDaysArr=[];
    for(var val of event)
    {
      this.weekDaysArr.push(val.value)
    }
    this.dateSlot = []
   
  }

  // convertHours(mins) {
  //   var hour = Math.floor(mins / 60);
  //   var mins: any = mins % 60;
  //   var converted = this.pad(hour, 2) + ':' + this.pad(mins, 2);
  //   return converted;
  // }

  calculate_time_slot(start_time, end_time, interval) {
    var time_slots = new Array();
    for (let i = start_time; i <= end_time; i = i + interval) {
      // formatted_time = this.convertHours(i);
      var hour = Math.floor(i / 60);
      var mins = i % 60;
      var converted = this.pad(hour, 2) + ':' + this.pad(mins, 2);
      time_slots.push(converted);
    }
    return time_slots;
  }

  pad(str, max) {
    str = str.toString();
    return str.length < max ? this.pad("0" + str, max) : str;
  }

  // Format Date in 'DD-MM-YYYY Format'
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

  async addClient() {
    this.dateForSlot=[];
   
    var startSlotTime = this.clientForm.value.startTime;
    var endSlotTime = this.clientForm.value.endTime;
    function parseTime(s) {
      var c = s.split(':');
      return parseInt(c[0]) * 60 + parseInt(c[1]);
    }
    this.dateSlot = [];

    var startDate = new Date(`${this.startTimeToString}T${this.clientForm.value.startTime}`);
    var endDate = new Date(`${this.endTimetoString}T${this.clientForm.value.startTime}`);
console.log("start",startDate);
    // Create a rule:
    let recurringRule = {
      freq: RRule.WEEKLY,
      dtstart: new Date(startDate),
      until: new Date(endDate),
      count: 30,
      interval: 1
    }
 
    var singleArray = []
    this.weekDaysArr.forEach(element => {
      if (element == "RRule.MO") {
        singleArray.push(0)
      }
      if (element == "RRule.TU") {
        singleArray.push(1)
      }
      if (element == "RRule.WE") {
        singleArray.push(2)
      }
      if (element == "RRule.TH") {
        singleArray.push(3)
      }
      if (element == "RRule.FR") {
        singleArray.push(4)
      }
      if (element == "RRule.SA") {
        singleArray.push(5)
      }
      if (element == "RRule.SU") {
        singleArray.push(6)
      }
    })
  
    recurringRule['byweekday'] = singleArray
  console.log(singleArray,"recurringRule",recurringRule['byweekday'])
    // Create a rule:
    const rule = new RRule(recurringRule);
    
    this.SLOT = rule.all()
  console.log(this.noOfSession,"this.slot",this.SLOT)
  console.log("type",this.clientForm.value.typeofTreatment)
  if(this.SLOT.length<this.noOfSession)
  {
    alert(`With in the Selected Days the no of slots not matched the no of session.Please change the End Date`);
  }
else{
  this.showAddSession = true;
  console.log("eeeee",(this.type).includes(this.clientForm.value.typeofTreatment))
  if((this.type).includes(this.clientForm.value.typeofTreatment))
  {
    console.log("inside of type")
  }
    for (let i = 0; i < this.SLOT.length; i++) {
      var mydate = this.SLOT[i].toLocaleString("en-ca").slice(0, 10)
      console.log("mydate",mydate)
      const newDate = new Date(mydate);
      console.log("new Date",newDate)
      const result = new Date(newDate.setDate(newDate.getDate() + 1));
      console.log("result",result)
      this.dateSlot.push(result);
    }
  console.log(" this.dateSlot", this.dateSlot)
    var tt = this.startTimesSlot
    var tttt = new Date(this.tt + " " + tt)
    this.slotEndTimeData = tttt.setTime(tttt.getTime() + this.duration * 60 * 1000);
    let result = tttt.toString().slice(0, 21);
    let result1 = result.slice(16);
    this.endTime = result.slice(16)
    var assignserviceData;
    this.dateSlot.forEach(async element => {
      this.getDataFromSlot = element
      let parseQuery = new Parse.Query('AssignService');
      this.dateForSlot.push(this.formatDate(element))
     
      var startTimeData = new Date(element.getFullYear(), element.getMonth(), element.getDate(), 5, 30)
      parseQuery.contains('StaffId', this.staffIdData1);
      parseQuery.equalTo('Date', startTimeData);
      var queryResults = await parseQuery.find();
      console.log("queryResults",queryResults)
  //     for (let i = 0; i < queryResults.length; i++) {
  //       assignserviceData = {
  //         StartTime: queryResults[i].get("StartTime"),
  //         EndTime: queryResults[i].get("EndTime"),
  //         Date: queryResults[i].get("Date"),
  //         type:queryResults[i].get("PatientType")
  //       }
  //       this.assignserviceData.push(assignserviceData)
  //     }
  //  //   console.log("this.assignserviceData",this.assignserviceData)
    })
    this.startTimeAndendTime.forEach(element => {
      var start_time = parseTime(element.startTime)
      var end_time = parseTime(element.endTime)
      var interval = parseInt(this.duration);
      var times_ara = this.calculate_time_slot(start_time, end_time, interval);
      this.timeInterval = [];
      for (let i = 0; i < times_ara.length; i++) {
        if (i != times_ara.length - 1) {
          this.timeInterval.push(times_ara[i] + "-" + times_ara[i + 1]);
        }
      }
    });
   
    for (let i = 0; i < this.sessionArr.value.length; i++) {
      let parseQuery = new Parse.Query('AssignService');
      var startTimeData = new Date(this.dateSlot[i].getFullYear(), this.dateSlot[i].getMonth(), this.dateSlot[i].getDate(), 5, 30)

      parseQuery.contains('StaffId', this.staffIdData1);
      parseQuery.equalTo('Date', startTimeData);
      var queryResults = await parseQuery.find();
 
      this.slotAvail = true;
      this.duplicateSlot = [];
      for (let k = 0; k < queryResults.length; k++) {
        var assignServiceStartTimeHour = queryResults[k].get("StartTime").toString().slice(16, 18);
        var assignServiceStartTimeMinute = queryResults[k].get("StartTime").toString().slice(19, 21);
        var assignServiceEndTimeHour = queryResults[k].get("EndTime").toString().slice(16, 18);
        var assignServiceEndTimeMinute = queryResults[k].get("EndTime").toString().slice(19, 21);
        var assignServiceType=queryResults[k].get("PatientType")
        console.log("assignServiceType",assignServiceType)
        for (let m = 0; m < this.timeInterval.length; m++) {
          var timeIntervalStartHour = this.timeInterval[m].split('-')[0].split(':')[0];
          var timeIntervalEndHour = this.timeInterval[m].split('-')[1].split(':')[0];
          var timeIntervalStartMinute = this.timeInterval[m].split('-')[0].split(':')[1];
          if ((timeIntervalStartHour >= parseInt(assignServiceStartTimeHour)) && (timeIntervalStartHour <= parseInt(assignServiceEndTimeHour))) {
            if (timeIntervalStartHour == timeIntervalEndHour) {
              if ((timeIntervalStartMinute >= parseInt(assignServiceStartTimeMinute)) && (timeIntervalStartMinute <= parseInt(assignServiceEndTimeMinute))) {
                this.duplicateSlot.push(m);
              }
            }
            else {
              if (timeIntervalStartMinute < parseInt(assignServiceEndTimeMinute)) {
                this.duplicateSlot.push(m);
              }
            }
          }
        }

        if (this.packageIdFromParam == undefined) {
          if (this.isBookingWithinTimeRange(startSlotTime, endSlotTime, queryResults[k].get("StartTime").toString().slice(16, 21), queryResults[k].get("EndTime").toString().slice(16, 21))) {
            this.slotAvail = false;
          }
        }
        else {
          if (queryResults[k].get("PackageId") != this.packageIdFromParam) {
        
            if (this.isBookingWithinTimeRange(startSlotTime, endSlotTime, queryResults[k].get("StartTime").toString().slice(16, 21), queryResults[k].get("EndTime").toString().slice(16, 21))) {
              this.slotAvail = false;
            }
          }
          else {
            this.slotAvail = true;
          }
        }
      }
      console.log("this.duplicateSlot",this.duplicateSlot)
      this.duplicateIndex.push(this.duplicateSlot);
      if (this.slotAvail == true) {
        this.sessionArr.at(i).get('date').patchValue(this.dateSlot[i])
        this.sessionArr.at(i).get('slotStartTime').patchValue(startSlotTime)
        this.sessionArr.at(i).get('slotEndTime').patchValue(endSlotTime)
        this.sessionArr.at(i).get('slot').patchValue(this.clientForm.value.slot)
      }
      else {
        this.sessionArr.at(i).get('date').patchValue(this.dateSlot[i])
        this.sessionArr.at(i).get('slotStartTime').patchValue("")
        this.sessionArr.at(i).get('slotEndTime').patchValue("")
        this.sessionArr.at(i).get('slot').patchValue(this.clientForm.value.slot)
      }
      var j = 0;
      var val = 0;
      this.newList = []
      while (j < this.duplicateIndex[i].length) {
        if (this.duplicateIndex[i][j] == val) {
          this.newList.push(this.duplicateIndex[i][j]);
          j++;
          val = val + 1;
        } else {
          val = val + 1;
          this.newList.push("N");
        }
        console.log("this.duplicateIndex[i][j]",this.duplicateIndex[i][j])
      }
      console.log("this.newList",this.newList)
      this.newDuplicateIndex.push(this.newList);
      console.log("this.newDuplicateIndex",this.newDuplicateIndex)
    }
  }
  }

  isBookingWithinTimeRange = (a, b, c, d) => {
    
    const getMinutes = s => {
      const p = s.split(':').map(Number);
      return p[0] * 60 + p[1];
    };
    return getMinutes(b) > getMinutes(c) && getMinutes(d) > getMinutes(a);
  };

  public inputdobValidator(event: any) {
    const pattern = /^\-[0-9]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^\-0-9]/g, "");
    }
  }

  onDateChangeStart(value) {
    this.startgetDate = value
    this.tt = value.toLocaleDateString("en-US")
    this.startTimeToString = value.toLocaleDateString("en-CA")
    this.startDateData = this.tt.split("/");
    this.dateSlot = []
  }

  onDateChangeEnd(value) {
    this.dateSlot = []
    this.endTimetoString = value.toLocaleDateString("en-CA")
    this.dd = value.toLocaleDateString("en-US")
    this.endTimetoString = value.toLocaleDateString("en-CA")
    this.endDateData = this.dd.split("/");
  }

  AddSession() {
    this.sessionArr.push(this.initializeAddSessionForm());
  }

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
        this.BranchDataArr.push(
          {
            "BranchName": this.BranchName[i],
            "Branchstatus": this.BranchStatus[i],
            "BranchId": this.branchId[i]
          }
        )
      }
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

  //Get All Service In Base4App
  async getAllServicesInBase4App() {
    const service = Parse.Object.extend('Service');
    const query = new Parse.Query(service);
    try {
      const serviceName = await query.find()
      serviceName.forEach(element => {
        this.serviceid.push(element.id);
      });
      for (const serviceData of serviceName) {
        this.ServiceName.push(serviceData.get("ServiceName"));
        this.Duration.push(serviceData.get("Duration"));
        this.ServiceStaus.push(serviceData.get("Status"))
      }
      for (let i = 0; i < this.serviceid.length; i++) {
        this.serviceDataArr.push(
          {
            "serviceName": this.ServiceName[i],
            "Duration": this.Duration[i],
            "objectId": this.serviceid[i],
            "status": this.ServiceStaus[i]
          }
        )
      }
      for (let i = 0; i < this.serviceid.length; i++) {
        if (this.ServiceStaus[i] == 0)
          this.seviceArr.push({
            "serviceName": this.ServiceName[i],
          })
      }
    }
    catch (error) {
      alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }
  }

  //getAllStaff Base4App
  async getAllStaffbase4App() {
    const staff = Parse.Object.extend('Staff');
    const query = new Parse.Query(staff);
    try {
      const StaffData = await query.find()
      StaffData.forEach(element => {
        this.staffId.push(element.id);
      });
      for (const staffs of StaffData) {
        this.StaffName.push(staffs.get("StaffName"))
        this.staffStatus.push(staffs.get("Status"))
      }
      for (let i = 0; i < this.staffId.length; i++) {
        this.staffDataArr.push(
          {
            "_id": this.staffId[i],
            "StaffName": this.StaffName[i],
            "status": this.staffStatus[i]
          }
        )
      }
      for (let i = 0; i < this.staffId.length; i++) {
        if (this.staffStatus[i] == 0)
          this.staffNameArr.push({
            "staffid": this.staffId[i],
            "staffName": this.StaffName[i],
          })
      }
    }
    catch (error) {
      alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }
  }

  Slot(e) {
    // this.isOpenSlot = true;
    this.slot = e.target.value
    this.addRole.forEach(element => {
     
      this.allStartAndEndTime.push({
        startTime: element.startTime,
        endTime: element.endTime,
        slotTime: element.startTime + '-' + element.endTime
      })
      if (element.slotName == this.slot) {
       
        this.startTimeData1 = element.startTime.toString()
     
        this.endTimeData1 = element.endTime.toString()
        this.startTimeAndendTime.push({ startTime: element.startTime, endTime: element.endTime })
      }
    });
  }

  sessionSlot(e, index) {
    // this.isOpenSlot = true;
    this.slot = e.target.value
    this.addRole.forEach(element => {
      if (element.slotName == this.slot) {
        this.startTimeAndendTime.splice(index, 1, { "startTime": element.startTime, "endTime": element.endTime });
        this.startTimeAndendTimearr.push(this.startTimeAndendTime, index)
      }
    });
  }

  dividingSlot(e) {
    this.duration = e.target.value
  }

  async slotSelection(data, i, j) {
    this.slotTime = data
    var timesplit = this.slotTime.split("-");
    this.slotStartTime = timesplit[0];
    this.slotEndTime = timesplit[1];
    this.sessionArr.at(i).get('slotStartTime').patchValue(this.slotStartTime)
    this.sessionArr.at(i).get('slotEndTime').patchValue(this.slotEndTime)
    this.slotTimearr.push(this.slotTime)
    this.slotTimeArray.splice(i, 1, this.slotTimearr);
    for (let k = 0; k <= this.sessionArr.value.length; k++) {
      for (let l = 0; l <= this.timeInterval[i].length; l++) {
        if (i == k) {
          if (j == l) {
            this.sessionArr.at(k).get('slotTime').patchValue(this.slotTime)
          }
        }
      }
    }
    for (let i = 0; i < this.sessionArr.length; i++) {
      let parseQuery = new Parse.Query('AssignService');
      var startTimeData = new Date(this.dateSlot[i].getFullYear(), this.dateSlot[i].getMonth(), this.dateSlot[i].getDate(), 5, 30)
      parseQuery.contains('StaffId', this.staffIdData1);
      parseQuery.equalTo('Date', startTimeData);
      var queryResults = await parseQuery.find();
      for (let k = 0; k < queryResults.length; k++) {
        if (this.isBookingWithinTimeRange(this.slotStartTime, this.slotEndTime, queryResults[k].get("StartTime").toString().slice(16, 21), queryResults[k].get("EndTime").toString().slice(16, 21))) {
          this.isbooking = true
        } else {
          this.isbooking = false
        }
      }
    }
    if (this.slotTime) {
      this.slotIndexForI = i;
      this.slotIndexForJ = j;
      this.isBooked.splice(i, 1, "Booked")
    }
  }

  startTimeonChangeHour(e) {
    this.startTimesSlot = e
    var tt = this.startTimesSlot
    var tttt = new Date(this.tt + " " + tt)
    this.slotEndTimeData = tttt.setTime(tttt.getTime() + this.duration * 60 * 1000);
    let result = tttt.toString().slice(0, 21);
    let result1 = result.slice(16);
    this.endTime = result.slice(16)
    this.clientForm.get('endTime').patchValue(result1)
  }

  endTimeonChangeHour(e) {
    this.endTimesSlot = e
  }

  async saveClient() {
    this.slotTimearr.push(this.slotTime)
    var addSession = this.clientForm.value.addSession
    addSession.forEach(element => {
      var date = element.date.toLocaleDateString('en-CA')
      var startTime = element.slotTime.slice(0, 5)
      var date11 = date + " " + element.slotStartTime
      var date12 = date + " " + this.endTime
      var dd = new Date(date11)
      var dd1 = new Date(date12)
      this.slotarray.push(
        {
          date: element.date,
          slot: element.slot,
          duration: element.duration,
          slotStartTime: dd,
          slotEndTime: dd1
        }
      )
    });
  console.log("this.clientForm.value.startDate",this.clientForm.value.startDate)
    this.packageId = Math.floor((Math.random() * 100000000000) + 1);
   
    const client = new Parse.Object("Client");
    client.set("ClientName", this.clientForm.value.clientName)
    client.set("PhoneNumber", this.clientForm.value.PhoneNumber);
    client.set("ClientStatus", 0);
    client.set("Email", this.clientForm.value.email)
    client.set("uhid", this.clientForm.value.uhid);
    client.set("Address", this.clientForm.value.address)
    client.set("HomeBranch", this.clientForm.value.homeBranch);
    client.set("HomeBranchaddress", this.clientForm.value.homeBranchaddress)
    client.set("NoOfSession", this.clientForm.value.noOfSession);
    client.set("Amount", this.clientForm.value.amount);
    client.set("StartDate", this.clientForm.value.startDate)
    client.set("EndDate", this.clientForm.value.endDate);
    client.set("Service", this.clientForm.value.service)
    client.set("staff", this.clientForm.value.staff);
    client.set("ClientHomeBranchLongitude", this.homeBranchLongitude);
    client.set("ClientHomeBranchLatitude", this.homeBranchLatitude);
    client.set("ClientAddressLongitude", this.addressLongitude);
    client.set("ClientAddressLatitude", this.addressLatitude);
    client.set("AddSession", this.slotarray);
    client.set("startTime", this.clientForm.value.startTime);
    client.set("endTime", this.clientForm.value.endTime)
    client.set("typeofTreatment", this.clientForm.value.typeofTreatment);
    client.set("emergencyNumber", this.clientForm.value.emergencyNumber);
    client.set("PackageId", (this.packageId).toString());
    client.set("slot", this.clientForm.value.slot);
    client.set("Duration", this.clientForm.value.duration)
    client.set("onWeekDay", this.clientForm.value.onWeekDay)
    try {
      this.clientResult = await client.save()
      this.flashMessageService.successMessage("Client Created Successfully", 2);
      this.saveAssignService();
      this.router.navigateByUrl('admin/client')
    } catch (error) {
      this.flashMessageService.errorMessage("Error while Creating client", 2);
    }
  }

  saveAssignService() {
    var t = this.clientForm.value.addSession
   
    this.slotarray.forEach(async element => {
      const assignService = new Parse.Object("AssignService");
      assignService.set("BranchName", this.BranchNameData)
      assignService.set("ClientName", this.clientForm.value.clientName)
      assignService.set("StaffName", this.staffName)
      assignService.set("StaffId", this.clientForm.value.staff)
      assignService.set("Date", element.date);
      assignService.set("AssignService", 0);
      assignService.set("Phone", this.clientForm.value.PhoneNumber);
      assignService.set("Address", this.clientForm.value.address);
      assignService.set("Service", this.clientForm.value.service)
      assignService.set("PatientType", this.clientForm.value.typeofTreatment)
      assignService.set("Duration", this.clientForm.value.duration)
      assignService.set("BranchId", this.clientForm.value.homeBranch);
      assignService.set("BranchAddress", this.clientForm.value.HomeBranchaddress);
      assignService.set("Rating", "");
      assignService.set("Feedback", "");
      assignService.set("Transport", "");
      assignService.set("TransportCharge", "");
      assignService.set("Latitude", this.addressLatitude);
      assignService.set("Longitude", this.addressLongitude);
      assignService.set("Status", "0");
      assignService.set("SLat", "")
      assignService.set("SLong", "");
      assignService.set("Reason", "");
      assignService.set("ELat", "");
      assignService.set("ELong", "");
      assignService.set("PaymentNumber", "");
      assignService.set("StartTime", element.slotStartTime);
      assignService.set("EndTime", element.slotEndTime);
      assignService.set("StartDate", this.clientForm.value.startDate)
      assignService.set("EndDate", this.clientForm.value.endDate);
      assignService.set("PackageId", (this.packageId).toString());
      assignService.set("ClientId", this.clientResult.id)
      assignService.set("Slot", this.clientForm.value.slot);
      try {
        let res = await assignService.save()
        this.router.navigateByUrl('admin/client')
      } catch (error) {
        this.flashMessageService.errorMessage("Error while Creating client", 2);
      }
    });
  }

  async editSlot(i) {
    this.visible = !this.visible
    this.addSession.forEach(async element => {
      this.SlotDate.splice(i, 1, element.date.toLocaleDateString('en-IN'))
    })
  }
  async getAssignServiceByPackageId(id) {
    this.assignServiceData1 = [];
    const assignService = Parse.Object.extend('AssignService');
    const query1 = new Parse.Query(assignService);
    query1.contains('PackageId', id);
    const assignServiceData = await query1.find();
    for (const assign of assignServiceData) {
      var data = {
        date: assign.get("Date"),
        startTime: assign.get("StartTime"),
        endTime: assign.get("EndTime")
      }
      this.assignServiceData1.push(data);

    }
   
    return this.assignServiceData1;
  }
  //Base4App  Role by Id
  async getClientByIdBase4App(id) {
    this.showAddSession = true;
    this.assignServiceData1 = [];
    const client = Parse.Object.extend('Client');
    const query = new Parse.Query(client);
   
    query.equalTo('objectId', id);
    try {
      const client = await query.get(id)
      const ClientName = client.get('ClientName')
      const PhoneNumber = client.get('PhoneNumber')
      const Email = client.get('Email')
      const uhid = client.get('uhid')
      const Address = client.get('Address')
      const HomeBranch = client.get('HomeBranch')
      const HomeBranchaddress = client.get('HomeBranchaddress')
      const NoOfSession = client.get('NoOfSession')
      const WeeklySession = client.get('WeeklySession')
      const Amount = client.get('Amount')
      const StartDate = client.get('StartDate')
      const staff = client.get('staff')
      const emergencyNumber = client.get('emergencyNumber')
      this.addSession = client.get('AddSession')
      const service = client.get('Service')
      const EndDate = client.get('EndDate')
      const startTime = client.get('startTime')
      const endTime = client.get('endTime')
      const duration = client.get('Duration')
      const typeofTreatment = client.get('typeofTreatment')
      const slot = client.get('slot')
      const onWeek = client.get('onWeekDay');
      const packageId = client.get('PackageId');
      this.assignServiceData1 = [];
      const assignService = Parse.Object.extend('AssignService');
      const query1 = new Parse.Query(assignService);
      query1.contains('PackageId', packageId);
      const assignServiceData = await query1.find();
      for (const assign of assignServiceData) {
        var data = {
          id: assign.id,
          date: assign.get("Date"),
          startTime: assign.get("StartTime"),
          endTime: assign.get("EndTime"),
          slot: assign.get("Slot")
        }
        this.assignServiceData1.push(data);
      }
     
      this.clientForm.get('clientName').patchValue(ClientName)
      this.clientForm.get('PhoneNumber').patchValue(PhoneNumber)
      this.clientForm.get('email').patchValue(Email)
      this.clientForm.get('uhid').patchValue(uhid)
      this.clientForm.get('address').patchValue(Address)
      this.clientForm.get('homeBranch').patchValue(HomeBranch)
      this.clientForm.get('homeBranchaddress').patchValue(HomeBranchaddress)
      this.clientForm.get('noOfSession').patchValue(NoOfSession)
      this.clientForm.get('weeklySession').patchValue(WeeklySession)
      this.clientForm.get('amount').patchValue(Amount)
      this.clientForm.get('startDate').patchValue(StartDate)
      this.clientForm.get('staff').patchValue(staff)
      this.clientForm.get('endDate').patchValue(EndDate)
      this.clientForm.get('service').patchValue(service)
      this.clientForm.get('emergencyNumber').patchValue(emergencyNumber)
      this.clientForm.get('startTime').patchValue(startTime)
      this.clientForm.get('endTime').patchValue(endTime)
      this.clientForm.get('duration').patchValue(duration)
      this.clientForm.get('slot').patchValue(slot)
      this.clientForm.get('typeofTreatment').patchValue(typeofTreatment)
      this.clientForm.get('addSession').patchValue(this.addSession)
      this.clientForm.get('onWeekDay').patchValue(onWeek)
      this.dividBySlotTime(staff)
      for (let i = 0; i < this.assignServiceData1.length; i++) {
        this.sessionArr.push(this.initializeAddSessionForm())
      }
      for (let j = 0; j < this.assignServiceData1.length; j++) {

        var session = this.clientForm.get('addSession') as FormArray;
        // session.at(j).patchValue(this.addSession[j])
        var slotEndTime = this.assignServiceData1[j].endTime;
        var slotStartTime = this.assignServiceData1[j].startTime;
        var slotDate = this.assignServiceData1[j].date;
        var slot1 = this.assignServiceData1[j].slot;
        let getEndTime = slotEndTime.toString().slice(16, 21);
        this.endTime = getEndTime;
        let getStartTime = slotStartTime.toString().slice(16, 21);
        session.at(j).get('slotEndTime').patchValue(getEndTime)
        session.at(j).get('slotStartTime').patchValue(getStartTime)
        session.at(j).get('date').patchValue(slotDate)
        session.at(j).get('slot').patchValue(slot1)
      }
    }
    catch (error) {
     
    }
  }

  async RRule() {
    var rule = new RRule({
      freq: RRule.WEEKLY,
      dtstart: new Date(Date.UTC(2023, 5, 11, 10, 26, 0)),
      until: new Date(Date.UTC(2023, 5, 30, 10, 27, 0)),
      count: 30,
      interval: 1,
      byweekday: [RRule.TU, RRule.TH]
    })
    this.SLOT = rule.all()
  }

  async updateClientInBase4App() {
    this.slotTimearr.push(this.slotTime)
    var addSession = this.clientForm.value.addSession
    addSession.forEach(element => {
      var date = element.date.toLocaleDateString('en-CA')
      var startTime = element.slotTime.slice(0, 5)
      var date11 = date + " " + startTime
      var date12 = date + " " + this.endTime
      var dd = new Date(date11)
      var dd1 = new Date(date12)
      this.slotarray.push(
        {
          date: element.date,
          slot: element.slot,
          duration: element.duration,
          slotStartTime: dd,
          slotEndTime: dd1
        }
      )
    })
    const client1 = Parse.Object.extend('Client');
    const query = new Parse.Query(client1);
   
    query.equalTo('objectId', this.clientId);
    const client2 = await query.get(this.clientId)
    const packageId = client2.get('PackageId')



    const client = new Parse.Object("Client");
    const assignService = Parse.Object.extend('AssignService');
    const query1 = new Parse.Query(assignService);
    query1.contains('PackageId', packageId);
    const assignServiceData = await query1.find();
    for (let assign of assignServiceData) {
      let user = await query1.get(assign.id);
      try {
        let response = await user.destroy();
      
      } catch (error) {
      
      }
    }

    client.set('objectId', this.clientId);
    client.set("ClientName", this.clientForm.value.clientName)
    client.set("PhoneNumber", this.clientForm.value.PhoneNumber);
    client.set("ClientStatus", 0);
    client.set("Email", this.clientForm.value.email)
    client.set("uhid", this.clientForm.value.uhid);
    client.set("Address", this.clientForm.value.address)
    client.set("HomeBranch", this.clientForm.value.homeBranch);
    client.set("HomeBranchaddress", this.clientForm.value.homeBranchaddress)
    client.set("NoOfSession", this.clientForm.value.noOfSession);
    client.set("WeeklySession", this.clientForm.value.weeklySession)
    client.set("Amount", this.clientForm.value.amount);
    client.set("StartDate", this.clientForm.value.startDate)
    client.set("EndDate", this.clientForm.value.endDate);
    client.set("Service", this.clientForm.value.service)
    client.set("staff", this.clientForm.value.staff);
    client.set("slotTime", this.slotTimearr)
    client.set("ClientHomeBranchLongitude", this.homeBranchLongitude);
    client.set("ClientHomeBranchLatitude", this.homeBranchLatitude);
    client.set("ClientAddressLongitude", this.addressLongitude);
    client.set("ClientAddressLatitude", this.addressLatitude);
    client.set("AddSession", this.slotarray);
    client.set("startTime", this.clientForm.value.startTime);
    client.set("endTime", this.clientForm.value.endTime)
    client.set("typeofTreatment", this.clientForm.value.typeofTreatment);
    client.set("emergencyNumber", this.clientForm.value.emergencyNumber);
    client.set("slot", this.clientForm.value.Slot);
    client.set("duration", this.clientForm.value.duration);
    try {
      this.clientResult = await client.save()
      this.flashMessageService.successMessage("client updated Successfully", 2);
      this.UpdateAssignService(packageId);
      this.router.navigateByUrl('admin/client')
    } catch (error) {
      this.flashMessageService.errorMessage("Error while update client", 2);
    }
  }

  UpdateAssignService(packageId) {
    var t = this.clientForm.value.addSession
    this.slotarray.forEach(async element => {
      const assignService = new Parse.Object("AssignService");
      assignService.set("BranchName", this.BranchNameData)
      assignService.set("ClientName", this.clientForm.value.clientName)
      assignService.set("StaffName", this.staffName)
      assignService.set("StaffId", this.clientForm.value.staff)
      assignService.set("Date", element.date);
      assignService.set("AssignService", 0);
      assignService.set("Phone", this.clientForm.value.PhoneNumber);
      assignService.set("Address", this.clientForm.value.address);
      assignService.set("Service", this.clientForm.value.service)
      assignService.set("PatientType", this.clientForm.value.typeofTreatment)
      assignService.set("Duration", this.clientForm.value.duration)
      assignService.set("BranchId", this.clientForm.value.homeBranch);
      assignService.set("BranchAddress", this.clientForm.value.HomeBranchaddress);
      assignService.set("Rating", "");
      assignService.set("Feedback", "");
      assignService.set("Transport", "");
      assignService.set("TransportCharge", "");
      assignService.set("Latitude", this.addressLatitude);
      assignService.set("Longitude", this.addressLongitude);
      assignService.set("Status", "0");
      assignService.set("SLat", "")
      assignService.set("SLong", "");
      assignService.set("Reason", "");
      assignService.set("ELat", "");
      assignService.set("ELong", "");
      assignService.set("PaymentNumber", "");
      assignService.set("StartTime", element.slotStartTime);
      assignService.set("EndTime", element.slotEndTime);
      assignService.set("StartDate", this.clientForm.value.startDate)
      assignService.set("EndDate", this.clientForm.value.endDate);
      assignService.set("PackageId", packageId);
      assignService.set("ClientId", this.clientResult.id)
      assignService.set("Slot", this.clientForm.value.slot);
      try {
        let res = await assignService.save()
        this.router.navigateByUrl('admin/client')
      } catch (error) {
        this.flashMessageService.errorMessage("Error while Creating client", 2);
      }
    });
  }
}