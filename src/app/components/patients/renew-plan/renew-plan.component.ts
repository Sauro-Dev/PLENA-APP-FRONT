import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule, ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlansService } from '../plans.service';
import { PatientsService } from '../patients.service';
import {NgForOf, NgIf} from "@angular/common";
import {RenewPlan} from "../renew-plan";
import Swal from "sweetalert2";

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
  timeControls: Map<number, { hour: FormControl, minute: FormControl }> = new Map();
  minuteOptionsMap: Map<number, string[]> = new Map();
  currentPlan: any = null;

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
    this.patientsService.getPatientById(id).subscribe({
      next: (data) => {
        this.patient = data;
        this.loadCurrentPlan(data.planId); // Cargar el plan actual
        console.log('Datos del paciente cargados:', this.patient);
      },
      error: (error) => {
        console.error('Error al cargar el paciente:', error);
      }
    });
  }

  loadCurrentPlan(planId: number): void {
    this.plansService.getAllPlans().subscribe({
      next: (data) => {
        const plan = data.find(p => p.id === planId);
        if (plan) {
          this.currentPlan = {
            idPlan: plan.id,
            name: this.getPlanName(plan.numOfSessions),
            numOfSessions: plan.numOfSessions
          };
        }
      },
      error: (error) => {
        console.error('Error al cargar plan actual:', error);
      }
    });
  }

  loadPlans(): void {
    this.plansService.getAllPlans().subscribe({
      next: (data) => {
        this.plans = data.map((plan) => ({
          idPlan: plan.id,
          name: this.getPlanName(plan.numOfSessions),
          numOfSessions: plan.numOfSessions
        }));
      },
      error: (error) => {
        console.error('Error al cargar planes:', error);
      }
    });
  }


  getPlanName(sessions: number): string {
    const planNames = ['A', 'B', 'C', 'D', 'E', 'F'];
    return `Plan ${planNames[sessions - 1]} (${sessions} ${sessions === 1 ? 'sesión' : 'sesiones'} por semana)`;
  }

  onChangePlan(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPlanId = +target.value;
    const newPlan = this.plans.find(plan => plan.idPlan === newPlanId);

    if (newPlan) {
      // Limpiar sesiones anteriores
      this.resetSessionDates();

      // Crear nuevas sesiones basadas en el nuevo plan
      for (let i = 0; i < newPlan.numOfSessions; i++) {
        const sessionForm = this.createSessionForm();
        this.sessionDates.push(sessionForm);
        this.initializeTimeControls(i);
      }

      // Actualizar plan seleccionado
      this.selectedPlan = newPlan;
    }
  }

  createSessionForm(): FormGroup {
    return this.fb.group({
      sessionDate: ['', [Validators.required, this.dateValidator.bind(this)]],
      startTime: ['', Validators.required],
      endTime: [''],
      room: [null, Validators.required],
      therapist: [null, Validators.required]
    });
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const date = new Date(control.value + 'T12:00:00Z');
    const dayOfWeek = date.getUTCDay();

    if (dayOfWeek === 0) {
      return { invalidDay: true };
    }
    return null;
  }

  onSessionChange(index: number): void {
    const session = this.sessionDates.at(index);
    const sessionDate = session.get('sessionDate')?.value;
    const startTime = session.get('startTime')?.value;

    if (!sessionDate || !startTime) return;

    const endTime = this.calculateEndTime24Hours(startTime);
    session.get('endTime')?.setValue(endTime);

    // Obtener salas disponibles
    this.patientsService.getAvailableRooms(sessionDate, startTime, endTime)
      .subscribe({
        next: (rooms) => {
          const therapeuticRooms = rooms.filter(room =>
            room.isTherapeutic && room.enabled
          );
          this.roomsMap.set(index, therapeuticRooms);

          if (therapeuticRooms.length === 0) {
            session.get('room')?.setErrors({ noAvailableRooms: true });
          }
        },
        error: (err) => {
          console.error('Error al cargar salas:', err);
          session.get('room')?.setErrors({ loadError: true });
        }
      });

    // Obtener terapeutas disponibles
    this.patientsService.getAvailableTherapists(sessionDate, startTime, endTime)
      .subscribe({
        next: (therapists) => {
          this.therapistsMap.set(index, therapists);
          if (therapists.length === 0) {
            session.get('therapist')?.setErrors({ noAvailableTherapists: true });
          }
        },
        error: (err) => {
          console.error('Error al cargar terapeutas:', err);
        }
      });
  }

  resetSessionDates(): void {
    while (this.sessionDates.length !== 0) {
      this.sessionDates.removeAt(0);
    }
  }

  initializeTimeControls(index: number): void {
    this.timeControls.set(index, {
      hour: new FormControl('', Validators.required),
      minute: new FormControl('', Validators.required)
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

  getMinuteControl(index: number): FormControl {
    if (!this.timeControls.has(index)) {
      this.initializeTimeControls(index);
    }
    return this.timeControls.get(index)!.minute;
  }


  getHourControl(index: number): FormControl {
    if (!this.timeControls.has(index)) {
      this.initializeTimeControls(index);
    }
    return this.timeControls.get(index)!.hour;
  }

  updateMinuteOptions(index: number, hour: number): void {
    const controls = this.timeControls.get(index);
    if (!controls) return;

    if (hour === 12 || hour === 18) {
      this.minuteOptionsMap.set(index, ['00']);
      if (controls.minute.value !== '00') {
        controls.minute.setValue('00', { emitEvent: false });
      }
    } else {
      const options = ['00', '10', '20', '30', '40', '50'];
      this.minuteOptionsMap.set(index, options);
      if (!options.includes(controls.minute.value)) {
        controls.minute.setValue('00', { emitEvent: false });
      }
    }
  }

  updateTime(index: number): void {
    const controls = this.timeControls.get(index);
    const session = this.sessionDates.at(index);

    if (!controls || !controls.hour.value) return;

    let hour = parseInt(controls.hour.value, 10);
    let minute = parseInt(controls.minute.value ?? '', 10);

    if (isNaN(hour)) hour = 0;
    if (isNaN(minute)) minute = 0;

    this.updateMinuteOptions(index, hour);

    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    session.get('startTime')?.setValue(time);

    const endTime = this.calculateEndTime24Hours(time);
    session.get('endTime')?.setValue(endTime);

    this.onSessionChange(index);
  }

  calculateEndTime24Hours(startTime: string): string {
    if (!startTime) return '';
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes + 50;
      const newHours = Math.floor(totalMinutes / 60) % 24;
      const newMinutes = totalMinutes % 60;
      return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating end time:', error);
      return '';
    }
  }

  onCancel(): void {
    this.router.navigate(['/patients']);
  }

  onSubmit(): void {
    if (this.renewForm.valid) {
      const sessionValues = (this.sessionDates.controls as FormGroup[]).map(session => ({
        sessionDate: session.value.sessionDate,
        startTime: session.value.startTime,
        room: session.value.room,
        therapist: session.value.therapist
      }));

      const formattedDates = sessionValues.map(session =>
        new Date(session.sessionDate).toISOString().split('T')[0]
      );

      const renewalData: RenewPlan = {
        patientId: Number(this.patient.idPatient),
        newPlanId: Number(this.renewForm.get('idPlan')?.value),
        startTime: sessionValues[0].startTime,
        firstWeekDates: formattedDates,
        therapistId: Number(sessionValues[0].therapist),
        roomId: Number(sessionValues[0].room)
      };

      console.log('Datos a enviar al backend:', renewalData);

      this.patientsService.renewPlan(renewalData).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          // Mostrar mensaje de éxito con SweetAlert2
          Swal.fire({
            title: '¡Éxito!',
            text: 'Plan renovado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#1e40af'
          }).then(() => {
            // Navegar después de que el usuario cierre el modal
            this.router.navigate(['/patients']);
          });
        },
        error: (error) => {
          console.error('Error detallado:', error);
          let errorMessage = 'Error al renovar el plan';
          if (error.error?.message) {
            errorMessage += `: ${error.error.message}`;
          } else if (error.message) {
            errorMessage += `: ${error.message}`;
          }

          // Mostrar mensaje de error con SweetAlert2
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#1e40af'
          });
        }
      });
    } else {
      // Validación detallada
      const formErrors: string[] = [];

      if (this.renewForm.get('idPlan')?.errors) {
        formErrors.push('Debe seleccionar un plan');
      }

      this.sessionDates.controls.forEach((session, index) => {
        if (session.errors) {
          formErrors.push(`Error en la sesión ${index + 1}`);
        }
      });

      const errorMessage = formErrors.length > 0
        ? 'Errores encontrados:\n' + formErrors.join('\n')
        : 'Por favor, complete todos los campos requeridos correctamente.';

      // Mostrar errores de validación con SweetAlert2
      Swal.fire({
        title: 'Formulario Incompleto',
        text: errorMessage,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#1e40af'
      });
    }
  }
}
