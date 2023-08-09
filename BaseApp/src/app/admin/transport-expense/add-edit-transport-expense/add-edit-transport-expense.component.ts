import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlashMessageService } from 'src/app/shared/flash-message/flash-message.service';
import { environment } from 'src/environments/environment';
import { Subject, takeUntil } from 'rxjs';
import { TransportExpenseService } from 'src/app/services/transportExpense.service';
import * as Parse from 'parse';
import { event } from 'jquery';

@Component({
  selector: 'app-add-edit-transport-expense',
  templateUrl: './add-edit-transport-expense.component.html',
  styleUrls: ['./add-edit-transport-expense.component.scss']
})

export class AddEditTransportExpenseComponent {

  selectedCostType: string;
  perKmCost: number;
  distanceCosts: any[] = [];
  travelExpenseForm: FormGroup;
  public i: number;
  public travelExpenseId: any;
  public showAddEdit: boolean = false;
  public isFormSubmitted: Boolean = false;
  public destroy$ = new Subject();
  public travelExpenseDatavalue: any;
  public showError = false;
  public costArr: FormArray;
  public isTravelExpenseFormSubmitted: boolean = false;
  public hideAddCost: boolean = false;
  public hideAddCostHeader: boolean = false;
  public Travels: any;
  public newPerKmCost: any;
  public isShowCost: boolean = false
  public showdelete: boolean = false;



  constructor(private fb: FormBuilder, private router: Router, public TransportExpenseService: TransportExpenseService, private route: ActivatedRoute,
    private flashMessageService: FlashMessageService) {
    this.route.params.subscribe((param) => {
      this.travelExpenseId = param['id'];
    })
  }

  ngOnInit(): void {
    this.isFormSubmitted = false;
    this.initializeTravelExpenseForm()
    this.gettravelExpensebyId(this.routerData)
    if (this.travelExpenseId != undefined) {
      this.gettravelExpensebyId(this.travelExpenseId);
      this.showAddEdit = true;
    } else {
      this.showAddEdit = false;
    }
  }
  routerData(routerData: any) {
    throw new Error('Method not implemented.');
  }

  //InitializeTravelExpenseForm
  initializeTravelExpenseForm() {
    this.travelExpenseForm = this.fb.group({
      travelExpenseMode: ['', [Validators.required]],
      costType: ['', [Validators.required]],
      addCost: this.fb.array([]),
      newPerKmCost: [''],
    });
    this.costArr = this.travelExpenseForm.get('addCost') as FormArray;
    if (this.costArr.length == 0) {

      this.showdelete = true
    }
    console.log(this.costArr.length)
  }

  //InitializeAddCostForm
  initializeAddCostForm() {
    return this.fb.group({
      from: ['', [Validators.required]],
      to: ['', [Validators.required]],
      cost: ['', [Validators.required]]
    });
  }

  changeCostType(eve) {
    console.log("value", eve, typeof (eve.target.value));
    this.costArr.clear();
    if (eve.target.value == 1) {
      this.costArr.push(this.initializeAddCostForm());

      this.hideAddCost = true;
      this.hideAddCostHeader = true;
    }
    else {
      this.hideAddCost = true;
      this.hideAddCostHeader = false;
    }

  }
    clearValidator(control, form) {
    form.get(control).clearValidators();
    form.get(control).updateValueAndValidity();
  }

  /* Set Validator */
  setValidator(control, form) {
    form.get(control).setValidators([Validators.required]);
    form.get(control).updateValueAndValidity();
  }



