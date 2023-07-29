import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ReportService } from 'src/app/services/report.service';
import { StaffService } from 'src/app/services/staff.service';

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
  public staffData: any;
  public staffList: any = [];
  public isTravelExpenseReportSubmitted: boolean = false; 
  TravelExpenseData: any;
  startgetDate: any;
  tt: any;
  startTimeToString: any;
  startDateData: any;
  endTimetoString: any;
  dd: any;
  endDateData: any;

  constructor(private fb: FormBuilder, public staffService: StaffService, public reportService: ReportService) { }

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
   // this.getAllStaffs();
  }

  //Initialize Activity Report
  initializeActivityReport() {
    this.activityReportForm = this.fb.group({
      staffId: ['', Validators.required],
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
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    })
  }

  //Submit Activity Report
  submitActivityReport() {
    this.isActivityReportSubmitted = true;
    this.reportService.getActivityReport(this.activityReportForm.value).subscribe(res => {
      if(res.status) {
        this.activityReportList = res.data;
        this.activityReportList.forEach(therapistData => {
          var data ={
            date: this.formatDate(therapistData.date),
            empId: therapistData.staffDetails.empId,
            clientName: therapistData.clientDetails.clientName,
            phone: therapistData.phone,
            address: therapistData.address,
            startDistance: therapistData.clientDistanceDetails.startDistance,
            endDistance: therapistData.clientDistanceDetails.endDistance,
            staffName: therapistData.staffDetails.staffName,
            serviceName: therapistData.servicesDetails.serviceName,
            time: therapistData.time.slice(11,16),
            paymentReferenceId: therapistData.paymentReferenceId
          }
          this.activityReportData.push(data);
        })
        console.log(res.data);
      }
    })
  }
  public inputdobValidator(event: any) {
    const pattern = /^\-[0-9]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^\-0-9]/g, "");
    }
  }

  onDateChangeStart(value) {
    this.tt = value.toLocaleDateString("en-US")
    this.startDateData = this.tt.split("/");
  }

  onDateChangeEnd(value) {
    this.dd = value.toLocaleDateString("en-US")
    this.endDateData = this.dd.split("/");
  }

  //Submit Therapist Report
  submitTherapistReport() {
    this.isTherapistReportSubmitted = true;
    this.reportService.getTherapistReport(this.therapistReportForm.value).subscribe(res => {
      if(res.status) {
        this.therapistReportData = res.data;
        console.log(this.therapistReportData);
      }
    })
  }

  //Format Date to display dd-mm-yyyy format in table
  formatDate(date){
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
    this.staffService.getAllStaffs().subscribe(res => {
      if (res.status) {
        this.staffData = res.data;
        this.staffData.forEach(staffValue => {
          if(staffValue.status == 0) {
            this.staffList.push(staffValue);
          }
        });
        console.log(this.staffList);
      }
    })
  }

  submitTravelExpenseReport() {
    this.isTravelExpenseReportSubmitted = true;
    console.log(this.travelExpenseReportForm.value,'gh')
    this.reportService.getTravelExpenseReport(this.travelExpenseReportForm.value).subscribe(res => {
      if(res.status) {
        this.TravelExpenseData = res.data;
        console.log(this.TravelExpenseData);
      }
    })
  }
}
