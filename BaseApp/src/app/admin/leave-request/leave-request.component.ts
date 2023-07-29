import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss']
})
export class LeaveRequestComponent implements OnInit {

  constructor() { 
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }
public leaveDataArr:any=[];
  ngOnInit(): void {
    this.getAllLeaveRequestFromBack4App();
  }
  async getAllLeaveRequestFromBack4App()
  {
  const leave = Parse.Object.extend('LeaveRequest');
    const query = new Parse.Query(leave);
    try {
      const LeaveData = await query.find()
     
      for (const leave of LeaveData) {
        const staff = Parse.Object.extend('Staff');
        const query1 = new Parse.Query(staff);
        query1.equalTo('objectId',leave.get("StaffId"));
        const staffData = await query1.get(leave.get("StaffId"))
        var leaveData={
          staffName:staffData.get("StaffName"),
          startDate:leave.get("FromDate"),
          endDate:leave.get("ToDate"),
          reason:leave.get("Reason")
        }
        this.leaveDataArr.push(leaveData)
      }
    }
    catch(e)
    {}
  }  
}
