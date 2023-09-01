import { Component, OnInit } from '@angular/core';
import { Subject, max } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignService } from 'src/app/services/assign.service';
import { NgxMaterialTimepickerComponent } from 'ngx-material-timepicker';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { RoleService } from 'src/app/services/role.service';
import { StaffService } from 'src/app/services/staff.service';
import { ClientService } from 'src/app/services/client.service';


@Component({
  selector: 'app-assign-service',
  templateUrl: './assign-service.component.html',
  styleUrls: ['./assign-service.component.scss']
})
export class AssignServiceComponent implements OnInit {
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public assignServiceList: any = [];
  public assignServiceData: any;
  public StaffId: any = [];
  public Phone: any = [];
  public Service: any = [];
  public Address: any = [];
  public SlotTime: any = [];
  public Date: any = [];
  public ClientIdArr: any = [];
  public assignServiceId: any = [];
  public assignServiceArr: any = [];
  public Status: any = [];
  public BranchId: any = [];
  public StaffName: any = [];
  public staffDataArr: any = [];
  public StaffNameArr: any = [];
  public ClientNameArr: any = [];
  public BranchName: any = [];
  public startTime: any = [];
  public endTime: any = [];
  public startTimeResults1: string;
  public endTimeResults1: any;
  public searchForm: any;
  public maxDate: any;
  public minDate: any;
  public slotName: any[];
  public staffList: any = [];
  public staffData: any;
  public clientArr: any = [];
  public StaffArr: any = [];
  public clientId: {
    enableCheckAll: boolean; singleSelection: boolean; idField: string; textField: string;
    allowSearchFilter: boolean;
  };
  public staffId: {
    enableCheckAll: boolean; singleSelection: boolean; idField: string; textField: string;
    allowSearchFilter: boolean;
  }
  public clientData: any;
  public clientList: any[];

  constructor(private router: Router, public StaffService: StaffService, public ClientService: ClientService, public AssignService: AssignService, private fb: FormBuilder, private RoleService: RoleService) { }

  ngOnInit(): void {
    this.initializesearchForm();
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false
    }
    this.getAllClient();
    this.getAllStaffs()
    // this.getAllStaffbase4App()
    //this.getAllAssignService();
    // this.getAllAssignInBase4App()
    this.getAllbyPast30Days();
    this.minDate = new Date()
    this.minDate.setDate(this.minDate.getDate() - 30);
    this.maxDate = new Date()
    this.maxDate.setDate(this.maxDate.getDate());
    this.searchForm.get('fromDate').patchValue(this.minDate = new Date(), this.minDate.setDate(this.minDate.getDate() - 30))
    this.searchForm.get('toDate').patchValue(this.maxDate);
   
  }

  //initialise the searchForm
  initializesearchForm() {
    this.searchForm = this.fb.group({
      clientId: [''],
      staffId: [''],
      fromDate: [''],
      toDate: [''],
    })
  }

  //for the date change event
  setStartDate(event: Date) {
    this.minDate = event;
    if (this.minDate > this.maxDate || this.minDate == undefined) {
      this.searchForm.get('toDate').patchValue();
    }
    else {
      this.searchForm.get('toDate').patchValue(this.maxDate);
    }
  }

  //for seting end date 
  setEndDate(event: Date) {
    this.maxDate = event;
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
            this.StaffArr = this.staffList
            //setting for ng-multiselect-dropdown
            this.staffId = {
              enableCheckAll: true,
              singleSelection: true,
              idField: '_id',
              textField: 'staffName',
              allowSearchFilter: true
            }
          }
        });
      }
    })
  }

  //getAll Function To Call all the assignServicedata
  getAllAssignService() {
    this.AssignService.getAllAssignService().subscribe(res => {
      if (res.status) {
        this.assignServiceData = res.data
        console.log(this.assignServiceData,'assignservice')
        this.assignServiceList = []
        this.assignServiceData.forEach(element => {
          var data = {
            _id: element._id,
            ClientName: element.clientName,
            Phone: element.phone,
            Address: element.address,
            staffName: element.staffName,
            startTime: element.startTime,
            endTime: element.endTime,
            Status: element.status,
            Date: this.formatDate(element.date),
            startDistance: element.startDistance,
            endDistance: element.endDistance,
            status: element.status,
            Service: element.serviceName
          }
          console.log(data)
          this.assignServiceList.push(data)
        });
        this.dtTrigger.next(null);
      }
      else {
        this.assignServiceList = []
      }
    })
  }

  //Get All BY date
  getAllbyPast30Days() {
    this.AssignService.getAllbyPast30Days().subscribe(res => {
      if (res.status) {
        this.assignServiceData = res.data
        console.log(this.assignServiceData,'assignservice')
        this.assignServiceList = []
        this.assignServiceData.forEach(element => {
          var data = {
            _id: element._id,
            ClientName: element.clientName,
            Phone: element.phone,
            Address: element.address,
            staffName: element.staffName,
            startTime: element.startTime,
            endTime: element.endTime,
            Status: element.status,
            Date: this.formatDate(element.date),
            startDistance: element.startDistance,
            endDistance: element.endDistance,
            status: element.status,
            Service: element.serviceName
          }
          this.assignServiceList.push(data)
        });
        this.dtTrigger.next(null);
      }
      else {
        this.assignServiceList = []
      }
    })
  }

  //Get All by Name and Date
  getAllByFilterSearch() {
    var data1 = this.searchForm.value
    data1.fromDate = this.formattedDate(data1.fromDate)
    data1.toDate = this.formattedDate(data1.toDate)
    var data2 = {
      "clientId": (data1.clientId != '') ? data1.clientId[0]._id : '',
      "staffId": (data1.staffId != '') ? data1.staffId[0]._id : '',
      "fromDate": (data1.fromDate != 'NaN-NaN-NaN') ? data1.fromDate : '',
      "todate": (data1.toDate != 'NaN-NaN-NaN') ? data1.toDate : ''
    }

    this.AssignService.getAllByFilterSearch(data2).subscribe(res => {
      if (res.status) {
        this.assignServiceData = res.data
        this.assignServiceList = []
        console.log(this.assignServiceData,'assignservice')
        this.assignServiceData.forEach(element => {
          var data = {
            _id: element._id,
            ClientName: element.clientName,
            Phone: element.phone,
            Address: element.address,
            staffName: element.staffName,
            startTime: element.startTime,
            endTime: element.endTime,
            Status: element.status,
            Date: this.formatDate(element.date),
            startDistance: element.startDistance,
            endDistance: element.endDistance,
            status: element.status,
            Service: element.serviceName
          }
          console.log
          this.assignServiceList.push(data)
        });
        this.dtTrigger.next(null);
      }
      else {
        this.assignServiceList = [];
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

  //add AssignService 
  addAssignService() {
    this.router.navigateByUrl('admin/assignService/addEditAssignService')
  }

  //Routing while click the edit Icon
  edit(id, show) {
    this.router.navigateByUrl('admin/assignService/' + id + '/addEditAssignService/' + show);
  }

  //To get the time
  getTime(date) {
    var d = new Date(date);
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000 * +5.5));
    var ist = nd.toLocaleString();
    var ist1 = ist.split(", ")[1];
    var startTime = ist1;
    return (startTime)
  }

}
