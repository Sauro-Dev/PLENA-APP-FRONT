import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlansService } from '../plans.service';
import { PatientsService } from '../patients.service';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-renew-plan',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './renew-plan.component.html',
  styleUrl: './renew-plan.component.css'
})
export class RenewPlanComponent implements OnInit {
  renewForm!: FormGroup;
  patient: any;
  plans: any[] = [];
  roomsMap = new Map<number, any[]>();
  therapistsMap = new Map<number, any[]>();
  selectedPlan: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private plansService: PlansService,
    private patientsService: PatientsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['patientId'];
    this.initializeForm();
    this.loadPatient(id);
    this.loadPlans();
  }

  initializeForm(): void {
    this.renewForm = this.fb.group({
      idPlan: [null, [Validators.required]],
      sessionDates: this.fb.array([])
    });
  }

  get sessionDates(): FormArray {
    return this.renewForm.get('sessionDates') as FormArray;
  }

  get hasSessionDates(): boolean {
    return this.sessionDates && this.sessionDates.length > 0;
  }

  loadPatient(id: number): void {
    this.patientsService.getPatientById(id).subscribe((data) => {
      this.patient = data;
    });
  }

  loadPlans(): void {
    this.plansService.getAllPlans().subscribe((data) => {
      this.plans = data.map((plan) => ({
        idPlan: plan.id,
        name: `Plan ${plan.numOfSessions}`,
        numOfSessions: plan.numOfSessions
      }));
    });
  }

  onChangePlan(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const planId = +target.value;
    this.selectedPlan = this.plans.find(plan => plan.idPlan === planId);

    if (this.selectedPlan) {
      this.resetSessionDates();
      for (let i = 0; i < this.selectedPlan.numOfSessions; i++) {
        this.sessionDates.push(this.createSessionForm());
      }
    }
  }

  createSessionForm(): FormGroup {
    return this.fb.group({
      sessionDate: ['', Validators.required],
      startTime: ['', Validators.required],
      room: [null, Validators.required],
      therapist: [null, Validators.required]
    });
  }

  onSessionChange(index: number): void {
    const session = this.sessionDates.at(index);
    const sessionDate = session.get('sessionDate')?.value;
    const startTime = session.get('startTime')?.value;

    if (sessionDate && startTime) {
      this.patientsService.getAvailableRooms(sessionDate, startTime, '10:00').subscribe((rooms) => {
        this.roomsMap.set(index, rooms);
      });

      this.patientsService.getAvailableTherapists(sessionDate, startTime, '10:00').subscribe((therapists) => {
        this.therapistsMap.set(index, therapists);
      });
    }
  }

  resetSessionDates(): void {
    while (this.sessionDates.length !== 0) {
      this.sessionDates.removeAt(0);
    }
  }

  onCancel(): void {
    this.router.navigate(['/patients']);
  }

  onSubmit(): void {
    if (this.renewForm.valid) {
      const data = this.renewForm.value;
      this.patientsService.renewPlan({
        patientId: this.patient.idPatient,
        ...data
      }).subscribe(() => {
        alert('Plan renovado con éxito');
        this.router.navigate(['/patients']);
      });
    }
  }
}
