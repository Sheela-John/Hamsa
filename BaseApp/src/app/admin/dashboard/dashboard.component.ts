import { Component, OnInit } from '@angular/core';
import { AssignService } from 'src/app/services/assign.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  public assignServiceList: any;
  public assignServiceLength: any;
  public assigned: any = [];
  public assignedLength: any;
  public completed: any = [];
  public completedLength: any;
  public reschedule: any = [];
  public rescheduleLength: any;
  public notAvailable: any = [];
  public notAvailableLength: any;
  public distanceMismatch: any = [];
  public distanceMismatchLength: any;
  
  constructor(public assignService: AssignService) { }

  ngOnInit(): void {
    // this.getAllAssignService();
  }

  //Get All Assign Service By Staff Id
  getAllAssignService() {
    this.assignService.getAllAssignService().subscribe(res => {
      if (res.status) {
        this.assignServiceList = res.data;
        this.assignServiceList.forEach(assignServiceValue => {
          if(assignServiceValue.status == 4) {
            this.distanceMismatch.push(assignServiceValue);
            this.distanceMismatchLength = this.distanceMismatch.length;
          }
          this.assignServiceLength = this.assignServiceList.length - this.distanceMismatchLength;
          if(assignServiceValue.status == 0) {
            this.assigned.push(assignServiceValue);
            var assignedLength = this.assigned.length;
            this.assignedLength = (assignedLength/this.assignServiceLength)*100;
          }
          else if(assignServiceValue.status == 1) {
            this.completed.push(assignServiceValue);
            var completedLength = this.completed.length;
            this.completedLength = (completedLength/this.assignServiceLength)*100;
          }
          else if(assignServiceValue.status == 2) {
            this.reschedule.push(assignServiceValue);
            var rescheduleLength = this.reschedule.length;
            this.rescheduleLength = (rescheduleLength/this.assignServiceLength)*100;
          }
          else if(assignServiceValue.status == 3) {
            this.notAvailable.push(assignServiceValue);
            var notAvailableLength = this.notAvailable.length;
            this.notAvailableLength = (notAvailableLength/this.assignServiceLength)*100;
          }
          else {
            console.log("complete");
          }
        })
      }
    })
  }
}