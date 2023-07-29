import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Subject, takeUntil } from 'rxjs';
import { BranchService } from 'src/app/services/branch.service';
import { FlashMessageService } from "../../../shared/flash-message/flash-message.service";
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
@Component({
  selector: 'app-add-edit-branch',
  templateUrl: './add-edit-branch.component.html',
  styleUrls: ['./add-edit-branch.component.scss']
})
export class AddEditBranchComponent implements OnInit {
  public branchForm: any;
  public isbranchFormSubmitted: boolean = false;
  public formattedAddress: any;
  @ViewChild("placesRef") placesRef: GooglePlaceDirective;
  public routerData: any;
  public showAddEdit: boolean = false;
  public destroy$ = new Subject();
  public BranchDatavalue: any;
  public showError: boolean;
  public BranchStatus: any;
  public addressLatitude: string = ''
  public  addressLongitude: string = ''


  constructor(private fb: FormBuilder, private router: Router, public BranchService: BranchService, private flashMessageService: FlashMessageService, private route: ActivatedRoute,) {
    this.route.params.subscribe((param) => {
      this.routerData = param['id'];
    })
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
  }

  ngOnInit(): void {
    this.initializebranchForm();
    if (this.routerData != undefined) {
      // this.getBranchbyId(this.routerData);
      this.getBranchByIdBase4App(this.routerData)
      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;
    }
  }

  //initializeBranchForm
  initializebranchForm() {
    this.branchForm = this.fb.group({
      branchName: ['',Validators.required],
      branchAddress: ['', Validators.required],
    });
  }

  //Ngx-google Autocomplete --NPM
  options: any = {
    componentRestrictions: { country: ['IND'] }
  }

  handleAddressChange(address: any) {
    console.log("Address Changed", address);
    this.formattedAddress = address.address_components
    this.addressLatitude = address.geometry.location.lat()
    this.addressLongitude = address.geometry.location.lng()
    console.log( this.addressLatitude, this.addressLongitude,"lat")
    this.branchForm.controls['branchAddress'].setValue(address.formatted_address)
  }

  //-----------------------------------BRANCH API INTEGRATION - START -------------------------------------------//

  //save Branch
  saveBranch() {
    this.isbranchFormSubmitted = true;
    console.log(this.branchForm.value, "value")
    if (this.branchForm.valid) {
      var data = {
        branchName: this.branchForm.value.branchName,
        branchAddress: this.branchForm.value.branchAddress,
      }
      console.log("data", data)
      this.BranchService.createBranch(data).subscribe((res) => {
        if (res.status) {
          this.flashMessageService.successMessage("Branch Created Successfully", 1);
          this.router.navigateByUrl("admin/branch");
        }
        else {
          this.flashMessageService.errorMessage("Branch Created failed!", 2);
        }
      })
    }
  }

  //get Branch by Id
  getBranchbyId(id) {
    this.BranchService.getBranchbyId(id).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.status) {
        this.BranchDatavalue = res.data
        this.branchForm.controls['branchName'].patchValue(this.BranchDatavalue.branchName);
        this.branchForm.controls['branchAddress'].patchValue(this.BranchDatavalue.branchAddress);
      }
    })
  }

  //Update Branch
  updateBranch() {
    this.isbranchFormSubmitted = true;
    this.showError = false;
    this.branchForm.value._id = this.routerData;
    var data = {
      _id: this.routerData,
      branchName: this.branchForm.controls.branchName.value,
      branchAddress: this.branchForm.controls.branchAddress.value,
    }
    if (this.branchForm.valid) {
      this.BranchService.updateBranchById(data).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res.status) {      
         this.flashMessageService.successMessage('Branch Updated Sucessfully', 2);
          this.router.navigateByUrl("admin/branch");
        }
        else this.flashMessageService.errorMessage('Branch Updation sucessfully', 2);
      },
        error => {
          this.flashMessageService.errorMessage('Branch Updation failed!', 2);
        })
    }
  }

  //-----------------------------------BRANCH API INTEGRATION - END -------------------------------------------//

  //back -Route
  addeditForm() {
    this.router.navigateByUrl('admin/branch')
  }
   //----------------------------------- Back4App BRANCH API INTEGRATION - START -------------------------------------------//
   // Back4App save Branch
  async saveBranchBase4App() {
    this.isbranchFormSubmitted = true;
    const branch = new Parse.Object("Branch");
     

    branch.set("BranchName", this.branchForm.value.branchName)
    branch.set("BranchAddress", this.branchForm.value.branchAddress);
    branch.set("BranchStatus", 0);
    branch.set("Latitude", this.addressLatitude)
    branch.set("Longitude",   this.addressLongitude)
    try {
      let result = await branch.save()

      this.flashMessageService.successMessage("Branch Created Successfully", 2);
      this.router.navigateByUrl('admin/branch')
    } catch (error) {
      // this.flashMessageService.errorMessage("Error while Creating Branch", 2);
    }
  }
  //Get Branch By Id Base4App
 async getBranchByIdBase4App(id){
    const branch = Parse.Object.extend('Branch');
    const query = new Parse.Query(branch);
  
    query.equalTo('objectId', id);
    console.log(id)
    try {
      const results = await query.find();
     
      for (const branch of results) {
        // Access the Parse Object attributes using the .GET method
        const BranchName= branch.get('BranchName')
        const BranchAddress = branch.get('BranchAddress')
        this.branchForm.get('branchName').patchValue(BranchName)
        this.branchForm.get('branchAddress').patchValue(BranchAddress)
      }
    } catch (error) {
      console.error('Error while fetching ToDo', error);
    }
  }
   //update base4App branch
   async updateBranchInBase4App() {
    this.isbranchFormSubmitted = true;
    if(this.branchForm.valid ){
    const branch = new Parse.Object("Branch");
    branch.set('objectId', this.routerData);
    branch.set("BranchName", this.branchForm.value.branchName)
    branch.set("BranchAddress", this.branchForm.value.branchAddress);
    branch.set("Latitude", this.addressLatitude)
    branch.set("Longitude",   this.addressLongitude)
    try {
      let result = await branch.save();
      this.flashMessageService.successMessage("Branch Updated Successfully", 2);
      this.router.navigateByUrl('admin/branch')
    } catch (error) {
      this.flashMessageService.errorMessage("Error while Updating Branch", 2);
    }
  }
  }
 
   //----------------------------------- Back4App BRANCH API INTEGRATION - END -------------------------------------------//
}