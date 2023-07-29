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
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
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
    // this.getAllStaffs();
    this.getAllBranchTransferDatabase4App()
    this.getAllBranchInBase4App()

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

  // Enable or Disable Staff         // 0 - enable, 2 - disable (status)
  
   //**************************************************Base4App  API Intergration Start***************************************************** */
   //getAllStaff Base4App
   async getAllBranchTransferDatabase4App(){
    const branchTransfer = Parse.Object.extend('BranchTransfer');
    const query = new Parse.Query(branchTransfer);
  
  
    try {
      const branchTransferData = await query.find()
      console.log(branchTransferData[0].id)
      branchTransferData.forEach(element => {
        console.log(element)
        this.BranchTranferId.push(element.id);
      });
     console.log(this.staffId)
      for (const staffs of branchTransferData) {
        this.branchTransferType.push(staffs.get("BranchTransferType"));
        console.log( this.branchTransferType)
        this.branchTransferType.forEach(element => {
          this.branchTranferValue=element
          console.log(this.branchTranferValue)
         
          
        });
        
        this.branchTranferData=(this.branchTranferValue==0)?'Temporary':'Permanent'
        console.log( this.branchTranferData)
        this.branchtype.push(this.branchTranferData )
        // console.log( this. branchtype)
      
        this.startDate.push(staffs.get("StartDate"));
        this.endDate.push(staffs.get("EndDate"))
        this.startTime.push(staffs.get("StartTime"))
        this.endTime.push(staffs.get("EndTime"));
        this.branchAddress.push(staffs.get("BranchAddress"));
        this.branch.push(staffs.get("BranchId"))
        this.Status.push(staffs.get("Status"))
   
      }
  
      this.dtTrigger.next(null);
      for (let i = 0; i < this.BranchTranferId.length; i++) {
        //  this. branchtype=(this.branchTransferType[i]=0)?'Temp':'Ordinary'
        
         console.log(this.branchtype)
        this.branchTransferArr.push(
          {
            "BranchTranferId":this.BranchTranferId[i],
            "BranchTranfer": this.branchtype[i],
            "startDate": this.startDate[i],
            "endDate":this.endDate[i],
            "startTime":  this.startTime[i],
            "endTime": this.endTime[i],
            // "Email": this.Email[i],
            // "Phone": this.Phone[i],
            "Branch": this.branch[i],
            "Status":this.Status[i] ,
            "Address":this.branchAddress[i]
          }
        )
      }
      console.log( this.branchTransferArr)
      // this.staffDataArr.forEach(elementbranch => {
      // this.branchId1=elementbranch.Branch
      // console.log(this.branchId1)
      // });
    }
    catch (error) {
      alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }
  
  }
   // Enable or Disable Staff base4App        // 0 - enable, 2 - disable (status)
   async enableDisableStaffInBase4App(id) {
    const staff = Parse.Object.extend('Staff');
    const query = new Parse.Query(staff);
    query.equalTo('objectId', id);
    console.log(id)
    try {
      const staff = await query.get(id);
      this.staffStatusEnableAndDisable= staff.get("Status");
      console.log( this.staffStatusEnableAndDisable,'bf')
      this.staffStatusEnableAndDisable = (this.staffStatusEnableAndDisable == 0) ? 2 :0
      console.log( this.staffStatusEnableAndDisable,'af')
      staff.set("Status",this.staffStatusEnableAndDisable );
        let result = await staff.save()
       staff.set("Status",this.staffStatusEnableAndDisable );
       console.log(this.staffStatusEnableAndDisable)
        const statusStaff= staff.get("Status");
        if(statusStaff==0){
          this.flashMessageService.successMessage("staff Enabled Successfully", 2);
          window.location.reload()
        }
        if(statusStaff==2){
          this.flashMessageService.errorMessage("staff Disabled Successfully", 2);
          window.location.reload()
        }
      } 
   catch(error){
    this.flashMessageService.errorMessage("Error   ", 2);
   }
   
  }
     //Get All Branch In Base4App
async getAllBranchInBase4App() {
  const branch = Parse.Object.extend('Branch');
  const query = new Parse.Query(branch);
 
  try {
    const branchName = await query.find()
    console.log(branchName)
    branchName.forEach(element => {
      this.branchId.push(element.id);
      
    });
    for (const branchData of branchName) {
      console.log(branchData)
      this.BranchName.push(branchData.get("BranchName"));

    }
    for (let i = 0; i < this.branchId.length; i++) {
    
      this.BranchDataArr.push(
        {
          "BranchName": this.BranchName[i],
          "BranchId":this.branchId[i]
        }
       
      )
    console.log(this.BranchDataArr.length)
    console.log(this.staffDataArr.length)
   
    this.BranchDataArr.forEach(element => {
      this.staffDataArr.forEach(stelement => {
        console.log(element.BranchName)
        console.log(stelement.Branch
          )
          if(element.BranchId==stelement.Branch){
      this.BranchNameArr.push(element.BranchName)
          }
          console.log(this.BranchNameArr)
         
      });
    });
    for (let i = 0; i < this.staffId.length; i++) {
      this.staffDataArr1.push(
        {
          "staffId":this.staffId[i],
          "empId": this.empId[i],
          "Address":this.Address[i],
          "StaffName":  this.StaffName[i],
          "Password": this.password[i],
          "StaffRole": this.StaffRole[i],
          "Email": this.Email[i],
          "Phone": this.Phone[i],
          "Branch": this.BranchNameArr[i],
          "Status":this.Status[i] ,
        }
      )
    }
    console.log( this.staffDataArr1)
  }
}
  catch (error) {
    alert(`Failed to retrieve the object, with error code: ${error.message}`);
  }

}

   
    //**************************************************Base4App  API Intergration End***************************************************** */


}
