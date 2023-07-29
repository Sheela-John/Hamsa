import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchTranferDataComponent } from './branch-tranfer-data.component';

describe('BranchTranferDataComponent', () => {
  let component: BranchTranferDataComponent;
  let fixture: ComponentFixture<BranchTranferDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchTranferDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchTranferDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
