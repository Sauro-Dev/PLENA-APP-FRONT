import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlansService } from '../plans.service';
import { Plan } from '../plan';
import {
  AbstractControl,
  FormArray,
  FormBuilder, FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { PatientsService } from '../patients.service';
import {RoomResponse} from "../room-response";

@Component({
  selector: 'app-patient-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-register.component.html',
  styleUrls: ['./patient-register.component.css'],
})
export class PatientRegisterComponent implements OnInit {
  plans: Plan[] = [];
  rooms: any[] = [];
  roomsMap = new Map<number, any[]>(); // Un mapa que asocia cada sesión con su lista de salas disponibles
  therapistsMap: Map<number, any[]> = new Map();


  patientForm!: FormGroup;
  isDateTimePickerVisible: number = 0;
  showRegisterModal: boolean = false;
  showCancelModal: boolean = false;
  minuteOptionsMap: Map<number, string[]> = new Map(); // Opciones de minutos por índice
  timeControls: Map<number, { hour: FormControl, minute: FormControl }> = new Map();

  isFocused: string | null = null;
  nameValue: string = '';
  paternalValue: string = '';
  maternalValue: string = '';
  dniValue: string = '';
  presumptiveDiagnosisValue: string = '';
  planValue: string = '';
  sessionDateValues: string[] = [];
  sessionHourValues: string[] = [];
  sessionMinuteValues: string[] = [];
  @ViewChild('sessionDateInput') sessionDateInput!: ElementRef;
  @ViewChild('nameInput') nameInput!: ElementRef;
  @ViewChild('planInput') planInput!: ElementRef;
  @ViewChild('paternalInput') paternalInput!: ElementRef;
  @ViewChild('maternalInput') maternalInput!: ElementRef;
  @ViewChild('birthdateInput') birthdateInput!: ElementRef;
  @ViewChild('dniInput') dniInput!: ElementRef;
  @ViewChild('presumptiveDiagnosisInput') presumptiveDiagnosisInput!: ElementRef;



  tutorValues: Array<{
    name: string;
    dni: string;
    phone: string;
  }> = [{ name: '', dni: '', phone: '' }];

  tutorFocused: Array<{
    name: boolean;
    dni: boolean;
    phone: boolean;
  }> = [{ name: false, dni: false, phone: false }];



  sessionFocusStates: Map<number, {
    date: boolean;
    hour: boolean;
    minute: boolean;
  }> = new Map();

  constructor(
    private fb: FormBuilder,
    private patientService: PatientsService,
    private router: Router,
    private plansService: PlansService,
    private cdRef: ChangeDetectorRef
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
        presumptiveDiagnosis: [
          '',
          [
            Validators.required,
            Validators.maxLength(255)
          ]
        ],
        birthdate: ['', [Validators.required, this.dateRangeValidator]],
        age: [{value: '', disabled: true}],
        status: [true],
        idPlan: [null, [Validators.required]],
        tutors: this.fb.array([this.createTutor()]),
        sessionDates: this.fb.array([]),
      },
      {
        validators: this.checkDuplicateDNIPatientAndTutor(),
      }
    );


    this.patientForm.get('idPlan')?.valueChanges.subscribe(planId => {
      console.log('Plan ID recibido:', planId, 'tipo:', typeof planId);
      console.log('Planes disponibles:', this.plans);

      // Convertir planId a número si viene como string
      const planIdNumber = Number(planId);

      if (planId) {
        const selectedPlan = this.plans.find(p => p.idPlan === planIdNumber);
        console.log('Buscando plan con ID:', planIdNumber);
        console.log('Plan encontrado:', selectedPlan);

        if (selectedPlan) {
          // Resetear sesiones existentes
          this.resetSessionDates();

          // Establecer el número de sesiones visible
          this.isDateTimePickerVisible = selectedPlan.numOfSessions;
          console.log('Número de sesiones a crear:', selectedPlan.numOfSessions);

          // Crear las sesiones según el plan
          for (let i = 0; i < selectedPlan.numOfSessions; i++) {
            const sessionGroup = this.fb.group({
              sessionDate: ['', [Validators.required, this.dateValidator.bind(this)]],
              startTime: ['', [Validators.required]],
              endTime: [''],
              room: [null, Validators.required],
              therapist: [null, Validators.required]
            });

            this.sessionDates.push(sessionGroup);
            this.initializeTimeControls(i);
          }

          console.log('Sesiones creadas:', this.sessionDates.length);
          this.cdRef.detectChanges();
        }
      } else {
        this.resetSessionDates();
        this.isDateTimePickerVisible = 0;
      }
    });

    // Inicializar rooms como array vacío
    this.rooms = [];

    this.roomsMap = new Map<number, any[]>();

    this.therapistsMap = new Map<number, any[]>();

    this.addSession();

    this.loadPlans();


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
    if (!control.value) {
      return { required: true };
    }

    const date = new Date(control.value);
    const today = new Date();
    const minDate = new Date('1920-01-01');
    const maxDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

    if (date < minDate || date > maxDate) {
      return { outOfRange: true };
    }

    return null;
  }
  resetSessionDates(): void {
    while (this.sessionDates.length > 0) {
      const index = this.sessionDates.length - 1;
      this.sessionFocusStates.delete(index);
      this.sessionDates.removeAt(index);
    }

    this.timeControls.clear();
    this.sessionDateValues = [];
    this.sessionHourValues = [];
    this.sessionMinuteValues = [];
    this.minuteOptionsMap.clear();
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

  updateMinuteOptions(index: number, hour: number): void {
    const controls = this.timeControls.get(index);
    if (!controls) return;

    const currentMinute = controls.minute.value; // Minuto actual

    if (hour === 12 || hour === 18) {
      // Si es 12 PM o 6 PM, solo "00" es permitido
      this.minuteOptionsMap.set(index, ['00']);
      // Solo forzamos a "00" si no ha sido seleccionado ya
      if (currentMinute !== '00') {
        controls.minute.setValue('00', { emitEvent: false });
      }
    } else {
      // En otros horarios permitimos intervalos de 10 minutos
      const options = ['00', '10', '20', '30', '40', '50'];
      this.minuteOptionsMap.set(index, options);

      // Validar si el minuto actual sigue siendo válido
      if (!options.includes(currentMinute)) {
        controls.minute.setValue('00', { emitEvent: false }); // Reinicia a 00 si es inválido
      }
    }
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

  addSession(): void {
    const sessionGroup = this.fb.group({
      sessionDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      room: [null, Validators.required],
      therapist: [null, Validators.required]
    });

    const index = this.sessionDates.length;
    this.sessionDates.push(sessionGroup);

    // Inicializar estados para la nueva sesión
    this.sessionFocusStates.set(index, {
      date: false,
      hour: false,
      minute: false
    });

    // Inicializar valores
    this.sessionDateValues[index] = '';
    this.sessionHourValues[index] = '';
    this.sessionMinuteValues[index] = '';

    // Inicializar controles de tiempo
    this.initializeTimeControls(index);
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

    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return '';

      // Calcular total de minutos
      let totalMinutes = hours * 60 + minutes + 50; // Agregar 50 minutos

      // Convertir de vuelta a horas y minutos
      const newHours = Math.floor(totalMinutes / 60) % 24;
      const newMinutes = totalMinutes % 60;

      // Formatear con ceros a la izquierda
      return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating end time:', error);
      return '';
    }
  }



  format12Hours(time: string): string {
    if (!time) return '--:-- --';

    try {
      const [hours, minutes] = time.split(':').map(Number);

      if (isNaN(hours) || isNaN(minutes)) {
        return '--:-- --';
      }

      // Convertir a formato 12 horas
      const hour12 = hours % 12 || 12;
      const period = hours >= 12 ? 'PM' : 'AM';

      // Formatear con ceros a la izquierda
      const formattedHours = hour12.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');

      // Retornar formato consistente
      return `${formattedHours}:${formattedMinutes} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:-- --';
    }
  }

  addMinutes(time: string, minutes: number): string {
    if (!time) return '';

    try {
      const [hours, mins] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(mins)) return '';

      // Calcular total de minutos
      let totalMinutes = hours * 60 + mins + minutes;

      // Convertir de vuelta a horas y minutos
      const newHours = Math.floor(totalMinutes / 60) % 24; // Asegura formato 24 horas
      const newMinutes = totalMinutes % 60;

      // Formatear con ceros a la izquierda
      return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error adding minutes:', error);
      return '';
    }
  }

  addTutor(): void {
    this.tutors.push(this.createTutor());
    this.tutorValues.push({ name: '', dni: '', phone: '' });
    this.tutorFocused.push({ name: false, dni: false, phone: false });
  }
  removeTutor(index: number): void {
    if (this.tutors.length > 1) {
      this.tutors.removeAt(index);
      this.tutorValues.splice(index, 1);
      this.tutorFocused.splice(index, 1);
    }
  }

  onSessionChange(index: number): void {
    const session = this.sessionDates.at(index);
    const startTime = session.get('startTime')?.value;
    const sessionDate = session.get('sessionDate')?.value;

    if (!sessionDate || !startTime) return;

    const selectedRoom = session.get('room')?.value;
    const endTime24 = this.calculateEndTime24Hours(startTime);
    session.get('endTime')?.setValue(endTime24, { emitEvent: false });

    // Obtener salas disponibles
    this.patientService
      .getAvailableRooms(sessionDate, startTime, endTime24)
      .subscribe({
        next: (rooms: RoomResponse[]) => {
          // Filtrar solo salas terapéuticas y habilitadas
          const therapeuticRooms = rooms.filter(room =>
            room.isTherapeutic && room.enabled
          );

          console.log('Salas terapéuticas disponibles:', therapeuticRooms);

          this.roomsMap.set(index, therapeuticRooms);

          // Validar si la sala seleccionada sigue siendo válida
          if (selectedRoom && !therapeuticRooms.some((room) => room.idRoom === selectedRoom)) {
            session.get('room')?.setValue(null);
            session.get('room')?.setErrors({ noAvailableRooms: true });
          }

          // Validar disponibilidad de salas
          if (therapeuticRooms.length === 0) {
            session.get('room')?.setErrors({ noAvailableRooms: true });
          } else {
            session.get('room')?.setErrors(null);
          }
        },
        error: (err) => {
          console.error('Error al cargar salas disponibles:', err);
          session.get('room')?.setErrors({ loadError: true });
        },
      });

    // Obtener terapeutas disponibles
    this.patientService
      .getAvailableTherapists(sessionDate, startTime, endTime24)
      .subscribe({
        next: (therapists) => {
          this.therapistsMap.set(index, therapists); // Actualizar el mapa de terapeutas disponibles para esta sesión

          if (therapists.length === 0) {
            session.get('therapist')?.setErrors({ noAvailableTherapists: true });
          } else {
            session.get('therapist')?.setErrors(null);
          }
        },
        error: (err) => {
          console.error('Error al cargar terapeutas disponibles:', err);
        },
      });
  }



  timeRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const [hours, minutes] = control.value.split(':').map(Number);

      // Validar horario de mañana (9:00 AM - 1:00 PM)
      const isMorningShift = (hours >= 9 && hours < 13);

      // Validar horario de tarde (3:00 PM - 7:00 PM)
      const isAfternoonShift = (hours >= 15 && hours < 19);

      if (!isMorningShift && !isAfternoonShift) {
        return { invalidTimeRange: true };
      }

      // Validar que los minutos sean múltiplos de 10
      if (minutes % 10 !== 0) {
        return { invalidTimeRange: true };
      }

      return null;
    };
  }


  onSubmit(): void {
    if (this.patientForm.valid) {
      this.openRegisterModal();
    } else {
      console.error('Formulario inválido');
    }
  }

  updateDatePickers(planId: number): void {
    console.log('Actualizando sesiones para plan:', planId); // Para debug
    const selectedPlan = this.plans.find(p => p.idPlan === planId);
    if (!selectedPlan) {
      console.warn('Plan no encontrado:', planId);
      return;
    }

    // Resetear sesiones existentes
    this.resetSessionDates();

    // Actualizar el número de sesiones visibles
    this.isDateTimePickerVisible = selectedPlan.numOfSessions;

    // Crear nuevas sesiones según el plan seleccionado
    for (let i = 0; i < selectedPlan.numOfSessions; i++) {
      const sessionGroup = this.fb.group({
        sessionDate: ['', [Validators.required, this.dateValidator.bind(this)]],
        startTime: ['', [Validators.required]],
        endTime: [''],
        room: [null, Validators.required],
        therapist: [null, Validators.required]
      });

      this.sessionDates.push(sessionGroup);
      this.initializeTimeControls(i);
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

      //console.log('Datos a enviar:', registerPatientData);  Verify data in console

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

  getHourControl(index: number) {
    if (!this.timeControls.has(index)) {
      this.initializeTimeControls(index);
    }
    return this.timeControls.get(index)!.hour;
  }

  getMinuteControl(index: number) {
    if (!this.timeControls.has(index)) {
      this.initializeTimeControls(index);
    }
    return this.timeControls.get(index)!.minute;
  }

  initializeTimeControls(index: number): void {
    this.timeControls.set(index, {
      hour: new FormControl('', Validators.required), // Hora inicial vacía, pero no null
      minute: new FormControl('', Validators.required) // Minutos iniciales vacíos, pero no null
    });

    const session = this.sessionDates.at(index);
    const currentTime = session.get('startTime')?.value;

    if (currentTime) {
      const [hours, minutes] = currentTime.split(':').map(Number);
      const controls = this.timeControls.get(index)!;
      controls.hour.setValue(hours.toString().padStart(2, '0'), { emitEvent: false });
      controls.minute.setValue(minutes.toString().padStart(2, '0'), { emitEvent: false });
    }
  }

  updateTime(index: number): void {
    const controls = this.timeControls.get(index);
    const session = this.sessionDates.at(index);

    if (!controls || !controls.hour.value) return;

    let hour = parseInt(controls.hour.value ?? '', 10);
    let minute = parseInt(controls.minute.value ?? '', 10);

    if (isNaN(hour)) hour = 0;
    if (isNaN(minute)) minute = 0;

    this.updateMinuteOptions(index, hour);

    if (minute === undefined || isNaN(minute)) {
      minute = 0;
    }

    if (hour > 18) {
      hour = 18;
      minute = 0;
      controls.hour.setValue('18', { emitEvent: false });
      controls.minute.setValue('00', { emitEvent: false });
    }

    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    session.get('startTime')?.setValue(time);

    // Actualizar valores locales
    this.sessionHourValues[index] = hour.toString().padStart(2, '0');
    this.sessionMinuteValues[index] = minute.toString().padStart(2, '0');

    this.cdRef.detectChanges();
    this.onSessionChange(index);
  }

  isSessionFieldFocused(index: number, field: 'date' | 'hour' | 'minute'): boolean {
    return this.sessionFocusStates.get(index)?.[field] || false;
  }

  hasSessionValue(index: number, field: 'date' | 'hour' | 'minute'): boolean {
    switch(field) {
      case 'date':
        return !!this.sessionDateValues[index];
      case 'hour':
        return !!this.sessionHourValues[index];
      case 'minute':
        return !!this.sessionMinuteValues[index];
      default:
        return false;
    }
  }

  getRoomControl(index: number): FormControl {
    return this.sessionDates.at(index).get('room') as FormControl;
  }

  onFocus(field: string): void {
    this.isFocused = field;
  }

  onBlur(field: string): void {
    switch(field) {
      case 'name':
        if (!this.nameValue) this.isFocused = null;
        break;
      case 'paternal':
        if (!this.paternalValue) this.isFocused = null;
        break;
      case 'maternal':
        if (!this.maternalValue) this.isFocused = null;
        break;
      case 'dni':
        if (!this.dniValue) this.isFocused = null;
        break;
      case 'presumptiveDiagnosis':
        if (!this.presumptiveDiagnosisValue) this.isFocused = null;
        break;
      case 'plan':
        if (!this.planValue) this.isFocused = null;
        break;
    }
  }

  calculateAge(): void {
    const birthdateControl = this.patientForm.get('birthdate');
    const birthdate = birthdateControl?.value;

    if (!birthdate) {
      this.patientForm.get('age')?.setValue('');
      return;
    }

    const today = new Date();
    const birth = new Date(birthdate);

    // Validar el rango de fechas
    const minDate = new Date('1920-01-01');
    const maxDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

    if (birth < minDate || birth > maxDate) {
      birthdateControl?.setErrors({ outOfRange: true });
      this.patientForm.get('age')?.setValue('');
      return;
    }

    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    // Solo establecemos la edad si está dentro del rango válido
    if (age >= 1) {
      this.patientForm.get('age')?.setValue(age);
    } else {
      this.patientForm.get('age')?.setValue('');
      birthdateControl?.setErrors({ outOfRange: true });
    }
  }

  onTutorFocus(index: number, field: 'name' | 'dni' | 'phone'): void {
    if (!this.tutorFocused[index]) {
      this.tutorFocused[index] = { name: false, dni: false, phone: false };
    }
    this.tutorFocused[index][field] = true;
  }

  onTutorBlur(index: number, field: 'name' | 'dni' | 'phone'): void {
    if (this.tutorFocused[index]) {
      if (!this.tutorValues[index][field]) {
        this.tutorFocused[index][field] = false;
      }
    }
  }


  loadPlans(): void {
    this.plansService.getAllPlans().subscribe({
      next: (plans) => {
        console.log('Planes recibidos:', plans);
        this.plans = plans.map(plan => ({
          idPlan: Number(plan.id),
          numOfSessions: Number(plan.numOfSessions),
          weeks: Number(plan.weeks),
          name: this.getPlanName(plan.numOfSessions)
        }));
        console.log('Planes procesados:', this.plans);
      },
      error: (error) => {
        console.error('Error al cargar planes:', error);
        if (error.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getPlanName(sessions: number): string {
    const planNames = ['A', 'B', 'C', 'D', 'E', 'F'];
    return `Plan ${planNames[sessions - 1]}`;
  }
}

