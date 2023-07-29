import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-transport-expense',
  templateUrl: './transport-expense.component.html',
  styleUrls: ['./transport-expense.component.scss']
})

export class TransportExpenseComponent {
  public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public travelExpenseArr: any = [];

  constructor(private router: Router, public flashMessageService: FlashMessageService) {
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
    this.getAllTransportExpense();
  }

  //Add Transport Expense
  addTransportExpense() {
    this.router.navigateByUrl('admin/add-transport-expense');
  }

  //Edit Button-Route
  editTransportExpense(id) {
    this.router.navigateByUrl('admin/edit-transport-expense/' + id);
  }

  //Get All Transport Expense
  async getAllTransportExpense() {
    const travelExpense = Parse.Object.extend('TravelExpense');
    const query = new Parse.Query(travelExpense);
    try {
      const travelExpenseData = await query.find()
      for (const travelExpense of travelExpenseData) {
        this.travelExpenseArr.push({
          id: travelExpense.id,
          travelExpenseMode: travelExpense.get("travelExpenseMode"),
          travelExpenseCost: travelExpense.get("travelExpenseCost")
        })
      }
      this.dtTrigger.next(null);
    }
    catch (error) {
      alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }
  }
}