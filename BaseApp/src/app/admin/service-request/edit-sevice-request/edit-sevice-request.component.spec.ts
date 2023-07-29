import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSeviceRequestComponent } from './edit-sevice-request.component';

describe('EditSeviceRequestComponent', () => {
  let component: EditSeviceRequestComponent;
  let fixture: ComponentFixture<EditSeviceRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSeviceRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSeviceRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
