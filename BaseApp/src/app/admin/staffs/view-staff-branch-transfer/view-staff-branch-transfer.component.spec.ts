import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStaffBranchTransferComponent } from './view-staff-branch-transfer.component';

describe('ViewStaffBranchTransferComponent', () => {
  let component: ViewStaffBranchTransferComponent;
  let fixture: ComponentFixture<ViewStaffBranchTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewStaffBranchTransferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStaffBranchTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
