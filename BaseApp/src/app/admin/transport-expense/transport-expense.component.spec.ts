import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportExpenseComponent } from './transport-expense.component';

describe('TransportExpenseComponent', () => {
  let component: TransportExpenseComponent;
  let fixture: ComponentFixture<TransportExpenseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransportExpenseComponent]
    });
    fixture = TestBed.createComponent(TransportExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
