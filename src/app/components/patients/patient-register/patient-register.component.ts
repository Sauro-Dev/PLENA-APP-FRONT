import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  showRegisterModal: boolean = false;
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
          [Validators.required, Validators.pattern('^[0-9]{8}$')],
          [this.checkDuplicateDNI.bind(this)],
        ],
        birthdate: ['', [Validators.required, this.dateRangeValidator]],
        presumptiveDiagnosis: ['', [Validators.maxLength(255)]],
        status: [true],
        idPlan: [null, [Validators.required]],
        tutors: this.fb.array([this.createTutor()]),
        sessionDates: this.fb.array([]),
      },
      {
        validators: this.checkDuplicateDNIPatientAndTutor(),
      }
    );

    this.patientForm.get('idPlan')?.valueChanges.subscribe((value) => {
      this.updateDatePickers(value);
    });

    // Inicializar rooms como array vacío
    this.rooms = [];

    // Si hay un plan seleccionado, actualizar los date pickers
    const selectedPlan = this.patientForm.get('idPlan')?.value;
    if (selectedPlan) {
      this.updateDatePickers(selectedPlan);
    }

    this.patientForm.get('dni')?.valueChanges.subscribe(() => {
      if (this.patientForm.get('dni')?.touched) {
        this.patientForm.updateValueAndValidity();
      }
    });

    this.patientForm.get('tutors')?.valueChanges.subscribe(() => {
      if (this.tutors.controls.some((control) => control.get('dni')?.touched)) {
        this.patientForm.updateValueAndValidity();
      }
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
    const minDate = new Date('1920-01-01');
    const maxDate = new Date('2025-01-01');

    if (date < minDate || date > maxDate) {
      return { outOfRange: true };
    }
    return null;
  }

  checkDuplicateDNIPatientAndTutor(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const patientDNI = form.get('dni');
      const tutors = form.get('tutors') as FormArray;

      if (!patientDNI?.touched) {
        return null;
      }

      const duplicate = tutors.controls.some((tutor) => {
        const tutorDNI = tutor.get('dni');
        return (
          tutorDNI?.touched &&
          tutorDNI?.value === patientDNI.value &&
          patientDNI.value !== ''
        );
      });

      if (duplicate) {
        patientDNI.setErrors({
          ...patientDNI.errors,
          duplicateWithTutor: true,
        });
        return { duplicateWithTutor: true };
      }

      if (patientDNI?.hasError('duplicateWithTutor')) {
        const errors = { ...patientDNI.errors };
        delete errors['duplicateWithTutor'];
        patientDNI.setErrors(Object.keys(errors).length ? errors : null);
      }

      return null;
    };
  }

  checkDuplicateDNI(
    control: AbstractControl
  ): Promise<ValidationErrors | null> {
    const dni = control.value;
    const tutors = this.patientForm.get('tutors')?.value || [];

    return new Promise((resolve) => {
      if (!dni || !control.touched) {
        resolve(null);
      } else {
        this.patientService.checkPatientDNI(dni, tutors).subscribe(
          (isTaken) => {
            resolve(isTaken ? { duplicateWithDatabase: true } : null);
          },
          () => {
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
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
    });
  }

  limitInputLength(event: KeyboardEvent, maxLength: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= maxLength && event.key !== 'Backspace') {
      event.preventDefault();
    }
  }

  // Agrega esta función para permitir solo números en DNI
  onlyNumber(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  createSessionDates(): FormGroup {
    return this.fb.group({
      room: ['', Validators.required],
      therapist: ['', Validators.required],
      sessionDate: ['', [Validators.required, this.dateValidator.bind(this)]],
      startTime: ['', [Validators.required, this.timeRangeValidator()]],
      endTime: ['']
    });
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    // Usamos UTC+0 para evitar problemas con zonas horarias
    const date = new Date(control.value + 'T12:00:00Z');
    const dayOfWeek = date.getUTCDay();

    if (dayOfWeek === 0) {
      console.warn('Las sesiones no se pueden programar los domingos');
      return { invalidDay: true };
    }

    return null;
  }
  calculateEndTime24Hours(startTime: string): string {
    if (!startTime) return '';

    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours;
    let endMinutes = minutes + 50; // Agregamos 50 minutos

    // Ajustamos si los minutos superan 60
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }

    // Aseguramos que las horas no excedan las 24
    if (endHours >= 24) {
      endHours -= 24;
    }

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  format12Hours(time: string): string {
    if (!time) return '-- : --';

    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'p. m.' : 'a. m.';
    let displayHours = hours % 12;
    displayHours = displayHours === 0 ? 12 : displayHours;

    // Aseguramos que los números tengan dos dígitos
    const formattedHours = displayHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours} : ${formattedMinutes} ${period}`;
  }

  addMinutes(time: string, minutes: number): string {
    if (!time) return '';

    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);

    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  addTutor(): void {
    this.tutors.push(this.createTutor());
  }

  removeTutor(index: number) {
    this.tutors.removeAt(index);
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
    const session = this.sessionDates.at(index);
    const startTime = session.get('startTime')?.value;
    const sessionDate = session.get('sessionDate')?.value;

    if (sessionDate && startTime) {
      // Guardamos el formato de 24 horas en el formulario para enviar al backend
      const endTime24 = this.calculateEndTime24Hours(startTime);
      session.get('endTime')?.setValue(endTime24, { emitEvent: false });

      // Solo actualizamos la lista de terapeutas disponibles
      this.patientService.getAvailableTherapists(sessionDate, startTime, endTime24).subscribe({
        next: (therapists) => {
          this.therapistsMap.set(index, therapists);
          if (therapists.length === 0) {
            session.get('therapist')?.setErrors({ noAvailableTherapists: true });
          }
        },
        error: (error) => {
          console.error('Error al obtener terapeutas', error);
          session.get('therapist')?.setErrors({ serverError: true });
        }
      });

      // Solo actualizamos la lista de salas disponibles
      this.patientService.getAvailableRooms(sessionDate, startTime, endTime24).subscribe({
        next: (rooms) => {
          this.rooms = rooms; // Solo actualizamos la lista
          if (rooms.length === 0) {
            session.get('room')?.setErrors({ noAvailableRooms: true });
          }
        },
        error: (error) => {
          console.error('Error al obtener salas', error);
          session.get('room')?.setErrors({ serverError: true });
        }
      });
    }
  }

  timeRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const time = control.value;
      const [hours, minutes] = time.split(':').map(Number);
      const inputTime = new Date();
      inputTime.setHours(hours, minutes);

      // Horario de mañana: 9:00 AM - 1:00 PM
      const morningStart = new Date();
      morningStart.setHours(9, 0);
      const morningEnd = new Date();
      morningEnd.setHours(13, 0);

      // Horario de tarde: 3:00 PM - 7:00 PM
      const afternoonStart = new Date();
      afternoonStart.setHours(15, 0);
      const afternoonEnd = new Date();
      afternoonEnd.setHours(19, 0);

      const isInMorningShift = inputTime >= morningStart && inputTime < morningEnd;
      const isInAfternoonShift = inputTime >= afternoonStart && inputTime < afternoonEnd;

      if (!isInMorningShift && !isInAfternoonShift) {
        return { invalidTimeRange: true };
      }

      return null;
    };
  }

  private isValidDay(date: Date): boolean {
    // getDay() devuelve 0 para domingo, 1 para lunes, ..., 6 para sábado
    // Por lo tanto, solo domingo (0) es inválido
    return date.getDay() !== 0;
  }


  onSubmit(): void {
    if (this.patientForm.valid) {
      this.openRegisterModal();
    } else {
      console.error('Formulario inválido');
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

  openRegisterModal(): void {
    this.showRegisterModal = true;
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  confirmRegister(): void {
    this.closeRegisterModal();
    if (this.patientForm.valid) {
      const formValue = this.patientForm.value;

      const formattedTutors = {
        tutor: formValue.tutors.map((tutor: any) => ({
          fullName: tutor.fullName,
          dni: tutor.dni,
          phone: tutor.phone,
        }))
      };

      if (formattedTutors.tutor.length === 0) {
        console.error('Debe haber al menos un tutor');
        return;
      }

      const birthdate = new Date(formValue.birthdate).toISOString().split('T')[0]; // Convert to ISO format
      const firstWeekDates = formValue.sessionDates.map((session: any) => session.sessionDate);

      const registerPatientData = {
        name: formValue.name,
        paternalSurname: formValue.paternalSurname,
        maternalSurname: formValue.maternalSurname,
        dni: formValue.dni,
        birthdate: birthdate,
        presumptiveDiagnosis: formValue.presumptiveDiagnosis,
        status: formValue.status,
        idPlan: Number(formValue.idPlan), // Convert to number
        ...formattedTutors, // Spread the formatted tutors object
        therapistId: Number(formValue.sessionDates[0]?.therapist), // Convert to number
        roomId: Number(formValue.sessionDates[0]?.room), // Convert to number
        startTime: formValue.sessionDates[0]?.startTime,
        firstWeekDates: firstWeekDates.map((date: any) => new Date(date).toISOString().split('T')[0]) // Convert to ISO format
      };

      console.log('Datos a enviar:', registerPatientData); // Verify data in console

      this.patientService.createPatient(registerPatientData).subscribe(
        () => {
          this.router.navigate(['/patients']);
        },
        (error) => {
          console.error('Error al registrar paciente:', error);
        }
      );
    }
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancel(): void {
    this.closeCancelModal();
    this.router.navigate(['/patients']);
  }
}

