import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreasRegisterComponent } from './areas-register.component';

describe('AreasRegisterComponent', () => {
  let component: AreasRegisterComponent;
  let fixture: ComponentFixture<AreasRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreasRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AreasRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
