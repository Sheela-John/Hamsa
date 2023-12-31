import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import * as Parse from 'parse';
import { RoleService } from 'src/app/services/role.service';
import { StaffService } from 'src/app/services/staff.service';
import { BranchService } from 'src/app/services/branch.service';
import { BranchTransferService } from 'src/app/services/branchTransfer.service';
@Component({
  selector: 'app-view-staff-branch-transfer',
  templateUrl: './view-staff-branch-transfer.component.html',
  styleUrls: ['./view-staff-branch-transfer.component.scss']
})
export class ViewStaffBranchTransferComponent implements OnInit {
  // @ViewChild('cancelSessionModal') public cancelSessionModal: ModalDirective;
  public routerData: any;
  public showAddEdit: boolean = false;
  public empid: any;
  public address: any;
  public staffName: any;
  public staffRole: any;
  public Email: any;
  public Branch: any;
  public phone: any;
  public branchId: any = [];
  public BranchName: any = [];
  public BranchDataArr: any = [];
  public branchTranferId: any = [];
  public branchTransferType: any = [];
  public RoleArr: any;
  public BranchTranferId: any = [];
  branchTranferData: string;
  branchTranferValue: number;
  public branchtype: any = [];
  public startDate: any = [];
  public endDate: any = [];
  public endTime: any = [];
  public branchAddress: any = [];
  public startTime: any = [];
  public branch: any = [];
  public Status: any = [];
  public branchTransferArr: any = [];
  public StaffId: any = [];
  isShow: boolean = false;
  public BranchAddress: any = [];
  public BranchNamedata: any;
  roleDatavalue: any;
  staffData: any;
  branchTransferData: any = [];
  public formatsDateTest:string= 'dd-MM-yyyy HH:mm';
  data: any =[];



  constructor(private router: Router, public route: ActivatedRoute, public branchTransferService: BranchTransferService, public staffService: StaffService, public RoleService: RoleService, private flashMessageService: FlashMessageService) {
    this.route.params.subscribe((param) => {
      this.routerData = param['id'];
      console.log(param, this.routerData)
    })
  }

  ngOnInit(): void {
    console.log(this.routerData)
    if (this.routerData != undefined) {
      this.getByStaffId(this.routerData)
      this.getAllBranchTransferDataForStaff(this.routerData)
      this.getRoleById(this.routerData)

      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;
    }

  }

  back() {
    this.router.navigateByUrl('admin/staffs')
  }

  editBranchTranfer() {

  }
  //Base4App  staff by Id
  getByStaffId(id) {
    console.log("id", id);
    this.staffService.getStaffById(id).subscribe(res => {
      if (res.status) {
        this.staffData = res.data;

        this.empid = this.staffData.empId,
          this.staffName = this.staffData.staffName,
          this.Email = this.staffData.email,
          this.address = this.staffData.address,
          this.phone = this.staffData.phone,
          this.RoleArr = this.staffData.staffRoleName,
          this.Branch = this.staffData.branchName
      }
      console.log("this.staffData", this.staffData)
    })
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

  getRoleById(id) {
    this.RoleService.getRolebyId(id).subscribe(res => {
      if (res.status) {
        this.roleDatavalue = res.data;
      }
    })
  }
  // formatDate(date) {
  //   var d = new Date(date),
  //     month = '' + (d.getMonth() + 1),
  //     day = '' + d.getDate(),
  //     year = d.getFullYear();
  //   if (month.length < 2)
  //     month = '0' + month;
  //   if (day.length < 2)
  //     day = '0' + day;
  //   return [day, month, year].join('-');
  // }
  async getAllBranchTransferDataForStaff(id) {
    this.branchTransferService.getBranchTransferbyStaffId(id).subscribe(res => {
      if (res.status) {
        this.branchTransferData = res.data;
        // this.branchTransferData.forEach(ele =>{
        //   this.data.push({
        //     date:this.formatDate(ele.startDate)
        //   })
        // })
        // console.log(this.data,":data");
        
        console.log( this.branchTransferData,' this.branchTransferData')
        for (var i = 0; i < this.branchTransferData.length; i++) {
          this.branchTransferData[i].Type = (this.branchTransferData[i].branchTransferType == 0) ? 'Temporary' : 'Permanent';
          console.log(this.branchTransferData[i].startDate)
          this.branchTransferData[i].startDate=this.formatDate(this.branchTransferData[i].startDate);
          if(this.branchTransferData[i].endDate)
          {
            this.branchTransferData[i].endDate=this.formatDate(this.branchTransferData[i].endDate);

          }

        }
        console.log("this.branchTransferData", this.branchTransferData)
      }
    })

  }
  editBranchTransfer(id) {
    console.log(id)
    this.router.navigateByUrl(`/admin/branch-Transfer/${this.routerData}/edit/` + id);

  }
  async deleteBranchTransfer(id) {
    console.log(id)
    if(confirm("Are you sure to delete ")){
    this.branchTransferService.deleteBranchTransferbyId(id).subscribe(res => {
      
        if (res.status) {
          this.flashMessageService.successMessage("Branch Transfer Deleted Successfully", 2);
          window.location.reload()
        }
        else {
          this.flashMessageService.errorMessage("Error in Branch Transfer Delete ", 2);
        }
      })
      
    }
  }
}
