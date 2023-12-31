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
  public addressLongitude: string = ''


  constructor(private fb: FormBuilder, private router: Router, public BranchService: BranchService, private flashMessageService: FlashMessageService, private route: ActivatedRoute,) {
    this.route.params.subscribe((param) => {
      this.routerData = param['id'];
    })
  }

  ngOnInit(): void {
    this.initializebranchForm();
    if (this.routerData != undefined) {
      this.getBranchbyId(this.routerData);
      //this.getBranchByIdBase4App(this.routerData)
      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;
    }
  }

  //initializeBranchForm
  initializebranchForm() {
    this.branchForm = this.fb.group({
      branchName: ['', Validators.required],
      branchAddress: ['', Validators.required],
      latitude: [''],
      longitude: [''],
    });
  }

  //Ngx-google Autocomplete --NPM
  options: any = {
    componentRestrictions: { country: ['IND'] }
  }

  handleAddressChange(address: any) {
    this.branchForm.controls['branchAddress'].setValue(address.formatted_address);
    this.branchForm.controls['latitude'].setValue(address.geometry.location.lat())
    this.branchForm.controls['longitude'].setValue(address.geometry.location.lng())
  }

  //-----------------------------------BRANCH API INTEGRATION - START -------------------------------------------//

  //save Branch
  saveBranch() {
    this.isbranchFormSubmitted = true;
    if (this.branchForm.valid) {
      this.BranchService.createBranch(this.branchForm.value).subscribe((res) => {
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
    if (this.branchForm.valid) {
      this.BranchService.updateBranchById(this.branchForm.value).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
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
}