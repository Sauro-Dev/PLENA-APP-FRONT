import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisabledInterventionAreasModalComponent } from './disabled-intervention-areas-modal.component';

describe('DisabledInterventionAreasModalComponent', () => {
  let component: DisabledInterventionAreasModalComponent;
  let fixture: ComponentFixture<DisabledInterventionAreasModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisabledInterventionAreasModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisabledInterventionAreasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
