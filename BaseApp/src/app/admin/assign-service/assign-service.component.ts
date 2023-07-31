import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignService } from 'src/app/services/assign.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';

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
  public staffId: any = [];
  public StaffNameArr: any = [];
  public ClientNameArr: any = [];
  public BranchName: any = [];
  public startTime: any = [];
  public endTime: any = [];
  startTimeResults1: string;
  endTimeResults1: any;

  constructor(private router: Router, public AssignService: AssignService) {
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false

    }
   // this.getAllStaffbase4App()
     this.getAllAssignService();
   // this.getAllAssignInBase4App()

  }


  getAllAssignService() {
    this.AssignService.getAllAssignService().subscribe(res => {
      if (res.status) {
        this.assignServiceData = res.data
        this.assignServiceList = []
        console.log(" this.assignServiceData", this.assignServiceData)
        this.assignServiceData.forEach(element => {
            var data = {
              _id:element._id,
              ClientName: element.clientName,
              Phone: element.phone,
              Address: element.address,
              staffName: element.staffName,
              startTime: element.startTime,
              endTime:element.endTime,
              Status:element.status,
            Date: this.formatDate(element.date),
              status: element.status,
              Service: element.serviceName
            }
            this.assignServiceList.push(data)
        });
        this.dtTrigger.next(null);
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

  //add AssignService 
  addAssignService() {
    this.router.navigateByUrl('admin/assignService/addEditAssignService')
  }
  //Get All Branch In Base4App
  async getAllAssignInBase4App() {
    const assignService = Parse.Object.extend('AssignService');
    const query = new Parse.Query(assignService);
    try {
      const assignService = await query.find()
      assignService.forEach(element => {
        this.assignServiceId.push(element.id);
      });
      for (const assignServicehData of assignService) {
        const client = Parse.Object.extend('Client');
        const query1 = new Parse.Query(client);
        query.equalTo('objectId', assignServicehData.get("ClientId"));
        const clientData = await query1.find();
     

        const staff = Parse.Object.extend('Staff');
        const query2 = new Parse.Query(staff);
        query.equalTo('objectId', assignServicehData.get("StaffId"));
        const staffData = await query2.find();
    

        const branch = Parse.Object.extend('Branch');
        const query3 = new Parse.Query(branch);
        query.equalTo('objectId', assignServicehData.get("BranchId"));
        const branchData = await query3.find();
      
        this.assignServiceArr.push(
                    {
                      "id": assignServicehData.id,
                      "ClientName":clientData[0].get("ClientName"),
                      "staffName":staffData[0].get("StaffName"),
                      "Phone": assignServicehData.get("Phone"),
                      "Address":assignServicehData.get("Address"),
                      "SlotTime":assignServicehData.get("SlotTime"),
                      "Date":this.formatDate(assignServicehData.get("Date"),),
                      "Service":assignServicehData.get("Sercie"),
                      "Status":assignServicehData.get("Status"),
                      "Branch":branchData[0].id,
                      "BranchName":branchData[0].get("BranchName"),
                      "StartTime": this.getTime(assignServicehData.get("StartTime")),
                      "endTime": this.getTime(assignServicehData.get("EndTime"))
                    }
                  )
      }
    }
    catch (error) {
      alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }

  }

  edit(id) {
console.log(id)
    this.router.navigateByUrl('admin/assignService/'+id+'/addEditAssignService')
  }

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