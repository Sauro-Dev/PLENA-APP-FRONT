import { TestBed } from '@angular/core/testing';
import {MedicalHistoryService} from "./medicalhistory.service";


describe('MedicalHistoryService', () => {
  let service: MedicalHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicalHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
