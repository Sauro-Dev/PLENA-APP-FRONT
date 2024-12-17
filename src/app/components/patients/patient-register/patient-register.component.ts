import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { PatientsService } from "../patients.service";

@Component({
  selector: 'app-patient-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-register.component.html',
  styleUrls: ['./patient-register.component.css']
})
export class PatientRegisterComponent implements OnInit {
  plans = [{ id: 1, name: 'Plan A' }, { id: 2, name: 'Plan B' }, { id: 3, name: 'Plan C' }, { id: 4, name: 'Plan D' }];
  rooms: any[] = [];
  therapistsMap: Map<number, any[]> = new Map();

  patientForm!: FormGroup;
  isDateTimePickerVisible: number = 0;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      paternalSurname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      maternalSurname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      birthdate: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(0), Validators.max(18)]],
      allergies: ['', [Validators.maxLength(255)]],
      status: [true],
      idPlan: [null, [Validators.required]],
      tutors: this.fb.array([this.createTutor()]),
      sessionDates: this.fb.array([]),
    });

    this.patientForm.get('idPlan')?.valueChanges.subscribe((value) => {
      this.updateDatePickers(value);
    });

    this.patientService.getAllRooms().subscribe((rooms) => {
      console.log('roms')
      this.rooms = rooms;
    });
  }

  get tutors(): FormArray {
    return this.patientForm.get('tutors') as FormArray;
  }

  get sessionDates(): FormArray {
    return this.patientForm.get('sessionDates') as FormArray;
  }

  createTutor(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      dni: ['', [Validators.required, Validators.pattern('[0-9]{8}')]],
      phone: ['', [Validators.required, Validators.pattern('[0-9]{9}')]],
    });
  }

  createSessionDates(): FormGroup {
    return this.fb.group({
      room: ['', Validators.required],
      therapist: ['', Validators.required],
      sessionDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
  }

  addTutor(): void {
    this.tutors.push(this.createTutor());
  }

  removeTutor(index: number): void {
    if (this.tutors.length > 1) {
      this.tutors.removeAt(index);
    }
  }

  addSessionDate(): void {
    this.sessionDates.push(this.createSessionDates());
  }

  removeSessionDate(index: number): void {
    if (this.sessionDates.length > 1) {
      this.sessionDates.removeAt(index);
    }
  }

  onSessionChange(index: number): void {
    const session = this.sessionDates.at(index).value;
    const { sessionDate, startTime, endTime } = session;

    if (sessionDate && startTime && endTime) {
      this.patientService.getAvailableTherapists(sessionDate, startTime, endTime).subscribe(
        (therapists) => {
          this.therapistsMap.set(index, therapists);
          this.sessionDates.at(index).get('therapist')?.setValue('');
        },
        (error) => {
          console.error('Error al obtener terapeutas', error);
        }
      );
    }
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      const formValue = this.patientForm.value;

      this.patientService.createPatient(formValue).subscribe(
        (response) => {
          const patientId = response.idPatient;
          const sessionRequests = formValue.sessionDates.map((session: any) => {

            const sessionData = {
              sessionDate: session.sessionDate,
              startTime: session.startTime,
              endTime: session.endTime,
              therapistId: session.therapist,
              roomId: session.room,
              planId: formValue.idPlan,
              patientId: patientId
            };

            return this.patientService.createSession(sessionData).toPromise();
          });

          Promise.all(sessionRequests).then(
            () => {
              this.router.navigate(['/patients']);
            },
            (error) => {
              console.error('Error al crear sesiones:', error);
            }
          );
        },
        (error) => {
          console.error('Error al registrar paciente:', error);
        }
      );
    } else {
      Object.keys(this.patientForm.controls).forEach(key => {
      });
    }
  }

  onCancel(): void {
    const confirmed = window.confirm('¿Estás seguro de que deseas cancelar el registro?');
    if (confirmed) {
      this.router.navigate(['/patients']);
    }
  }
  updateDatePickers(planId: any): void {
    const numericPlanId = Number(planId);
    switch (numericPlanId) {
      case 1:
        this.isDateTimePickerVisible = 1;
        break;
      case 2:
        this.isDateTimePickerVisible = 2;
        break;
      case 3:
        this.isDateTimePickerVisible = 3;
        break;
      case 4:
        this.isDateTimePickerVisible = 4;
        break;
      default:
        this.isDateTimePickerVisible = 0;
        break;
    }

    if (this.isDateTimePickerVisible > 0) {
      while (this.sessionDates.length < this.isDateTimePickerVisible) {
        this.addSessionDate();
      }
      while (this.sessionDates.length > this.isDateTimePickerVisible) {
        this.removeSessionDate(this.sessionDates.length - 1);
      }
    }
  }
}
