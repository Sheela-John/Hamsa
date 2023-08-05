import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SettingService } from 'src/app/services/setting.service';
import { FlashMessageService } from "../../shared/flash-message/flash-message.service";
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})

export class SettingComponent implements OnInit {
  public settingForm: any;
  public isSettingFormSubmitted: Boolean = false;
  public destroy$ = new Subject();
  public settingsId: any;
  public routerData: any;
  public settingsData: any

  public showAddEdit: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, public SettingService: SettingService, private flashMessageService: FlashMessageService, private route: ActivatedRoute) {
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL;
  }

  ngOnInit(): void {
    this.initializeSettingsForm();
    this.getAllSettings()
  }

  //initializeSettingForm
  initializeSettingsForm() {
    this.settingForm = this.fb.group({
      averageDistance: ['', [Validators.required]],
    });
  }

  //Save Settings
  SaveSettings() {
    console.log("i am in")
    this.isSettingFormSubmitted = true;
    if (this.settingForm.valid) {
      var data = this.settingForm.value;
      console.log("data", data)

      this.SettingService.SaveSettings(data).subscribe((res) => {
        if (res.status) {
          this.flashMessageService.successMessage("Settings Created Successfully");
          this.router.navigateByUrl("admin/settings");
        }
        else {
          this.flashMessageService.errorMessage("Settings  Failed");
        }
      })
    }
  }

  getAllSettings() {
    this.SettingService.getAllSettings().subscribe(res => {
      if (res.status) {
        this.showAddEdit = true;
        console.log(res.data)
        this.settingsData = res.data;
        this.settingsId = this.settingsData[0]._id;
        this.settingForm.patchValue({
          averageDistance: this.settingsData[0].averageDistance,

        })
        console.log("this.Settings", this.settingsData)
      }
    })
  }


  // Update Service
  updateSettings() {
    this.isSettingFormSubmitted = true;
    console.log(this.settingsId, "ddd")
    if (this.settingForm.valid) {
      this.SettingService.updateSetting(this.settingsId, this.settingForm.value).subscribe((res) => {
        if (res.status) {
          this.flashMessageService.successMessage("Service Updated Successfully", 2);
          this.router.navigateByUrl('admin/settings')
        }
        else {
          this.flashMessageService.errorMessage("Error while Updating Service", 2);
        }
      })
    }
  }


}