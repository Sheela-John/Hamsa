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
  public showAddEdit: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, public SettingService: SettingService, private flashMessageService: FlashMessageService, private route: ActivatedRoute) {
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL;
  }

  ngOnInit(): void {
    this.initializeSettingsForm();
    this.getAllSettings();
  }

  //initializeSettingForm
  initializeSettingsForm() {
    this.settingForm = this.fb.group({
      averageDistance: ['', [Validators.required]],
    });
  }

  //Get all Settings
  async getAllSettings() {
    console.log("Inside Function");
    const settings = Parse.Object.extend('Settings');
    const query = new Parse.Query(settings);
    try {
      const settingsData = await query.find();
      console.log("dfvfdv:", settingsData);
      if (settingsData.length != 0) {
        this.settingsId = settingsData[0].id;
        this.getSettingsByIdBase4App(this.settingsId);
      }
    } catch (err) {
      alert(`Failed to retrieve the object, with error code: ${err.message}`);
    }
  }

  //Save Settings
  async SaveSettings() {
    this.isSettingFormSubmitted = true;
    if (this.settingForm.valid) {
      const Settings = new Parse.Object("Settings");
      Settings.set("averageDistance", this.settingForm.value.averageDistance)
      try {
        let result = await Settings.save()
        this.flashMessageService.successMessage("Settings Save Successfully", 2);
        this.settingsId = result.id;
        this.getSettingsByIdBase4App(this.settingsId);
      }
      catch (error) {
        this.flashMessageService.errorMessage("Error while  Save Settings", 2);
      }
    }
  }

  //Get Settings By Id
  async getSettingsByIdBase4App(id) {
    this.showAddEdit = true;
    const branch = Parse.Object.extend('Settings');
    const query = new Parse.Query(branch);
    query.equalTo('objectId', id);
    try {
      const results = await query.find();
      for (const settingValue of results) {
        this.settingForm.get('averageDistance').patchValue(settingValue.get('averageDistance'));
      }
    } catch (error) {
      console.error('Error while fetching ToDo', error);
    }
  }

  //Update Settings
  async updateSettings() {
    this.isSettingFormSubmitted = true;
    if (this.settingForm.valid) {
      const Settings = new Parse.Object("Settings");
      Settings.set('objectId', this.settingsId);
      Settings.set("averageDistance", this.settingForm.value.averageDistance)
      try {
        let result = await Settings.save()
        this.flashMessageService.successMessage("Settings Update Successfully", 2);
      } catch (error) {
        this.flashMessageService.errorMessage("Error while Updated Settings", 2);
      }
    }
  }
}