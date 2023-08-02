import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { LeaveRequestService } from 'src/app/services/leaveRequest.service';


@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss']
})
export class LeaveRequestComponent implements OnInit {
  public leaveRequestData : any ;
  public leaveRequestValue :  any ;
 public leaveDataArr:any=[];
 public leaveRequestList: any = [];



  constructor(public LeaveRequestService : LeaveRequestService ) { 
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }
// public leaveDataArr:any=[];
  ngOnInit(): void {
    this.getAllleaveRequest();
    console.log("arr",this.leaveDataArr)
  }
  //getAll Branch 
  formattedDate(date) {
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
  getAllleaveRequest() {
    this.LeaveRequestService.getAllleaveRequest().subscribe(res => {
      if (res.status) {
        this.leaveRequestData = res.data;
        this.leaveRequestData.forEach(leaveRequestValue => {
        
            this.leaveDataArr.push(leaveRequestValue);
          
        });
      }
      for(var i=0;i<this.leaveDataArr.length;i++)
      {
        this.leaveDataArr[i].startDate=this.formattedDate(this.leaveDataArr[i].startDate)
        this.leaveDataArr[i].endDate=this.formattedDate(this.leaveDataArr[i].endDate)
      }
    })
  }

}







