import { Injectable } from '@angular/core';
import { TransportExpenseDataService } from "../api/transportExpense-data.service";

@Injectable({
    providedIn: 'root'
})

export class TransportExpenseService {
    constructor(private TransportExpenseDataService: TransportExpenseDataService) { }

    //Add New Service
    public addtravelExpense(data) {
        return this.TransportExpenseDataService.addtravelExpense(data);
    }

     //Get All Services
     public getAlltravelExpense() {
        return this.TransportExpenseDataService.getAlltravelExpense();
    }

     //get Role by Id
     public gettravelExpensebyId(travelAllowanceId) {
        return this.TransportExpenseDataService.gettravelExpensebyId(travelAllowanceId);
    }

    
    //Update Role By Id 
    public updatetravelExpenseById(updatetravelExpenseDataId) {
        console.log(updatetravelExpenseDataId, "update From Travel Expense")
        return this.TransportExpenseDataService.updatetravelExpenseById(updatetravelExpenseDataId);
    }
}