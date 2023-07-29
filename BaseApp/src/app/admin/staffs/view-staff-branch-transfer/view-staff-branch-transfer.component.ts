import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import * as Parse from 'parse';
@Component({
  selector: 'app-view-staff-branch-transfer',
  templateUrl: './view-staff-branch-transfer.component.html',
  styleUrls: ['./view-staff-branch-transfer.component.scss']
})
export class ViewStaffBranchTransferComponent implements OnInit {
  public routerData: any;
  public showAddEdit: boolean=false;
  public empid: any;
  public address: any;
  public staffName: any;
  public staffRole: any;
  public Email: any;
  public Branch: any;
  public phone: any;
  public branchId: any=[];
  public BranchName: any=[];
  public BranchDataArr: any=[];
  public branchTranferId: any=[];
  public branchTransferType: any=[];
  public RoleArr: any=[];
  public BranchTranferId: any=[];
  branchTranferData: string;
  branchTranferValue: number;
  public branchtype: any=[];
  public startDate: any=[];
  public endDate: any=[];
  public endTime: any=[];
  public branchAddress: any=[];
  public startTime: any=[];
  public branch: any=[];
  public Status: any=[];
  public branchTransferArr: any=[];
  public StaffId: any=[];
  isShow: boolean=false;
   public BranchAddress: any=[];
  public BranchNamedata: any;



  constructor(private router: Router,public route: ActivatedRoute,private flashMessageService:FlashMessageService ) { 
    this.route.params.subscribe((param) => {
      this.routerData = param['id'];
      console.log(param, this.routerData)
    })
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }

  ngOnInit(): void {
    console.log(this.routerData)
    this.getAllBranchTransferDatabase4App()
    if (this.routerData != undefined) {
      this.getRoleByIdBase4App(this.routerData)  
   
      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;
    }
  
  }

  back() {
    this.router.navigateByUrl('admin/staffs')
  }
  
  editBranchTranfer(){
    
  }
    //Base4App  staff by Id
    async getRoleByIdBase4App(id){
      const staffs = Parse.Object.extend('Staff');
      const query = new Parse.Query(staffs);
    
      query.equalTo('objectId', id);
       try{
        const staff = await query.get(id)
        
        this. empid= staff.get("empId")
          this.address= staff.get("Address");
        this. staffName= staff.get("StaffName",)
         this. staffRole= staff.get("StaffRole")
         this. Email=staff.get("Email");
         this. phone= staff.get("Phone")
         this. Branch= staff.get("Branch");
         console.log(this.staffRole)
      
       }
      
      catch (error) {
        console.error('Error while fetching ToDo', error);
      }
      const role = Parse.Object.extend('RolePosition');
      const query1= new Parse.Query(role);
    
      query1.equalTo('objectId', this.staffRole);
     
       try{
        const role = await query1.get(this.staffRole)
        this.RoleArr= role.get('Role')
        console.log( this.RoleArr)
        const addRole = role.get('AddRole')
        console.log(addRole)
          const endTime = role.get('EndTime')
         
          // this.roleForm.get('addSlot').patchValue(addRole)
       
       }
      
      catch (error) {
        console.error('Error while fetching ToDo', error);
      }
    }
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
          this.StaffId.push(staffs.get("StaffId"))
          // console.log( this. branchtype)
          this.startDate.push(staffs.get("StartDate"));
          this.endDate.push(staffs.get("EndDate"))
          this.startTime.push(staffs.get("StartTime"))
          this.endTime.push(staffs.get("EndTime"));
          this.branchAddress.push(staffs.get("BranchAddress"));
          this.branch.push(staffs.get("BranchId"))
          this.Status.push(staffs.get("Status"))
     
        }
    
         console.log(this.StaffId)
        for (let i = 0; i < this.BranchTranferId.length; i++) {
          //  this. branchtype=(this.branchTransferType[i]=0)?'Temp':'Ordinary'
          const branch = Parse.Object.extend('Branch');
          const query = new Parse.Query(branch);
        
          query.equalTo('objectId',  this.branch[i]);
          console.log( this.branch[i])
          try {
            const results = await query.find();
           
            for (const branch of results) {
              // Access the Parse Object attributes using the .GET method
               this.BranchNamedata =branch.get('BranchName')
              this.BranchAddress.push(branch.get('BranchAddress'))
              console.log(this.BranchNamedata)
              // this.branchForm.get('branchName').patchValue(BranchName)
              // this.branchForm.get('branchAddress').patchValue(BranchAddress)
            }
          } catch (error) {
            console.error('Error while fetching ToDo', error);
          }
           console.log(this.branchtype)
           if(this.StaffId[i]==this.routerData){
            
          this.branchTransferArr.push(
            {
              "BranchTranferId":this.BranchTranferId[i],
              "BranchTranfer": this.branchtype[i],
              "startDate": this.startDate[i].toLocaleString("en-IN").slice(0, 10),
              "endDate":this.endDate[i].toLocaleString("en-IN").slice(0, 10),
              "startTime":  this.startTime[i],
              "endTime": this.endTime[i],
              // "Email": this.Email[i],
              // "Phone": this.Phone[i],
              "Branch": this.branch[i],
              "Status":this.Status[i] ,
              "Address":this.BranchAddress[i],
              "StaffId":this.StaffId[i],
              "BranchName":this.BranchNamedata
            }
          )
           }
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
    editBranchTransfer(id){
      console.log(id)
       this.router.navigateByUrl(`/admin/branch-Transfer/${this.routerData}/edit/` + id   );

    }
    async deleteBranchTransfer(id,objectId){
      console.log(id)
      this.branchTransferArr.forEach((value, index) => {
        if (value == id) {
          this.branchTransferArr.splice(index, 1);
        }
      });
      const player = new Parse.Object("BranchTransfer");

      //set its objectId
      player.set('objectId',objectId);
      try{
          //destroy the object
          let result = await player.destroy();
          this.flashMessageService.successMessage("Branch Transfer Deleted Successfully", 2);
      }catch(error){
        this.flashMessageService.successMessage("Branch Transfer Deleted Successfully", 2);
      }
    }
}
