import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTransportExpenseComponent } from './add-edit-transport-expense.component';

describe('AddEditTransportExpenseComponent', () => {
  let component: AddEditTransportExpenseComponent;
  let fixture: ComponentFixture<AddEditTransportExpenseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditTransportExpenseComponent]
    });
    fixture = TestBed.createComponent(AddEditTransportExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
