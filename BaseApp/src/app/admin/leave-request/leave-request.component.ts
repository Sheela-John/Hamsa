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
    // this.getAllLeaveRequestFromBack4App();
    this.getAllleaveRequest();
    // this.getAllSettings();
    console.log("arr",this.leaveDataArr)
  }



  // async getAllLeaveRequestFromBack4App()
  // {
  // const leave = Parse.Object.extend('LeaveRequest');
  //   const query = new Parse.Query(leave);
  //   try {
  //     const LeaveData = await query.find()
     
  //     for (const leave of LeaveData) {
  //       const staff = Parse.Object.extend('Staff');
  //       const query1 = new Parse.Query(staff);
  //       query1.equalTo('objectId',leave.get("StaffId"));
  //       const staffData = await query1.get(leave.get("StaffId"))
  //       var leaveData={
  //         staffName:staffData.get("StaffName"),
  //         startDate:leave.get("FromDate"),
  //         endDate:leave.get("ToDate"),
  //         reason:leave.get("Reason")
  //       }
  //       this.leaveDataArr.push(leaveData)
  //     }
  //   }
  //   catch(e)
  //   {}
  // }  

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







