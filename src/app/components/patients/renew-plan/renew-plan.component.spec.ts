import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewPlanComponent } from './renew-plan.component';

describe('RenewPlanComponent', () => {
  let component: RenewPlanComponent;
  let fixture: ComponentFixture<RenewPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenewPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RenewPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
