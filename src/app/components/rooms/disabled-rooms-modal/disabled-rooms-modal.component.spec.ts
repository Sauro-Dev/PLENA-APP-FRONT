import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisabledRoomsModalComponent } from './disabled-rooms-modal.component';

describe('DisabledRoomsModalComponent', () => {
  let component: DisabledRoomsModalComponent;
  let fixture: ComponentFixture<DisabledRoomsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisabledRoomsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisabledRoomsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