  //saveTravelExpense
  addtravelExpense() {
    this.isTravelExpenseFormSubmitted = true;
    var data = this.travelExpenseForm.value;
    
    
    if (data.costType == 0) {
      // if (data.newPerKmCost == 0) {
      this.isShowCost = true;
      this.travelExpenseForm.controls['newPerKmCost'].setValidators([Validators.required]);
      this.travelExpenseForm.controls['newPerKmCost'].updateValueAndValidity();

    } else {
      this.isShowCost = false;
      this.travelExpenseForm.controls['newPerKmCost'].clearValidators();
      this.travelExpenseForm.controls['newPerKmCost'].updateValueAndValidity();

    }
 

    var arr = [];
    for (var i = 0; i < data.addCost.length; i++) {
      var temp = {
        "from": data.addCost[i].from,
        "to": data.addCost[i].to,
        "cost": data.addCost[i].cost
      }
      arr.push(temp)
    }
    var data1 = {
      "costType": data.costType,
      "travelExpenseMode": data.travelExpenseMode,
      "newPerKmCost": data.newPerKmCost,
      "distance": arr,

    }
    console.log(data1,)
    if (this.travelExpenseForm.valid) {
      this.TransportExpenseService.addtravelExpense(data1).subscribe((res) => {
        if (res.status) {
          this.flashMessageService.successMessage("Transport Expense Saved Successfully", 2);
          this.router.navigateByUrl('admin/transport-expense')
        }
        else {
          this.flashMessageService.errorMessage("Error while Creating Travel Expense", 2);
        }
      })
    }
  }

  
  // Get TravelExpenseById
  gettravelExpensebyId(id) {
    this.TransportExpenseService.gettravelExpensebyId(id).pipe(takeUntil(this.destroy$)).subscribe(res => {
      if (res.status) {
        this.travelExpenseDatavalue = res.data;
        console.log("this.travelExpenseDatavalue", this.travelExpenseDatavalue);
        this.travelExpenseForm.controls['travelExpenseMode'].setValue(this.travelExpenseDatavalue.travelExpenseMode);
        this.travelExpenseForm.controls['newPerKmCost'].setValue(this.travelExpenseDatavalue.newPerKmCost);

        this.travelExpenseForm.controls['costType'].setValue(this.travelExpenseDatavalue.costType.toString());
        this.costArr.clear();

        for (let distance of this.travelExpenseDatavalue.distance) {
          const addCostFormGroup = this.initializeAddCostForm();
          addCostFormGroup.patchValue(distance);
          this.costArr.push(addCostFormGroup);
          console.log(this.costArr.length,)
          if (this.costArr.length != 1) {
            this.showdelete = false
          }
        }
        if (this.travelExpenseForm.controls['costType'].value === '1') {
          this.hideAddCost = true;
          this.hideAddCostHeader = true;
        } else {
          this.hideAddCost = false;
          this.hideAddCostHeader = false;
        }
      }
    });
  }

  
  //Update Travel Expense By Id
  updatetravelExpenseById() {
    this.isTravelExpenseFormSubmitted = true;
    this.showError = false;
    this.travelExpenseForm.value._id = this.travelExpenseId;
    console.log("this.travelExpenseForm.value._id", this.travelExpenseForm.value._id)
    var data = {
      _id: this.travelExpenseId,
      travelExpenseMode: this.travelExpenseForm.controls['travelExpenseMode'].value,
      newPerKmCost: this.travelExpenseForm.controls['newPerKmCost'].value,

      costType: this.travelExpenseForm.controls['costType'].value,
      distance: this.travelExpenseForm.controls['addCost'].value,
    }
    console.log("Travel Expense", data)
    if (this.travelExpenseForm.valid) {
      this.TransportExpenseService.updatetravelExpenseById(data).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (res.status) {
          this.flashMessageService.successMessage('Transport Expense Updated Sucessfully', 2);
          this.router.navigateByUrl("admin/transport-expense");
        }
        else this.flashMessageService.errorMessage(res.err.message, 2);
      },
        error => {
          this.flashMessageService.errorMessage('Transport Expense Updation failed!', 2);
        })
    }
  }

  //Remove Slot
  RemoveSlot(i) {
    const control = <FormArray>this.travelExpenseForm.controls['addCost'];
    control.removeAt(i);
    console.log(control.length, "rrr")
    if (control.length == 1) {
      this.showdelete = true
    }
  }


  //addCost
  addCost() {
    this.costArr.push(this.initializeAddCostForm());
    console.log(this.costArr.length, "hhhh")
    this.showdelete = false;
  }




  //Back
  back() {
    this.router.navigateByUrl('admin/transport-expense');
  }
}





