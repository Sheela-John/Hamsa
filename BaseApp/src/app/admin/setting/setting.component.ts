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
    // this.getSettingsById(this.routerData)
    this.getAllSettings()
    // if (this.routerData != undefined) {
    //   this.getSettingsById(this.routerData);
    //   this.showAddEdit = true;
    // } else {
    //   this.showAddEdit = false;
    // }

    // this.getAllSettings();
    // this.getByStaffId(this.routerData);

  }

  //initializeSettingForm
  initializeSettingsForm() {
    this.settingForm = this.fb.group({
      averageDistance: ['', [Validators.required]],
    });
    // this.getSettingsById(id);
  }

  // //Get all Settings
  // async getAllSettings() {
  //   console.log("Inside Function");
  //   const settings = Parse.Object.extend('Settings');
  //   const query = new Parse.Query(settings);
  //   try {
  //     const settingsData = await query.find();
  //     console.log("dfvfdv:", settingsData);
  //     if (settingsData.length != 0) {
  //       this.settingsId = settingsData[0].id;
  //       this.getSettingsByIdBase4App(this.settingsId);
  //     }
  //   } catch (err) {
  //     alert(`Failed to retrieve the object, with error code: ${err.message}`);
  //   }
  // }

  //Save Settings

  // async SaveSettingsBase4App() {
  //   this.isSettingFormSubmitted = true;
  //   const setting = new Parse.Object("Setting");
  //   const user: Parse.User = new Parse.User();
  //   setting.set("averageDistance", this.settingForm.value.averageDistance)
  //    try {
  //     let userResult: Parse.User = await user.signUp();
  // if(userResult){
  //   let result = await setting.save()
  // }

  //     this.flashMessageService.successMessage("Setting Created Successfully", 2);
  //     this.router.navigateByUrl('admin/settings')
  //   } catch (error) {
  //     this.flashMessageService.errorMessage("Error while Creating Setting", 2);
  //   }
  // }


  //Save Settings
  SaveSettings() {
    this.isSettingFormSubmitted = false;
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

  // getAllSettings() {

  //   // console.log("id",id);
  //   this.SettingService.getAllSettings().subscribe(res => {
  //     if (res.status) {
  //       this.showAddEdit = true;
  //       this.settingsData = res.data;
        

  //     }
  //     console.log("this.staffData", this.settingsData)
  //   })
  // }


  // getSettingsById(id) {
  //   this.SettingService.getSettingsById(id).subscribe((res) => {
  //     console.log("response:", res.data);
  //     if (res.status) {
  //       this.settingForm.patchValue(res.data);
  //     }
  //   })
  // }



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