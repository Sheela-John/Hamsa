import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxMaterialTimepickerComponent } from "ngx-material-timepicker";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BranchService } from 'src/app/services/branch.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Subject, takeUntil } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { BranchTransferService } from 'src/app/services/branchTransfer.service';
@Component({
  selector: 'app-branch-transfer',
  templateUrl: './branch-transfer.component.html',
  styleUrls: ['./branch-transfer.component.scss']
})
export class BranchTransferComponent implements OnInit {
  public branchTransferForm: any;
  public isbranchTransferFormSubmitted: boolean = false;
  public showAddEdit: boolean;
  @ViewChild("startpicker")
  public ngxMaterialStartTimepicker!: NgxMaterialTimepickerComponent;
  @ViewChild("endpicker")
  public ngxMaterialEndTimepicker!: NgxMaterialTimepickerComponent;
  public startpickerOpened: boolean = false;
  public endpickerOpened: boolean = false;
  public formattedAddress: any;
  @ViewChild("placesRef") placesRef: GooglePlaceDirective;
  public branchData: any;
  public branchList: any = [];
  public BranchDatavalue: any;
  public destroy$ = new Subject();
  public ishidden: boolean = false;
  public isShowTime: boolean = false;
  public sDate: any;
  public eDate: any;
  public routerData: any;
  public branchId: any = [];
  public BranchName: any = [];
  public BranchStatus: any = [];
  public BranchDataArr: any = [];
  public BranchNameArr: any = [];
  public endDate: any;
  public startDate: any;
  public startTime: any;
  public EndTime: any;
  public isShowDate: boolean = false
  homeBranchLatitude: any;
  homeBranchLongitude: any;
  branchNamedata: any;
  StaffId: any;
  public minDate = new Date();
  public isEnableDisable: boolean = false;
  startDateData: any;
  endDateData: any;

  constructor(private router: Router, private fb: FormBuilder, public branchTransferService: BranchTransferService, public BranchService: BranchService, private flashMessageService: FlashMessageService, private route: ActivatedRoute) {
    this.route.params.subscribe((param) => {
      this.StaffId = param['staffId'];
      this.routerData = param['branchTranferId'];
      this.minDate.setDate(this.minDate.getDate());
    })

    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }

  ngOnInit(): void {
    this.initializeBranchTransferForm();
    this.getAllBranch();
    //  // this.getAllBranchInBase4App()
    if (this.routerData != undefined) {
      this.getBranchTranferById(this.routerData)
      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;
    }
  }

