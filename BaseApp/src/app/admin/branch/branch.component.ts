import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { BranchService } from 'src/app/services/branch.service';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})

export class BranchComponent implements OnInit {
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public branchList: any;
  public branchId: any=[];
  public BranchName: any=[];
  public BranchAddress: any=[];
  public BranchStatus: any=[];
  public BranchDataArr: any=[];
  public BranchStatusEnableAndDisable: any;
  public 
  BranchNameArr: any;
  constructor(private router: Router, public branchService: BranchService, public flashMessageService: FlashMessageService) {
   }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false
    }
    this.getAllBranch();
  }
  

  //Add Button-Route
  addBranch() {
    this.router.navigateByUrl('admin/addEditBranch');
  }

  //Edit Button-Route
  editBranch(id) {
    this.router.navigateByUrl('admin/branch/addEditBranch/' + id);
  }

  //get All Branch
  getAllBranch() {
    this.branchService.getAllBranches().subscribe(res => {
      if (res.status) {
        this.branchList = res.data;
        this.dtTrigger.next(null);
      }
    })
  }
  // Enable or Disable Branch         // 0 - enable, 2 - disable (status)
  enableDisableBranch(id) {
    var roleId = id;
    this.branchService.enableDisableBranch(roleId).subscribe(res => {
      if (res.status) {
        if (res.data.status == 0) {
          this.flashMessageService.successMessage("Branch Enabled Successfully", 2);
          this.getAllBranch();
        }
        if (res.data.status == 2) {
          this.flashMessageService.errorMessage("Branch Disabled Successfully", 2);
          this.getAllBranch();
        }
      }
      else {
        this.flashMessageService.errorMessage("Error while Creating Branch", 2);
      }
    })
  }
 
}