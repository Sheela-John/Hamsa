import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAssignServiceComponent } from './add-edit-assign-service.component';

describe('AddEditAssignServiceComponent', () => {
  let component: AddEditAssignServiceComponent;
  let fixture: ComponentFixture<AddEditAssignServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditAssignServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditAssignServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
