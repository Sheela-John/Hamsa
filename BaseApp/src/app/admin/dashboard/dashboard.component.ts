import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AssignService } from 'src/app/services/assign.service';
import { StaffService } from 'src/app/services/staff.service';

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
staffData: any;
  staffList: any=[];
  staffList1: any=[];
  staffLists: any=[];
  StaffId: { enableCheckAll: boolean; singleSelection: boolean; idField: string; textField: string; allowSearchFilter: boolean; };
  dashboardForm: any;
  panel: any[];
  res: any;
  boardData: any=[];
  startDate: Date;
  startDateThirty: Date;
  endDate: Date;
  arr: any=[];
  Assign: any;
  Assigned: any;
  Completed: any;
  TotalCount: any;
  Rescheduled: any;
  resh: number;
  Done: number;
  progress: any=[];
  val: any;
  dashBoardData: any;
  
  constructor(private fb: FormBuilder,public staffService: StaffService,public assignService: AssignService) { }

  ngOnInit(): void {
    this.initializeDashboardForms();
    this.getAllStaffs();
    this.arr=["60"]
  }
  

  //Initialize Activity Report
  initializeDashboardForms() {
    this.dashboardForm = this.fb.group({
      staffId: ['', Validators.required],
      customDate:['']
    })
  }

  //Get All Assign Service By Staff Id
  getAllAssignService() {
    this.assignService.getAllAssignService().subscribe(res => {
      if (res.status) {
        this.assignServiceList = res.data;
        this.assignServiceList.forEach(assignServiceValue => {
          // if(assignServiceValue.status == 4) {
            //   this.distanceMismatch.push(assignServiceValue);
            //   this.distanceMismatchLength = this.distanceMismatch.length;
          // }
          // this.assignServiceLength = this.assignServiceList.length - this.distanceMismatchLength;
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

//Get All Staffs
   getAllStaffs() {
    console.log("hi all");
    this.staffService.getAllStaffs().subscribe(res => {
      console.log("staffL", res);
      if (res.status) {
        this.staffData = res.data;
        console.log(this.staffData, "staffData");
        this.staffList = [];
        this.staffData.forEach(staffValue => {
          if (staffValue.status == 0) {
            
            this.staffList.push(staffValue);
            // this.staffList1.push({
            //   _id: staffValue._id,
            //   staffName: staffValue.staffName,
            // });
    }
    // this.staffLists = this.staffList1
          // console.log(this.staffLists, "drop");
          // this.StaffId = {
          //   enableCheckAll: true,
          //   singleSelection: false,
          //   idField: '_id',
          //   textField: 'staffName',
          //   allowSearchFilter: true
          // }
        });
        this.dashboardForm.controls['staffId'].patchValue(this.staffData[0]._id);
        console.log(this.staffList, "staffList");
        this.dashBoard(0);
      }

    })
   
  }

   //Reverse Format Date to display dd-mm-yyyy format in table
   ReverseformatDate(date) {
    console.log(date, "data")
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    console.log(d, "p")
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    return [year, month, day].join('-');
  }
  

  //getDashboardData
  dashBoard(value){
    this.val=value;
    console.log(value,"hai");
    console.log(value==0,"condition");
    var id= this.dashboardForm.value.staffId;
    console.log("iddd:", id);
    var customDate=this.dashboardForm.value.customDate
    console.log(customDate,"id");
    console.log(this.dashboardForm.value.staffId,"val");
    // console.log(this.dashboardForm,"val");
    var date =new Date(); 
    var yesterdayDate =new Date(); 
    var pastSevenDate =new Date(); 
    var pastThirtyDate =new Date(); 
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    console.log(yesterdayDate,"yesterdayDate");
    pastSevenDate.setDate(pastSevenDate.getDate() - 6);
    pastThirtyDate.setDate(pastThirtyDate.getDate() - 29);
    this.startDate=pastSevenDate
    this.startDateThirty=pastThirtyDate
    this.endDate=new Date();
    console.log(this.startDate,"startDate");
    console.log(this.startDateThirty,"startDateThirty");
    console.log(this.endDate,"endDate");
    var data
    if(value ==0){
       data = {
        "staffId":(id != '') ? id : this.staffData[0]._id,
        "date":this.ReverseformatDate(date)
      }
    }
    if(value ==1){
       data = {
        "staffId":id,
        "date":this.ReverseformatDate(yesterdayDate)
      }
    }
    if(value ==2){
       data = {
        "staffId":id,
        "fromDate":this.ReverseformatDate(this.startDate),
        "toDate":this.ReverseformatDate(this.endDate)
        
      }
    }
    if(value ==3){
       data = {
        "staffId":id,
        "fromDate":this.ReverseformatDate(this.startDate),
        "toDate":this.ReverseformatDate(this.endDate)
      }
    }
    if(value ==4){
       data = {
        "staffId":id,
        "date":this.ReverseformatDate(customDate)
      }
      // this.dashboardForm.customDate.patchValue(new Date())
      this.dashboardForm.patchValue({
        customDate: new Date(),
      })
      // console.log(this.dashboardForm.customDate.patchValue(new Date()),"haha")
    }
    console.log(data,"deemsys")
      this.assignService.getDashboardData(data).subscribe(res=>{
        if(res.status){
          console.log(res.data,"res.data");
          this.dashBoardData=res.data
          // console.log(this.res);
          // this.boardData=[]
          // this.boardData.push(this.res)
          // this.boardData.forEach(data=>{
            // this.Assigned=data.Assigned
            // this.Completed=Number(data.Completed)
            // this.TotalCount=Number(data.TotalCount)
            // this.Rescheduled=Number(data.Rescheduled)
          // })
          // this.progress=[]
          console.log((this.dashBoardData.Assigned/this.dashBoardData.TotalCount), (this.dashBoardData.Assigned/this.dashBoardData.TotalCount)*100,"type")
          this.Assign= (this.dashBoardData.Assigned == 0 || this.dashBoardData.TotalCount == 0) ? 0 : (this.dashBoardData.Assigned/this.dashBoardData.TotalCount)*100,
          this.Completed= (this.dashBoardData.Completed == 0 || this.dashBoardData.TotalCount == 0) ? 0 : (this.dashBoardData.Completed/this.dashBoardData.TotalCount)*100,
          this.Rescheduled= (this.dashBoardData.Rescheduled == 0 || this.dashBoardData.TotalCount == 0) ? 0 : (this.dashBoardData.Rescheduled/this.dashBoardData.TotalCount)*100,
          console.log(this.Assign,"Assign");
          // this.Done= (this.Assigned/this.TotalCount)*100,
          // this.resh= (this.Assigned/this.TotalCount)*100
          // this.progress.push(this.Assign,this.Done,this.resh);
          console.log(this.progress,"progress");
          
          
          console.log(this.boardData,"boardData");
          
        }
      }) 
  }
  dash(){
    console.log("hello");
    this.dashBoard(this.val)
  }
  changeDate(){
    console.log(this.val,"this.val");
    this.dashBoard(this.val)
  }
  }

  