  //Initialize Staff Form
  initializeBranchTransferForm() {
    this.branchTransferForm = this.fb.group({
      branchTransferType: [, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['',],
      startTime: [''],
      endTime: [''],
      branchId: ['', Validators.required],
      branchAddress: ['', Validators.required],
    })
  }

  ngOnDestroy() {
    if (this.startpickerOpened && this.ngxMaterialStartTimepicker)
      this.ngxMaterialStartTimepicker.close();
    if (this.endpickerOpened && this.ngxMaterialEndTimepicker)
      this.ngxMaterialEndTimepicker.close();
  }

  //getAll Branch 
  getAllBranch() {
    this.BranchService.getAllBranches().subscribe(res => {
      if (res.status) {
        this.branchData = res.data;
        this.branchData.forEach(branchValue => {
          if (branchValue.status == 0) {
            this.branchList.push(branchValue);
          }
        });
        console.log(this.branchList, "this.branchList")
      }
    })
  }
  getBranchTranferById(id) {
    this.branchTransferService.getBranchTransferbyId(id).subscribe(res => {
      if (res.data) {
        this.BranchDatavalue = res.data
        console.log("this.BranchDatavalue", this.BranchDatavalue)
        this.branchTransferForm.controls['branchId'].patchValue(this.BranchDatavalue.branchId);
        this.branchTransferForm.controls['branchTransferType'].patchValue(this.BranchDatavalue.branchTransferType);
        this.branchTypeChange();
        if(this.BranchDatavalue.branchTransferType==0)
        {
        this.branchTransferForm.controls['startDate'].patchValue(this.formattedDate(this.BranchDatavalue.startDate));
        this.branchTransferForm.controls['endDate'].patchValue(this.formattedDate(this.BranchDatavalue.endDate));
        }
        else{
          this.branchTransferForm.controls['startDate'].patchValue(this.formattedDate(this.BranchDatavalue.startDate));
        }
        if(this.BranchDatavalue.startDate==this.BranchDatavalue.endDate)
        {
           this.branchTransferForm.controls['startTime'].patchValue(this.BranchDatavalue.startTime);
           this.branchTransferForm.controls['endTime'].patchValue(this.BranchDatavalue.endTime);
        }
        this.branchTransferForm.controls['branchAddress'].patchValue(this.BranchDatavalue.branchAddress);
      }
    })
  }
  //getBranchbyId to patch branchaddress while selecting Branch
  getBranchbyId(event) {
    var id = event.target.value
    this.BranchService.getBranchbyId(id).subscribe(res => {
      if (res.status) {
        console.log(res.data, "sS")
        this.BranchDatavalue = res.data
        this.branchTransferForm.controls['branchAddress'].patchValue(this.BranchDatavalue.branchAddress);
      }
    })
  }

  //Ngx-google Autocomplete --NPM
  options: any = {
    componentRestrictions: { country: ['IND'] }
  }

  handleAddressChange(address: any) {
    console.log("Address Changed", address);
    this.formattedAddress = address.address_components
    this.branchTransferForm.controls['branchAddress'].setValue(address.formatted_address)
  }

  //branchTypeshow Based on Flied
  branchTypeChange() {
    var type = this.branchTransferForm.value.branchTransferType
    console.log(typeof (type), "type")
    if (type == 0) {
      this.ishidden = true;
    }
    else {
      this.ishidden = false;
      this.branchTransferForm.controls['startTime'].setValue('')
      this.branchTransferForm.controls['endTime'].setValue('')
      this.branchTransferForm.controls['endDate'].setValue('')
    }
    if (this.startDate != 'undefined' && this.endDate != 'undefined') {
      this.isShowDate = true
    }
    else {
      this.isShowDate = false;
    }
  }
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
  //dateSame show Time
  dateValueSame() {
    console.log("this.sDate",this.sDate,this.eDate)
    if (this.sDate !=undefined && this.eDate != undefined) {
      console.log("fff")
      console.log(this.startDateData, this.endDateData)
      if (this.sDate == this.eDate) {
        console.log(true)
        this.isShowTime = true;
      } else {
        console.log(false)
        this.isShowTime = false
      }
    }
  }
  public inputdobValidator(event: any) {
    const pattern = /^\-[0-9]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^\-0-9]/g, "");
    }
  }
  //getStarttime
  dateSame(eve) {
    this.startDateData = eve
    if (eve != undefined) {
      this.sDate =this.formattedDate(eve)// eve.toLocaleString("en-ca").slice(0, 10)
    }
    this.dateValueSame()
  }

  //getEndtime
  dateSame1(eve) {
    this.endDateData = eve;
    if (eve != undefined) {
      this.eDate = this.formattedDate(eve)//eve.toLocaleString("en-ca").slice(0, 10)
    }
    this.dateValueSame()
  }


  backTostaff() {
    this.router.navigateByUrl('admin/branch-transfer-data')
  }


  sumbitbranchTranser() {
    console.log(this.branchTransferForm.value)
  }

  updateBranchTransfer() {
    var id = this.routerData
    this.isbranchTransferFormSubmitted = true;
    this.branchTransferForm.value._id = this.routerData;
    this.branchTransferForm.value.startDate=this.sDate;
    this.branchTransferForm.value.endDate=this.eDate;
    if (this.branchTransferForm.valid) {
      this.branchTransferService.updateBranchTransferById(this.branchTransferForm.value).subscribe(res => {
        if (res.status) {
          this.flashMessageService.successMessage("Branch Transfer Updated Successfully", 2);
          this.router.navigateByUrl('admin/staff/viewStaff-branchTransfer/' + this.StaffId)
        }
        else {
          this.flashMessageService.errorMessage('Error while updating branch Transfer');
        }
      })
    }
  }
  addBranchTransfer()
  {
    if (this.branchTransferForm.valid) {
      this.branchTransferForm.value.staffId=this.StaffId;
      this.branchTransferForm.value.startDate=this.sDate;
      this.branchTransferForm.value.endDate=this.eDate;
      this.branchTransferService.createBranchTransfer(this.branchTransferForm.value).subscribe(res=>
        {
          if(res.status)
          {
            this.flashMessageService.successMessage("Branch Transfer Created Successfully", 2);
            this.router.navigateByUrl('admin/staff/viewStaff-branchTransfer/' + this.StaffId)
          }
          else{
            this.flashMessageService.errorMessage("Error  in Creating Branch Transfer", 2);
          }
        })
    }
  }
  //**************************************************Base4App  API Intergration Start***************************************************** */
  //Add branch transfer Base4 App
  async addBranchTransferBase4App() {
      console.log(this.branchTransferForm.value)
      console.log(this.startDateData, this.endDateData)
      this.isbranchTransferFormSubmitted = true
      if (this.branchTransferForm.valid) {
        const staff = new Parse.Object("BranchTransfer");
        staff.set('StaffId', this.StaffId)
        staff.set('BranchTransferType', this.branchTransferForm.value.branchTransferType)
        staff.set("EndDate", this.endDateData);
        staff.set("StartDate", this.startDateData)
        staff.set("StartTime", this.branchTransferForm.value.startTime)
        staff.set("EndTime", this.branchTransferForm.value.endTime)
        staff.set("Phone", this.branchTransferForm.value.phone)
        staff.set("BranchAddress", this.branchTransferForm.value.branchAddress);
        staff.set("BranchId", this.branchTransferForm.value.branchId);
        staff.set("Status", 0);
        try {
          let result = await staff.save()

          this.flashMessageService.successMessage("Branch Transfer Created Successfully", 2);
          this.router.navigateByUrl('admin/staff/viewStaff-branchTransfer/' + this.StaffId)
        } catch (error) {
          this.flashMessageService.errorMessage("Error while Creating Branch Transfer", 2);
        }
      }
    }
  //Get All Branch In Base4App
  async getAllBranchInBase4App() {
      const branch = Parse.Object.extend('Branch');
      const query = new Parse.Query(branch);
      try {
        const branchName = await query.find()
        branchName.forEach(element => {
          this.branchId.push(element.id);
        });
        for (const branchData of branchName) {
          this.BranchName.push(branchData.get("BranchName"));
          this.BranchStatus.push(branchData.get("BranchStatus"))
        }
        for (let i = 0; i < this.branchId.length; i++) {
          console.log(this.BranchStatus)
          this.BranchDataArr.push(
            {
              "BranchName": this.BranchName[i],
              "Branchstatus": this.BranchStatus[i],
              "BranchId": this.branchId[i]
            }

          )
        }
        console.log(this.BranchDataArr)
        for (let i = 0; i < this.branchId.length; i++) {
          if (this.BranchStatus[i] == 0)
            this.BranchNameArr.push({
              "BranchName": this.BranchName[i],
              "BranchId": this.branchId[i]
            })
        }
        console.log(this.BranchNameArr)
      }
      catch (error) {
        alert(`Failed to retrieve the object, with error code: ${error.message}`);
      }

    }

  //Update Branch Transfer
  async updateBranchTransferInBase4App() {
      this.isbranchTransferFormSubmitted = true
      if (this.branchTransferForm.valid) {
        const staff = new Parse.Object("BranchTransfer");
        staff.set('objectId', this.routerData);
        console.log(this.routerData)
        staff.set('StaffId', this.StaffId)
        staff.set('BranchTransferType', this.branchTransferForm.value.branchTransferType)
        staff.set("EndDate", this.endDateData);
        staff.set("StartDate", this.startDateData)
        staff.set("StartTime", this.branchTransferForm.value.startTime)
        staff.set("EndTime", this.branchTransferForm.value.endTime)
        staff.set("Phone", this.branchTransferForm.value.phone)
        staff.set("BranchAddress", this.branchTransferForm.value.branchAddress);
        staff.set("BranchId", this.branchTransferForm.value.branchId);
        staff.set("Status", 0);
        try {
          let result = await staff.save();
          this.flashMessageService.successMessage("Branch Transfer Updated Successfully", 2);
          this.router.navigateByUrl('admin/staff/viewStaff-branchTransfer/' + this.StaffId)
        } catch (error) {
          this.flashMessageService.errorMessage("Error while Updating Branch Transfer", 2);
        }
      }
    }
  async getBranchbyIdBack4App(e) {

      var branchId = this.branchTransferForm.value.branchId
      console.log(branchId)
      const branch = Parse.Object.extend('Branch');
      const query = new Parse.Query(branch);

      query.equalTo('objectId', branchId);
      console.log(branchId)
      try {
        const results = await query.find();

        for (const branch of results) {

          const BranchAddress = branch.get('BranchAddress')
          const BranchName = branch.get('BranchName')
          this.homeBranchLatitude = branch.get('Latitude')
          this.homeBranchLongitude = branch.get('Longitude')
          console.log(this.homeBranchLatitude, this.homeBranchLongitude)

          console.log(BranchName)
          this.branchNamedata = BranchName
          console.log(this.branchNamedata)
          this.branchTransferForm.get('branchAddress').patchValue(BranchAddress)

        }


      } catch (error) {
        console.error('Error while fetching ToDo', error);
      }


    }
    //**************************************************Base4App  API Intergration end***************************************************** */
  }
