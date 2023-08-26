import { Injectable } from '@angular/core';
import { ReportDataService } from "../api/report-data.service";

@Injectable({
    providedIn: 'root'
})

export class ReportService {
    constructor(private reportDataService: ReportDataService) { }

    //Get Activity Report Data
    public getActivity(data) {
        return this.reportDataService.getActivity(data);
    }

    //Get Therapist Report Data
    public getTherapistReport(data) {
        return this.reportDataService.getTherapistReport(data);
    }
    //Get travelexpense Report Data
    public  getTravelExpenseReport(data) {
        return this.reportDataService. getTravelExpenseReport(data);
    }
    //Get getAttendenace Hours
    public  getAttendenace(data) {
        return this.reportDataService. getAttendenace(data);
    }
    // //TravelExpense Report
    // public  getTravelExpense(data) {
    //     return this.reportDataService. getTravelExpense(data);
    // }
     //Theraphist Report
     public  getTheraphist(data) {
        return this.reportDataService. getTheraphist(data);
    }
    //Activity Report
}