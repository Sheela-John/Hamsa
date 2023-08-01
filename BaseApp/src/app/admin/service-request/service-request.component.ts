import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { get } from 'jquery';
import { ServiceRequestService } from 'src/app/services/serviceRequest.service';

@Component({
  selector: 'app-service-request',
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.scss']
})

export class ServiceRequestComponent implements OnInit {
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();

  public serviceData:any=[];
  public clientData:any=[];
  public status: boolean =false;
  serviceId: any;
  serviceRequestList: any=[];
  constructor(private router: Router, public flashMessageService: FlashMessageService,public serviceRequestService:ServiceRequestService) { 
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }

  ngOnInit(): void {
    this.getAllServiceRequest();
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false
    }
    
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

    return [day, month, year].join('-');
  }
getAllServiceRequest()
{
  this.serviceRequestService.getAllServiceRequest().subscribe(res=>{
    if(res.status)
    {
      this.serviceRequestList=res.data
      for(var i=0;i<this.serviceRequestList.length;i++)
      {
        this.serviceRequestList[i].date=this.formatDate( this.serviceRequestList[i].date)
      }
    }
  })
}

async getServiceRequestFromBack4App()
{
  this.serviceData=[];
  console.log("inside")
  const service = Parse.Object.extend('RequestService');
  const query = new Parse.Query(service);
  const serviceData = await query.find()
 
  for(const service of serviceData)
  {
    console.log("serviceData",service.get("ServiceId"))  ; 
        const staff = Parse.Object.extend('Staff');
        const query1 = new Parse.Query(staff);
        query1.equalTo('objectId',service.get("StaffId"));
        const staffData = await query1.find()


        const client = Parse.Object.extend('Client');
        const query2 = new Parse.Query(client);
        query1.equalTo('objectId',service.get("ClientId"));
        const ClientData = await query2.find()

       
        const service2 = Parse.Object.extend('Service');
        const query3 = new Parse.Query(service2);
        query3.equalTo('objectId',service.get("ServiceId"));
        const ServiceData1 = await query3.find()
     console.log("ServiceData1",ServiceData1)
        var data={
          id:service.id,
          patientName:ClientData[0].get("ClientName"),
          date:service.get("Date"),
          service:ServiceData1[0].get("ServiceName"),
          referenceBy:staffData[0].get("StaffName"),
          status:service.get("Status"),
          isAssigned:service.get("isAssigned"),
        }
       this.serviceData.push(data);
  }
  console.log("data", this.serviceData);
  for(var i=0;i<this.serviceData.length;i++)
  {
    if(this.serviceData[i].status==0)
    {
      this.status=true;
    }
    else{
      this.status=false;
    }
  }
}
 assignServiceRequest(id){
  this.serviceId=id;
  console.log("this",this.serviceId);
    this.router.navigateByUrl('admin/assignService/addEditAssignService/'+this.serviceId)
   // admin/assignService/addEditAssignService/:serviceRequestId
  }
}