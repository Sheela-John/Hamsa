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
    console.log(this.serviceRequestList,"this.serviceRequestList")
  })
}

 assignServiceRequest(id){
  this.serviceId=id;
  console.log("this",this.serviceId);
    this.router.navigateByUrl('admin/assignService/addEditAssignService/'+this.serviceId)
   // admin/assignService/addEditAssignService/:serviceRequestId
  }
}