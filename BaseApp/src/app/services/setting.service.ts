import { Injectable } from '@angular/core';
import { SettingDataService } from '../api/setting-data.service';

@Injectable({
    providedIn: 'root'
})

export class SettingService {
    constructor(private SettingDataService:SettingDataService) { }

    //Get All setting
    public getAllSetting() {
        return this.SettingDataService.getAllSetting();
    }

    //update Setting
    public updateSetting(data) {
        console.log(data)
        return this.SettingDataService.updateSetting(data);
      }
}