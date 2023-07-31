import { Injectable } from '@angular/core';
import { SettingDataService } from '../api/setting-data.service';

@Injectable({
    providedIn: 'root'
})

export class SettingService {
    // updateSettings(id: any, value: any) {
    //   throw new Error('Method not implemented.');
    // }
    // SaveSettings(data: any) {
    //   throw new Error('Method not implemented.');
    // }
    constructor(private SettingDataService:SettingDataService) { }

    //Get All setting
    public getAllSettings() {
        return this.SettingDataService.getAllSettings();
    }

   
     
    //Add New Staff
    public SaveSettings(data) {
        return this.SettingDataService.SaveSettings(data);
    }

 
    //Get Staff By Id
    public getSettingsById(id) {
        return this.SettingDataService.getSettingsById(id);
    }

    //update Setting
    public updateSetting(id,data) {
        console.log(data)
        return this.SettingDataService.updateSetting(id,data);
      }

}