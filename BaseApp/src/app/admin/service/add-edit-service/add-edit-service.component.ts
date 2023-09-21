import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from 'src/app/services/service.service';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
@Component({
  selector: 'app-add-edit-service',
  templateUrl: './add-edit-service.component.html',
  styleUrls: ['./add-edit-service.component.scss']
})
export class AddEditServiceComponent implements OnInit {
  public serviceForm: any;
  public isServiceFormSubmitted: boolean = false;
  public routerData: any;
  public showAddEdit: boolean = false;

  constructor(private router: Router, private fb: FormBuilder, public serviceService: ServiceService,
    public flashMessageService: FlashMessageService, private route: ActivatedRoute,) {
    this.route.params.subscribe((param) => {
      this.routerData = param['id'];
      console.log(param, this.routerData)
    })
  }

  ngOnInit(): void {
    this.initializeServiceForm();
    if (this.routerData != undefined) {
      this.getServiceById(this.routerData);
      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;
    }

  }

  //Initialize Staff Form
  initializeServiceForm() {
    this.serviceForm = this.fb.group({
      serviceName: ['', Validators.required],
      duration: ['', Validators.required],
    })
  }

  //Navigation for Back Button
  back() {
    this.router.navigateByUrl('admin/service')
  }

  //Add New Service
  addService() {
    this.isServiceFormSubmitted = true;
    console.log(this.serviceForm.value);
    var data = this.serviceForm.value;

    if (this.serviceForm.valid) {
      this.serviceService.addService(data).subscribe((res) => {
        if (res.status) {
          this.flashMessageService.successMessage("Service Created Successfully", 2);
          this.router.navigateByUrl('admin/service')
        }
        else {
          this.flashMessageService.errorMessage("Error while Creating Service", 2);
        }
      })
    }
  }

  //Get Service By Id
  getServiceById(id) {
    this.serviceService.getServiceById(id).subscribe((res) => {
      console.log("response:", res.data);
      if (res.status) {
        this.serviceForm.patchValue(res.data);
      }
    })
  }

  //Update Service
  updateService() {
    var id = this.routerData;
    this.isServiceFormSubmitted = true;
    if (this.serviceForm.valid) {
      this.serviceService.updateService(id, this.serviceForm.value).subscribe((res) => {
        if (res.status) {
          this.flashMessageService.successMessage("Service Updated Successfully", 2);
          this.router.navigateByUrl('admin/service')
        }
        else {
          this.flashMessageService.errorMessage("Error while Updating Service", 2);
        }
      })
    }
  }
  //*********************************************** Base4App API Intergration********************************************************************************** */




}