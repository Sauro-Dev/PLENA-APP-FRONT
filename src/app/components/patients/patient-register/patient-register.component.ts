import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { PatientsService } from '../patients.service';

@Component({
  selector: 'app-patient-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-register.component.html',
  styleUrls: ['./patient-register.component.css'],
})
export class PatientRegisterComponent implements OnInit {
  plans = [
    { id: 1, name: 'Plan A' },
    { id: 2, name: 'Plan B' },
    { id: 3, name: 'Plan C' },
    { id: 4, name: 'Plan D' },
  ];
  rooms: any[] = [];
  therapistsMap: Map<number, any[]> = new Map();

  patientForm!: FormGroup;
  isDateTimePickerVisible: number = 0;
  showRegisterModal: boolean = false; // Control para la modal de registro
  showCancelModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.patientForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(30),
          ],
        ],
        paternalSurname: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(30),
          ],
        ],
        maternalSurname: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(30),
          ],
        ],
        dni: [
          '',
          [Validators.required, Validators.pattern('\\d{8}')],
          [this.checkDuplicateDNI.bind(this)],
        ],
        birthdate: ['', [Validators.required, this.dateRangeValidator]],
        age: ['', [Validators.required, Validators.min(0), Validators.max(18)]],
        allergies: ['', [Validators.maxLength(255)]],
        status: [true],
        idPlan: [null, [Validators.required]],
        tutors: this.fb.array([this.createTutor()]),
        sessionDates: this.fb.array([]),
      },
      {
        validators: this.checkDuplicateDNIPatientAndTutor(), // Validador de coincidencia de DNI
      }
    );

    this.patientForm.get('idPlan')?.valueChanges.subscribe((value) => {
      this.updateDatePickers(value);
    });

    this.patientService.getAllRooms().subscribe((rooms) => {
      this.rooms = rooms;
    });
  }

  get tutors(): FormArray {
    return this.patientForm.get('tutors') as FormArray;
  }

  get sessionDates(): FormArray {
    return this.patientForm.get('sessionDates') as FormArray;
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const date = new Date(control.value);
    const minDate = new Date('2000-01-01');
    const maxDate = new Date('2025-01-01');

    if (date < minDate || date > maxDate) {
      return { outOfRange: true };
    }
    return null;
  }

  checkDuplicateDNIPatientAndTutor(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const patientDNI = form.get('dni')?.value;
      const tutors = form.get('tutors') as FormArray;

      const duplicate = tutors.controls.some((tutor) => {
        return tutor.get('dni')?.value === patientDNI;
      });

      return duplicate ? { duplicateWithTutor: true } : null;
    };
  }

  checkDuplicateDNI(
    control: AbstractControl
  ): Promise<ValidationErrors | null> {
    const dni = control.value;
    const tutors = this.patientForm.get('tutors')?.value || [];

    return new Promise((resolve) => {
      if (!dni) {
        resolve(null);
      } else {
        this.patientService.checkPatientDNI(dni, tutors).subscribe(
          (isTaken) => {
            resolve(isTaken ? { duplicateWithDatabase: true } : null);
            this.patientForm.updateValueAndValidity({ emitEvent: false });
          },
          (error) => {
            console.error('Error al validar el DNI:', error);
            resolve(null);
          }
        );
      }
    });
  }

  createTutor(): FormGroup {
    return this.fb.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30),
        ],
      ],
      dni: ['', [Validators.required, Validators.pattern('\\d{8}')]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern('\\d{9}'),
          Validators.maxLength(9),
        ],
      ],
    });
  }

  limitInputLength(event: KeyboardEvent, maxLength: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= maxLength && event.key !== 'Backspace') {
      event.preventDefault();
    }
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
      this.patientService
        .getAvailableTherapists(sessionDate, startTime, endTime)
        .subscribe(
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
              patientId: patientId,
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
      Object.keys(this.patientForm.controls).forEach((key) => {});
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
  // Mostrar la modal de registro
  openRegisterModal(): void {
    this.showRegisterModal = true;
  }

  // Ocultar la modal de registro
  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  // Confirmar el registro
  confirmRegister(): void {
    this.closeRegisterModal();
    if (this.patientForm.valid) {
      this.patientService.createPatient(this.patientForm.value).subscribe(
        (response) => {
          this.router.navigate(['/patients']);
        },
        (error) => {
          console.error('Error al registrar paciente:', error);
        }
      );
    }
  }

  // Mostrar la modal de cancelación
  openCancelModal(): void {
    this.showCancelModal = true;
  }

  // Ocultar la modal de cancelación
  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  // Confirmar la cancelación
  confirmCancel(): void {
    this.closeCancelModal();
    this.router.navigate(['/patients']);
  }
}
