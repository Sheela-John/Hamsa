import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ReportService } from 'src/app/services/report.service';
import { StaffService } from 'src/app/services/staff.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ngxCsv } from 'ngx-csv/ngx-csv';
// $('select').selectpicker();
// import {$} from 'jquery';

import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public activityReportForm: any;
  public isActivityReportSubmitted: boolean = false;
  public activityReportList: any = [];
  public activityReportData: any = [];
  public therapistReportForm: any;
  public isTherapistReportSubmitted: boolean = false;
  public therapistReportData: any = [];
  public travelExpenseReportForm: any;
  public TravelHours: any;
  public staffData: any;
  public staffList: any = [];
  public isTravelExpenseReportSubmitted: boolean = false;
  public isTravelHoursSubmitted: boolean = false;
  public TravelExpenseData: any;
  public startgetDate: any;
  public tt: any;
  public startTimeToString: any;
  public startDateData: any;
  public endTimetoString: any;
  public dd: any;
  public endDateData: any;
  public data: any;
  public arr: any;
  public StaffId: {
    enableCheckAll: boolean; singleSelection: boolean; idField: string; textField: string;
    allowSearchFilter: boolean;
  };
  public AllData: any = [];
  // minFromDate: Date;
  // minToDate: Date;
  // maxToDate: Date;
  // maxFromDate: Date;
  public dateSlot: any = [];
  public bsValue = new Date();
  public bsRangeValue: Date[];
  public minDate: any = Date;
  public maxDate: Date;
  public value: any;
  dateArray: any = [];
  startDate: any;
  endDate: any;
  end: any;
  start: any;
  AllData2: any = [];
  dates: any;
  staffList1: any = [];
  staffLists: any = [];
  finalData: any=[];
  travelData: any;
  theraphistData: any;
  public istherapistReportForm: boolean = false;
  public idData: any=[];
  public activityData: any=[];
  public travelExpense: any=[];
  travelMinDate: any;
  activityMinDate: any;
  theraphistMinDate: any;

  constructor(private route: ActivatedRoute, private router: Router, private flashMessageService: FlashMessageService, private fb: FormBuilder, public staffService: StaffService, public reportService: ReportService) {


  }




  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false
    }
    this.initializeActivityReport();
    this.initializeTherapistReport();
    this.initializeTravelExpenseReport();
    this.initializeTravelHours();
    this.getAllStaffs();
    console.log()
  }

  //Initialize Activity Report
  initializeActivityReport() {
    this.activityReportForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    })
  }


  //Initialize Therapist Report
  initializeTherapistReport() {
    this.therapistReportForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    })
  }

  //Initialize Travel Expense Report
  initializeTravelExpenseReport() {
    this.travelExpenseReportForm = this.fb.group({
      staffId1: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    })
  }
  //Working Hours Report
  initializeTravelHours() {
    this.TravelHours = this.fb.group({
      staffId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    })
  }

  //Submit Activity Report
  submitActivityReport() {
    this.isActivityReportSubmitted = true;
    var data={
      fromDate:this.ReverseformatDate(this.activityReportForm.value.startDate),
      toDate:this.ReverseformatDate(this.activityReportForm.value.endDate),
      status:0
    }
    this.reportService.getActivity(data).subscribe(res => {
      if (res.status) {
        this.activityData=[]
        this.activityReportList = res.data;
        this.activityReportList.forEach(ele =>{
          this.activityData.push({
                date: this.formatDate(ele.date),
                // empId: therapistData.staffDetails.empId,
                clientName: ele.clientName,
                phone: ele.phone,
                address: ele.address,
                startDistance: ele.startDistance,
                endDistance: ele.endDistance,
                staffName: ele.staffName,
                serviceName: ele.serviceName,
                time: ele.startTime,
                transportMode: ele.transportMode,
                start:ele.startTime
          })
          // var date=this.formatDate(ele.date)
        })
        console.log(this.activityReportList,"this.activityReportList");
        // this.activityReportList.forEach(therapistData => {
        //   var data = {
        //     date: this.formatDate(therapistData.date),
        //     empId: therapistData.staffDetails.empId,
        //     clientName: therapistData.clientDetails.clientName,
        //     phone: therapistData.phone,
        //     address: therapistData.address,
        //     startDistance: therapistData.clientDistanceDetails.startDistance,
        //     endDistance: therapistData.clientDistanceDetails.endDistance,
        //     staffName: therapistData.staffDetails.staffName,
        //     serviceName: therapistData.servicesDetails.serviceName,
        //     time: therapistData.time.slice(11, 16),
        //     paymentReferenceId: therapistData.paymentReferenceId
        //   }
        //   this.activityReportData.push(data);
        // })
        // console.log(res.data);
      }
    })
  }
  public inputdobValidator(event: any) {
    const pattern = /^\-[0-9]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^\-0-9]/g, "");
    }
    // console.log(event.target.value,"valid");

  }

  public inputdobValidator1(event: any) { }

  // onDateChangeStart(value) {
  //   this.startgetDate = value
  //   console.log(value,"date");
  //   this.tt = value.toLocaleDateString("en-US")
  //   this.startTimeToString = value.toLocaleDateString("en-CA")
  //   this.startDateData = this.tt.split("/");
  //   this.dateSlot = []
  // }

  // onDateChangeEnd(value) {
  //   this.dateSlot = []
  //   this.endTimetoString = value.toLocaleDateString("en-CA")
  //   this.dd = value.toLocaleDateString("en-US")
  //   this.endTimetoString = value.toLocaleDateString("en-CA")
  //   this.endDateData = this.dd.split("/");
  // }

  // onDateChangeStart(event) {
  //   // this.value=event.target.value;
  //   console.log(event,"value");
  //   this.startDate=event;
  //   // if(event !=""){
  //   //   this.TravelHours.patchValue({
  //   //     endDate : ""
  //   //   })
  //   // }
  //   // this.value=event
  //   // this.bsRangeValue = [this.bsValue, this.maxDate];
  //   this.minDate = this.startDate;
  //   console.log(this.minDate,"min");
  //   // this.maxDate = new Date();
  //   // this.minDate.setDate(this.minDate.getDate() + 0);
  //   // this.maxDate.setDate(this.minDate.getDate() + 30);
  //   this.tt = event.toLocaleDateString("en-US")
  //   this.startDateData = this.tt.split("/");
  // //   for ( let i=this.minDate;i<=this.maxDate;i++) {

  // //     this.dateArray.push(new Date(this.minDate));
  // //     this.minDate.setDate(this.minDate.getDate() + 1);
  // //     // break;
  // //     console.log(this.dateArray,"datearr")
  // //  }
  // }



  // onDateChangeEnd(value) {
  //   this.endDate = value;
  //   console.log(this.startDate,"start")
  //   console.log(this.endDate,"endDate")
  //   while (this.startDate <= this.endDate) {
  //     this.dateArray.push(new Date(this.startDate));
  //     this.startDate.setDate(this.startDate.getDate() + 1);
  //  } 
  //     console.log(this.dateArray,"datearr")

  //   // this.dd = value.toLocaleDateString("en-US")
  //   // this.endDateData = this.dd.split("/");
  // }

  onDateChangeStart(value) {
    // console.log(value,"value")
    this.startDate = value;
    this.minDate = value;
    var minDate = value;

    // var findDate = minDate.setDate(minDate.getDate() + 30);
    // var maxDate = this.Reverse1formatDate(findDate)
    // this.start = value;
    // console.log(maxDate,"start")
    this.tt = value.toLocaleDateString("en-US")
    this.startDateData = this.tt.split("/");
    this.TravelHours.patchValue({
      endDate: ""
    })
  }

  onDateChangeEnd(value) {
    this.endDate = value
    // this.end = value
    console.log(this.endDate, "start")
    this.dd = value.toLocaleDateString("en-US")
    this.endDateData = this.dd.split("/");

    // this.bsRangeValue = [this.bsValue, this.maxDate];
    // this.minDate = this.startDate;

    // this.maxDate = new Date();
    // this.minDate.setDate(this.minDate.getDate() + 0);
    // minDate.setDate(minDate.getDate() + 31);



  }
  onDateChangeStartTravel(value){
    this.travelMinDate = value;
    this.travelExpenseReportForm.patchValue({
      endDate: ""
    })
  }
  onDateChangeStartActivity(value){
    this.activityMinDate = value;
    this.activityReportForm.patchValue({
      endDate: ""
    })
  }
  onDateChangeStartTheraphist(value){
    this.theraphistMinDate = value;
    this.therapistReportForm.patchValue({
      endDate: ""
    })
  }

  // //Submit Therapist Report
  // submitTherapistReport() {
  //   this.isTherapistReportSubmitted = true;

  //   // this.reportService.getTherapistReport(this.therapistReportForm.value).subscribe(res => {
  //   //   console.log(res, "resresres");
  //   //   if (res.status) {
  //   //     this.therapistReportData = res.data;
  //   //     console.log(this.therapistReportData, "therapistReportData");
  //   //   }
  //   //   else {
  //   //     this.flashMessageService.errorMessage("err")
  //   //   }
  //   // })
  // }

  //Format Date to display dd-mm-yyyy format in table
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

  //Reverse1 Format Date to display dd-mm-yyyy format in table
  Reverse1formatDate(date) {
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

  //Get All Staffs
  getAllStaffs() {
    console.log("hi all");
    this.staffService.getAllStaffs().subscribe(res => {
      console.log("staffL", res);
      if (res.status) {
        this.staffData = res.data;
        console.log(this.staffData, "staffData");
        this.staffList = [];
        this.staffList1 = [];
        this.staffData.forEach(staffValue => {
          if (staffValue.status == 0) {
            this.staffList.push(staffValue);
            this.staffList1.push({
              _id: staffValue._id,
              staffName: staffValue.staffName,
            });
          }
          this.staffLists = this.staffList1
          console.log(this.staffLists, "drop");
          this.StaffId = {
            enableCheckAll: true,
            singleSelection: false,
            idField: '_id',
            textField: 'staffName',
            allowSearchFilter: true
          }
        });
        console.log(this.staffList, "staffList");
        console.log(this.StaffId, "StaffId");
      }
    })
  }

  // //onChangeClient
  // onChangeClient(event) {
  //   var id = event[0]._id
  //   this.getAllStaffs()
  // }

  //submitTravelExpenseReport
  submitTravelExpenseReport() {
    this.isTravelExpenseReportSubmitted = true;
    // var data = {
    //   startDate: this.ReverseformatDate(this.travelExpenseReportForm.value.startDate),
    //   endDate: this.ReverseformatDate(this.travelExpenseReportForm.value.endDate)
    // }
    console.log(this.travelExpenseReportForm.value.staffId1, 'gh')
    this.idData=[]
    this.travelExpenseReportForm.value.staffId1.forEach(fn=>{
      this.idData.push(fn._id)
    })
    console.log(this.idData,"isd")
    var data={
      staffId:this.idData,
      fromDate:this.ReverseformatDate(this.travelExpenseReportForm.value.startDate),
      toDate:this.ReverseformatDate(this.travelExpenseReportForm.value.endDate)
    }
    console.log(data,"datasoftravel")
    this.reportService.getTravelExpenseReport(data).subscribe(res => {
      if (res.status) {
        this.TravelExpenseData = res.data;
        this.travelExpense=[]
        this.TravelExpenseData.forEach(ele=>{
          ele.details.forEach(item=>{
            this.travelExpense.push({
              Date:this.formatDate(item.Date),
              staffName:ele.staffName,
              Amount:item.Amount,
              Distance:item.Distance
            })
          })
        })
        console.log("travelExpense:",this.travelExpense);
        // console.log(this.TravelExpenseData);
      }
    })
  }

  //save
  Save() {
    this.isTravelHoursSubmitted = true;
    // console.log(this.TravelHours.value,"val")
    var value1 = this.startDate
    var data = {
      startDate: this.ReverseformatDate(this.TravelHours.value.startDate),
      endDate: this.ReverseformatDate(this.TravelHours.value.endDate),
      staffId:this.TravelHours.value.staffId
    }
    var sDate = this.TravelHours.value.startDate;
    var eDate = this.TravelHours.value.endDate;

    console.log(sDate, "sDate");
    console.log(eDate, "eDate");
    console.log(data, "datak");
    this.dateArray = [];
    var count = 0;
    while (sDate <= eDate) {
      this.dateArray.push(this.Reverse1formatDate(sDate));
      sDate.setDate(sDate.getDate() + 1);
      count = count + 1;
      console.log(sDate, "ball")
    }
    this.TravelHours.value.startDate = new Date(sDate.setDate(sDate.getDate() - count));
    console.log("this.dateArray:", this.dateArray);
    this.AllData = [];
    for (let i = 0; i < this.dateArray.length; i++) {
      console.log("ascftr", i);
      
      this.AllData.push({
        date: this.dateArray[i],
        duration: "-",
        earlyBy: "-",
        endTime: "-",
        inTime: "-",
        lateBy: "-",
        outTime: "-",
        staffId: "-",
        staffName: "-",
        startTime: "-",
        totalOT: "-",
        travelDistance: "-",
        travelDuration: "-",
        // _id: "-",        
      })
    }
    console.log("this.AllData:", this.AllData);

    this.reportService.getAttendenace(data).subscribe(res => {
      console.log("res:", res);
      if (res.status) {
        console.log(res, "err")
        this.data = res.data;
        console.log(res.data, "Ashok")
        if (this.data.length != 0) {
          // this.data._id=this.TravelHours.value.staffId
          this.data.forEach(ele => {
            // this.dates=ele.doc.sort()
            var datess = ele.doc
            // console.log(ele.date)
            // if (ele._id == this.TravelHours.value.staffId) {
              // this.view=datess.sort((a, b) => a.date - b.date);
              // console.log(this.view, "datess1")
              datess.forEach((item) => {
                // console.log(this.dateArray,"dateArray")
                this.dateArray.forEach((data, index) => {
                  // console.log(data,"dss")
                  // console.log("dss")
                  console.log(this.Reverse1formatDate("2023-08-02T00:00:00.000Z"))
                  // console.log(data, "data");
                  console.log(this.Reverse1formatDate(item.date))

                  if (data == this.Reverse1formatDate(item.date)) {
                    console.log("hello")
                    this.AllData.splice(index, 1, {
                      date: this.Reverse1formatDate(item.date),
                      duration: item.totalDurationFormatted,
                      earlyBy: item.earlyBy,
                      endTime: item.endTime,
                      inTime: item.inTime,
                      lateBy: item.lateBy,
                      outTime: item.outTime,
                      staffId: item.staffId,
                      staffName: item.staffName,
                      startTime: item.startTime,
                      totalOT: item.totalOT,
                      travelDistance: item.travelDistance,
                      travelDuration: item.travelDuration,
                      // _id: item._id,
                     
                    })
                    this.AllData2 = this.AllData.sort();
                    console.log(this.AllData, "All")
                  }
                })
              })
            // }
            
            // else {
            //   console.log("hrr")
            // }
            console.log(this.AllData, "data hours");this.finalData=this.AllData
          })
        }
      }
      else {
        // this.flashMessageService.errorMessage("Please select a date ");
        this.flashMessageService.errorMessage("Number of Days shoud not be greater than 31 days");
      }
    })
    // this.reportService.getAttendenace()
  }

  //TravelExpense report
  // saveTravelExpense(){
  //   this.travelExpenseReportForm=true
  //   console.log(this.travelExpenseReportForm.value.staffId1,"Travel")
  //   var data={

  //   }
  //   this.reportService.getTravelExpense(data).subscribe(res=>{
  //     this.travelData=res.data
  //     this.travelData.forEach(expense=>{
  //       staffName:""
  //       date:""
  //       travelDistance:""
  //       Amount:""
  //     })
  //   })
  // }

  //Theraphist report
  submitTherapistReport(){
    this.istherapistReportForm=true
    console.log("start:",this.therapistReportForm)
    var data={
      fromDate:this.therapistReportForm.value.startDate,
      toDate:this.therapistReportForm.value.endDate
    }
    console.log(data,"data")
    this.theraphistData=[]
    this.reportService.getTheraphist(data).subscribe(res=>{
      if(res.status){
        console.log(res.data,"response")
        // this.theraphistData=[]
        this.theraphistData=res.data
        
        console.log(this.theraphistData,"this.theraphistData");
        
        // this.theraphistData.forEach(theraphist=>{
        //   staffName:""
        //   completed:""
        //   Assigned:""
        // })
      }
      
    })
  }


  //Export
  export() {
    var options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Attendance Report',
      useBom: true,
      headers: ["Date","Travel Duration","EarlyBy","End Time","In Time","LateBy","Out Time","Staff Name","Start Time","TotalIOT","Travel Distance","Travel Duration"]
    };
    new ngxCsv(this.finalData, "Report", options);
  }



}


