import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ServiceService } from 'src/app/services/service.service';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})

export class ServiceComponent implements OnInit {
  public serviceList: any;
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public serviceDataArr: any = []
  public durationArr: any = []
  public objectid: any = [];
  public ServiceName: any = [];
  public Duration: any = [];
  public ServiceStaus: any = [];
  public ServiceStatus: any;
  constructor(private router: Router, public serviceService: ServiceService, public flashMessageService: FlashMessageService) {
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
    this.getAllServices();
    
  }

  //Navigation for Add Service Form
  addService() {
    this.router.navigateByUrl('admin/addEditService');
  }

  //Get All Services
  getAllServices() {
    this.serviceService.getAllServices().subscribe(res => {
      if (res.status) {
        this.serviceList = res.data
        this.dtTrigger.next(null);
      }
    })
  }
 
  //Navigation for Edit Service Form
  editService(id) {
    this.router.navigateByUrl('admin/addEditService/' + id);
  }
  // Enable or Disable Service         // 0 - enable, 2 - disable (status)
  enableDisableService(id) {      
    var staffId = id;
    this.serviceService.enableDisableService(staffId).subscribe(res => {
      if (res.status) {
        if (res.data.status == 0) {
          this.flashMessageService.successMessage("Service Enabled Successfully", 2);
          this.getAllServices();
        }
        if (res.data.status == 2) {
          this.flashMessageService.errorMessage("Service Disabled Successfully", 2);
          this.getAllServices();
        }
      }
      else{
        this.flashMessageService.errorMessage("Error while Creating Service", 2);
      }
    })
  }

}