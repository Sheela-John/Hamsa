import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
@Component({
  selector: 'app-branch-tranfer-data',
  templateUrl: './branch-tranfer-data.component.html',
  styleUrls: ['./branch-tranfer-data.component.scss']
})
export class BranchTranferDataComponent implements OnInit {
  public staffList: any;
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public staffId: any=[];
  public empId: any=[];
  public Address: any=[];
  public StaffName: any=[];
  public password: any=[];
  public  Email: any=[];
  public Phone: any=[];
  public Branch: any=[];
  public Status: any=[];
  public StaffRole: any=[];
  public staffDataArr: any=[];
  public staffStatusEnableAndDisable: any;
  public branchId: any=[];
  public BranchName: any=[];
  public BranchDataArr: any=[];
  public  BranchNameArr: any=[];
  public branchid: any;
  branchId1: any;
  BranchNameArray: any=[];
  public staffDataArr1: any=[];
  public BranchTranferId: any=[];
  public branchTransferType: any=[];
  public startDate: any=[];
  public branch: any=[];
  public branchAddress: any=[];
  public endDate: any=[];
  public startTime: any=[];
  public endTime: any=[];
  public branchTransferArr: any=[];
  public branchtype:any=[]
  branchTranferValue: any;
  branchTranferData: string;
  public routerData: any;
  constructor(private router: Router,  public flashMessageService: FlashMessageService,public route: ActivatedRoute) { 
    this.route.params.subscribe((param) => {
      this.routerData = param['staffId'];
      console.log(param, this.routerData)
    })
  }


  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false
    }
   

  }

  //Get All Staffs
 

  //Navigation Add BranchTransfer Form
  addBranchTransfer() {
    this.router.navigateByUrl('admin/branch-Transfer');
  }

  //Navigation for Edit BranchTransfer Form
  editBranchTransfer(id) {
    this.router.navigateByUrl('admin/branch-Transfer/' + id);
  }

  //Navigation for View Staff/BranchTransfer
  viewBranchTransfer(id) {
    this.router.navigateByUrl('admin/staff/viewStaff-branchTransfer/' + id);
  }

  //Navigation for branch Transfer
  branchTransfer(id) {
    this.router.navigateByUrl('admin/branch-Transfer/');
  }

  


}
