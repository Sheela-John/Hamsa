

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { TransportExpenseService } from 'src/app/services/transportExpense.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-transport-expense',
  templateUrl: './transport-expense.component.html',
  styleUrls: ['./transport-expense.component.scss']
})

export class TransportExpenseComponent {
  public travelList: any;
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public travelExpenseArr: any = [];

  constructor(private router: Router, public TransportExpenseService: TransportExpenseService, public flashMessageService: FlashMessageService) {
  }

  ngOnInit(): void {
    console.log(this.travelExpenseArr)
    this.dtOptions = {
      pagingType: 'simple_numbers',
      searching: true,
      lengthChange: true,
      retrieve: true,
      ordering: false
    }
    // this.getAllTransportExpense();

    this.getAlltravelExpense()
  }

  //Add Transport Expense
  addTransportExpense() {
    this.router.navigateByUrl('admin/add-transport-expense');
  }

  //Edit Button-Route
  editTransportExpense(id) {
    this.router.navigateByUrl('admin/edit-transport-expense/' + id);
  }

  //Get All TravelExpense
  getAlltravelExpense() {
    this.TransportExpenseService.getAlltravelExpense().subscribe(res => {
      if (res.status) {
        this.travelExpenseArr = res.data;
        console.log(this.travelExpenseArr, "this.travelExpenseArr ")
      }
    })
  }
  getCostTypeString(costType: number): string {
    return costType === 0 ? 'Per Km' : 'By Distance';
  }

}