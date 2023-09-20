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
import { StaffService } from 'src/app/services/staff.service';
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
  public branchTransferType: any;
  staffDataBranch: any;

  constructor(private router: Router, private fb: FormBuilder, public staffService: StaffService, public branchTransferService: BranchTransferService, public BranchService: BranchService, private flashMessageService: FlashMessageService, private route: ActivatedRoute) {
    this.route.params.subscribe((param) => {
      this.StaffId = param['id'];
      this.routerData = param['branchTranferId'];
      this.minDate.setDate(this.minDate.getDate());
    })
  }

  ngOnInit(): void {
    this.initializeBranchTransferForm();
    console.log("this.StaffId",this.StaffId)
    this.getByStaffId(this.StaffId);
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
      endDate: [''],
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
  getByStaffId(id) {

    this.staffService.getStaffById(id).subscribe(res => {
      if (res.status) {
        this.staffDataBranch = res.data.branchId;
        console.log("this.staffDataBranch", this.staffDataBranch)
        // this.getAllBranch();
      }
    })

  }

  //getAll Branch 
  getAllBranch() {

    this.BranchService.getAllBranches().subscribe(res => {
      if (res.status) {
        this.branchData = res.data;
       
        this.branchList = [];
        this.branchData.forEach(branchValue => {
          if (branchValue.status == 0) {
            if (this.routerData==undefined) {
              if (branchValue._id != this.staffDataBranch) {
                this.branchList.push(branchValue);
              }
            }
            else {
              this.branchList.push(branchValue);
            }
          }
        });
      }
    })
  }
  getBranchTranferById(id) {
    this.branchTransferService.getBranchTransferbyId(id).subscribe(res => {
      if (res.data) {
        console.log("res", res.data)
        this.BranchDatavalue = res.data
        this.branchTransferForm.controls['branchId'].patchValue(this.BranchDatavalue.branchId);
        //   this.branchTransferForm.controls['b']
        this.branchTransferForm.controls['branchTransferType'].patchValue(this.BranchDatavalue.branchTransferType);
        this.branchTypeChange();
        if (this.BranchDatavalue.branchTransferType == 0) {
          this.branchTransferForm.controls['startDate'].patchValue(this.formatDate(this.BranchDatavalue.startDate));
          this.branchTransferForm.controls['endDate'].patchValue(this.formatDate(this.BranchDatavalue.endDate));
        }
        else {
          this.branchTransferForm.controls['startDate'].patchValue(this.formatDate(this.BranchDatavalue.startDate));
        }
        if (this.BranchDatavalue.startDate == this.BranchDatavalue.endDate) {
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
    this.formattedAddress = address.address_components
    this.branchTransferForm.controls['branchAddress'].setValue(address.formatted_address)
  }

  //branchTypeshow Based on Flied
  branchTypeChange() {
    var type = this.branchTransferForm.value.branchTransferType
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
      this.isShowDate = true;
      // this.branchTransferForm.controls['endDate'].setValidators([Validators.required]);
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
    return [year, month, day].join('-');
  }
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
  //dateSame show Time
  dateValueSame() {
    if (this.sDate != undefined && this.eDate != undefined) {
      if (this.sDate == this.eDate) {
        this.isShowTime = true;
        this.branchTransferForm.controls['startTime'].setValidators([Validators.required]);
        this.branchTransferForm.controls['endTime'].setValidators([Validators.required]);
      } else {
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
      this.sDate = this.formattedDate(eve)// eve.toLocaleString("en-ca").slice(0, 10)

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
    // this.router.navigateByUrl('admin/staffs')
    this.router.navigateByUrl('admin/staff/viewStaff-branchTransfer/' + this.StaffId)
    this.router.navigateByUrl('admin/staffs')
  }


  sumbitbranchTranser() {

  }

  updateBranchTransfer() {

    var id = this.routerData
    this.isbranchTransferFormSubmitted = true;
    this.branchTransferForm.value._id = this.routerData;
    this.branchTransferForm.value.startDate = this.sDate;

    if (this.branchTransferForm.value.endDate) {
      this.branchTransferForm.value.endDate = this.eDate;
    }

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
  addBranchTransfer() {
    this.isbranchTransferFormSubmitted = true;

    if (this.branchTransferForm.valid) {

      // this.branchTransferForm.value.branchTransferType = this.branchTransferType;
console.log("this.StaffId",this.StaffId)
      this.branchTransferForm.value.staffId = this.StaffId;
      console.log("this.sDate",this.sDate)
      this.branchTransferForm.value.startDate = this.sDate;
      this.branchTransferForm.value.endDate = this.eDate;
      this.branchTransferService.createBranchTransfer(this.branchTransferForm.value).subscribe(res => {
        if (res.status) {
          this.flashMessageService.successMessage("Branch Transfer Created Successfully", 2);
          this.router.navigateByUrl('admin/staff/viewStaff-branchTransfer/' + this.StaffId)
        }
        else {
          this.flashMessageService.errorMessage("Error  in Creating Branch Transfer", 2);
        }
      })
    }
    else {
      console.log("Error in creating branch")
    }
  }
}