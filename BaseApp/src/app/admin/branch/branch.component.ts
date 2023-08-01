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
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
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
   //----------------------------------- Back4App BRANCH API INTEGRATION - START -------------------------------------------//
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
        this.BranchAddress.push(branchData.get("BranchAddress"));
        this.BranchStatus.push(branchData.get("BranchStatus"))
      }
  
      this.dtTrigger.next(null);
      for (let i = 0; i < this.branchId.length; i++) {
        console.log(this.BranchStatus[i])
       

        this.BranchDataArr.push(
          {
            "BranchName": this.BranchName[i],
            "BranchAddress": this.BranchAddress[i],
            "BranchId": this.branchId[i],
            "status": this.BranchStatus[i]
          }
        )
      
      }
    }
    catch (error) {
      alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }
  
  }
   //EnableDisable in Branch In Base4App
   async enableDisableBranchInBase4App(id) {
    const branch = Parse.Object.extend('Branch');
    const query = new Parse.Query(branch);
    query.equalTo('objectId', id);
    console.log(id)
    try {
      const branch = await query.get(id);
      this.BranchStatusEnableAndDisable= branch.get("BranchStatus");
      console.log( this.BranchStatusEnableAndDisable)
      this.BranchStatusEnableAndDisable = (this.BranchStatusEnableAndDisable == 0) ? 2 :0
      branch.set("BranchStatus",this.BranchStatusEnableAndDisable );
        let result = await branch.save()
        branch.set("BranchStatus",this.BranchStatusEnableAndDisable );
        const statusService= branch.get("BranchStatus");
        if(statusService==0){
          this.flashMessageService.successMessage("Branch Enabled Successfully", 2);
          window.location.reload()
        }
        if(statusService==2){
          this.flashMessageService.errorMessage(" Branch Disabled Successfully", 2);
          window.location.reload()
        }
      } 
   catch(error){
    this.flashMessageService.errorMessage("Error   ", 2);
   }
   
  }

    //----------------------------------- Back4App BRANCH API INTEGRATION - END -------------------------------------------//
}