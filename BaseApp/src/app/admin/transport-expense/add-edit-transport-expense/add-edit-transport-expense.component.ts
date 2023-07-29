import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import * as Parse from 'parse';

@Component({
  selector: 'app-add-edit-transport-expense',
  templateUrl: './add-edit-transport-expense.component.html',
  styleUrls: ['./add-edit-transport-expense.component.scss']
})

export class AddEditTransportExpenseComponent {
  public travelExpenseId: any;
  public showAddEdit: boolean = false;
  public travelExpenseForm: any;
  public isTravelExpenseFormSubmitted: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute,
    private flashMessageService: FlashMessageService) {
    Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY,);
    (Parse as any).serverURL = environment.PARSE_SERVER_URL
    this.route.params.subscribe((param) => {
      this.travelExpenseId = param['id'];
    })
  }

  ngOnInit(): void {
    this.initializeTravelExpenseForm()
    if (this.travelExpenseId != undefined) {
      this.getTravelExpenseById(this.travelExpenseId);
      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;
    }
  }

  //initialize Travel Expense Form
  initializeTravelExpenseForm() {
    this.travelExpenseForm = this.fb.group({
      travelExpenseMode: ['', [Validators.required]],
      travelExpenseCost: ['', [Validators.required]]
    });
  }

  //Save Travel Expense Form
  async saveTravelExpense() {
    this.isTravelExpenseFormSubmitted = true;
    if (this.travelExpenseForm.valid) {
      const TravelExpense = new Parse.Object("TravelExpense");
      TravelExpense.set("travelExpenseCost", this.travelExpenseForm.value.travelExpenseCost);
      TravelExpense.set("travelExpenseMode", this.travelExpenseForm.value.travelExpenseMode);
      try {
        let result = await TravelExpense.save()
        this.flashMessageService.successMessage("Travel Expense Save Successfully", 2);
        this.router.navigateByUrl('admin/transport-expense');
      }
      catch (error) {
        this.flashMessageService.errorMessage("Error while Saving Travel Expense", 2);
      }
    }
  }

  // Get Travel Expense By Id
  async getTravelExpenseById(id) {
    const travelExpense = Parse.Object.extend('TravelExpense');
    const query = new Parse.Query(travelExpense);
    query.equalTo('objectId', id);
    try {
      const results = await query.find();
      for (const getTravelExpense of results) {
        this.travelExpenseForm.controls['travelExpenseCost'].patchValue(getTravelExpense.get('travelExpenseCost'));
        this.travelExpenseForm.controls['travelExpenseMode'].patchValue(getTravelExpense.get('travelExpenseMode'))
      }
    } catch (error) {
      console.error('Error while fetching ToDo', error);
    }
  }

  //Update Travel Expense
  async updateTravelExpense() {
    this.isTravelExpenseFormSubmitted = true;
    if (this.travelExpenseForm.valid) {
      const TravelExpense = new Parse.Object("TravelExpense");
      TravelExpense.set('objectId', this.travelExpenseId);
      TravelExpense.set("travelExpenseCost", this.travelExpenseForm.value.travelExpenseCost);
      TravelExpense.set("travelExpenseMode", this.travelExpenseForm.value.travelExpenseMode);
      try {
        let result = await TravelExpense.save()
        this.flashMessageService.successMessage("Travel Expense Updates Successfully", 2);
        this.router.navigateByUrl('admin/transport-expense');
      } catch (error) {
        this.flashMessageService.errorMessage("Error while Updated Travel Expense", 2);
      }
    }
  }

  //Back
  back() {
    this.router.navigateByUrl('admin/transport-expense');
  }
}