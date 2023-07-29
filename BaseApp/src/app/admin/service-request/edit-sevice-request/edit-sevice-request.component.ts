import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { StaffService } from 'src/app/services/staff.service';
import { ServiceService } from 'src/app/services/service.service';

@Component({
  selector: 'app-edit-sevice-request',
  templateUrl: './edit-sevice-request.component.html',
  styleUrls: ['./edit-sevice-request.component.scss']
})

export class EditSeviceRequestComponent implements OnInit {
  public serviceRequestForm: any;
  public isserviceRequestFormSubmitted: boolean = false
  public staffData: any;
  public staffList: any = [];
  public serviceData: any;
  public serviceList: any =[];

  constructor(private fb: FormBuilder, private router: Router, private flashMessageService: FlashMessageService, private route: ActivatedRoute, public StaffService: StaffService, public ServiceService: ServiceService, ) { }

  ngOnInit(): void {
    this.initializeServiceRequestForm();
    this.getAllStaffs();
    this.getAllServices();
  }

  //initializeServiceRequestForm
  initializeServiceRequestForm() {
    this.serviceRequestForm = this.fb.group({
      patientName:[{value: '',disabled: true},[Validators.required]],
      date: [{value: '',disabled: true}, [Validators.required]],
      service:[{value: '',disabled: true},[Validators.required]],
      referenceBy: [{value: '',disabled: true}, [Validators.required]],
      status:['',[Validators.required]],
    });
  }

  //getAll Staffs
  getAllStaffs() {
    this.StaffService.getAllStaffs().subscribe(res => {
      if (res.status) {
        this.staffData = res.data;
        this.staffData.forEach(staffValue => {
          if (staffValue.status == 0) {
            this.staffList.push(staffValue);
          }
        });
      }
    })
  }

  //getAll Services
  getAllServices() {
    this.ServiceService.getAllServices().subscribe(res => {
      if (res.status) {
        this.serviceData = res.data;
        this.serviceData.forEach(serviceValue => {
          if(serviceValue.status == 0) {
            this.serviceList.push(serviceValue);
          }
        });
      }
    })
  }

  updateServiceRequest(){

  }

  backServiceRequest(){
    this.router.navigateByUrl('admin/service-request')
  }
}