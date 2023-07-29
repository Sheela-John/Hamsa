import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchTransferComponent } from './branch-transfer.component';

describe('BranchTransferComponent', () => {
  let component: BranchTransferComponent;
  let fixture: ComponentFixture<BranchTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BranchTransferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
