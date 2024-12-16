import { TestBed } from '@angular/core/testing';

import { AreasRegisterService } from './areas-register.service';

describe('AreasRegisterService', () => {
  let service: AreasRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AreasRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
