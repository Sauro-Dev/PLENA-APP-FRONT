import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialRegisterComponent } from './material-register.component';

describe('MaterialRegisterComponent', () => {
  let component: MaterialRegisterComponent;
  let fixture: ComponentFixture<MaterialRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaterialRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
