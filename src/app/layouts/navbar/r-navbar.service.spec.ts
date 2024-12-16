import { TestBed } from '@angular/core/testing';

import { RNavbarService } from './r-navbar.service';

describe('RNavbarService', () => {
  let service: RNavbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RNavbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
