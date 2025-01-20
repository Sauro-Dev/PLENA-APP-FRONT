import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users/users.service';
import { CommonModule, NgForOf } from '@angular/common';
import { ReportsService } from './reports.service';
import { CalendarService } from '../calendar/calendar.service';
import { FormsModule } from '@angular/forms';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import { PatientsService } from '../patients/patients.service';
import {ListPatient} from "../patients/list-patient";



@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  imports: [
    NgForOf,
    FormsModule,
    CommonModule
  ],
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  therapists: { id: string; name: string }[] = [];
  patients: ListPatient[] = [];
  selectedTherapistId: string = '';
  selectedPatientId: string = '';
  startDate: string = '';
  endDate: string = '';
  generalStartDate: string = '';
  generalEndDate: string = '';
  useCustomDateGeneral: boolean = false;
  therapistStartDate: string = '';
  therapistEndDate: string = '';
  patientStartDate: string = '';
  patientEndDate: string = '';
  errorMessage: string = '';
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  useCustomDateTherapist: boolean = false;
  useCustomDatePatient: boolean = false;


  constructor(
    private usersService: UsersService,
    private reportsService: ReportsService,
    private calendarService: CalendarService,
    private patientsService: PatientsService
  ) {}

  ngOnInit(): void {

    this.loadTherapists();
    this.loadPatients();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onTherapistChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTherapistId = selectElement.value;
    console.log('Selected Therapist ID:', this.selectedTherapistId);
  }

  generateGeneralReport(): void {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (this.useCustomDateGeneral) {
      if (!this.generalStartDate || !this.generalEndDate) {
        this.modalTitle = 'Error';
        this.modalMessage = 'Por favor, seleccione ambas fechas';
        this.showModal = true;
        return;
      }

      startDate = this.generalStartDate;
      endDate = this.generalEndDate;
    } else {
      const today = new Date();
      const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      startDate = this.formatDate(firstDayOfPreviousMonth);
      endDate = this.formatDate(lastDayOfPreviousMonth);
    }

    if (startDate && endDate) {
      this.checkSessionsInRange(startDate, endDate);
    } else {
      this.generateReport(startDate, endDate);
    }
  }

  private generateReport(startDate?: string, endDate?: string): void {
    this.reportsService.generateGeneralReport(startDate, endDate).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.reportsService.downloadPdf(response);
        this.errorMessage = '';
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al generar el reporte', error);
        if (error.status === 404 || (error.error && error.error.message)) {
          this.errorMessage = 'No hay sesiones registradas';
        } else {
          this.modalTitle = 'Error';
          this.modalMessage = 'Ocurrió un error al generar el reporte';
          this.showModal = true;
        }
      }
    });
  }

  checkSessionsInRange(startDate: string, endDate: string): void {
    this.calendarService.getSessionsByMonth(startDate).subscribe({
      next: (sessions) => {
        const sessionsInRange = sessions.filter(session =>
          session.sessionDate >= startDate && session.sessionDate <= endDate
        );
        if (sessionsInRange.length === 0) {
          this.showNoDataModal('general');
        } else {
          this.generateReport(startDate, endDate);
        }
      },
      error: (error) => {
        console.error('Error al verificar sesiones:', error);
        this.modalTitle = 'Error';
        this.modalMessage = 'Error al verificar las sesiones';
        this.showModal = true;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.modalTitle = '';
    this.modalMessage = '';
  }


  private loadTherapists(): void {
    this.usersService.getTherapists().subscribe({
      next: (therapists) => {
        this.therapists = therapists;
      },
      error: (error) => {
        console.error('Error al cargar los terapeutas:', error);
      }
    });
  }

  private showNoDataModal(type: 'general' | 'therapist' | 'patient'): void {
    this.modalTitle = 'Sin datos disponibles';

    if (type === 'general') {
      this.modalMessage = this.useCustomDateGeneral
        ? 'No hay sesiones registradas en el rango de fechas seleccionado.'
        : 'No hay sesiones registradas en el mes anterior.';
    } else if (type === 'therapist') {
      this.modalMessage = this.useCustomDateTherapist
        ? 'No hay sesiones registradas para este terapeuta en el rango de fechas seleccionado.'
        : 'No hay sesiones registradas en el mes anterior.';
    } else {
      this.modalMessage = this.useCustomDatePatient
        ? 'No hay sesiones registradas para este paciente en el rango de fechas seleccionado.'
        : 'No hay sesiones registradas en el mes anterior.';
    }

    this.showModal = true;
  }

  private loadPatients(): void {
    this.patientsService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: (error) => {
        console.error('Error al cargar los pacientes:', error);
      }
    });
  }

  generateTherapistReport(): void {
    // Solo validamos que se haya seleccionado un terapeuta
    if (!this.selectedTherapistId) {
      this.modalTitle = 'Error';
      this.modalMessage = 'Por favor, seleccione un terapeuta';
      this.showModal = true;
      return;
    }

    let startDate: string;
    let endDate: string;

    if (this.useCustomDateTherapist) {
      // Solo validamos las fechas si se está usando fecha personalizada
      if (!this.therapistStartDate || !this.therapistEndDate) {
        this.modalTitle = 'Error';
        this.modalMessage = 'Por favor, seleccione ambas fechas';
        this.showModal = true;
        return;
      }

      if (new Date(this.therapistStartDate) > new Date(this.therapistEndDate)) {
        this.modalTitle = 'Error';
        this.modalMessage = 'La fecha de inicio no puede ser mayor que la fecha de fin';
        this.showModal = true;
        return;
      }

      startDate = this.therapistStartDate;
      endDate = this.therapistEndDate;
    } else {
      // Si no se usa fecha personalizada, usamos el mes anterior
      const today = new Date();
      const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      startDate = this.formatDate(firstDayOfPreviousMonth);
      endDate = this.formatDate(lastDayOfPreviousMonth);
    }

    // Verificar sesiones en el rango de fechas
    this.calendarService.getSessionsByMonth(startDate).subscribe({
      next: (sessions) => {
        const sessionsInRange = sessions.filter(session =>
          session.sessionDate >= startDate &&
          session.sessionDate <= endDate &&
          session.therapistId.toString() === this.selectedTherapistId
        );

        if (sessionsInRange.length === 0) {
          this.showNoDataModal('therapist');
        } else {
          this.generateTherapistReportPdf(startDate, endDate);
        }
      },
      error: (error) => {
        console.error('Error al verificar sesiones:', error);
        this.modalTitle = 'Error';
        this.modalMessage = 'Error al verificar las sesiones';
        this.showModal = true;
      }
    });
  }

  private generateTherapistReportPdf(startDate: string, endDate: string): void {
    this.reportsService.generateTherapistReport(Number(this.selectedTherapistId), startDate, endDate)
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          this.reportsService.downloadPdf(response);
          this.errorMessage = '';
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al generar el reporte:', error);
          if (error.status === 404) {
            this.showNoDataModal('therapist');
          } else {
            this.modalTitle = 'Error';
            this.modalMessage = 'Ocurrió un error al generar el reporte';
            this.showModal = true;
          }
        }
      });
  }

  generatePatientReport(): void {
    // Solo validamos que se haya seleccionado un paciente
    if (!this.selectedPatientId) {
      this.modalTitle = 'Error';
      this.modalMessage = 'Por favor, seleccione un paciente';
      this.showModal = true;
      return;
    }

    let startDate: string;
    let endDate: string;

    if (this.useCustomDatePatient) {
      // Solo validamos las fechas si se está usando fecha personalizada
      if (!this.patientStartDate || !this.patientEndDate) {
        this.modalTitle = 'Error';
        this.modalMessage = 'Por favor, seleccione ambas fechas';
        this.showModal = true;
        return;
      }

      if (new Date(this.patientStartDate) > new Date(this.patientEndDate)) {
        this.modalTitle = 'Error';
        this.modalMessage = 'La fecha de inicio no puede ser mayor que la fecha de fin';
        this.showModal = true;
        return;
      }

      startDate = this.patientStartDate;
      endDate = this.patientEndDate;
    } else {
      // Si no se usa fecha personalizada, usamos el mes anterior
      const today = new Date();
      const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      startDate = this.formatDate(firstDayOfPreviousMonth);
      endDate = this.formatDate(lastDayOfPreviousMonth);
    }

    const selectedPatient = this.patients.find(p => p.idPatient.toString() === this.selectedPatientId);

    if (!selectedPatient) {
      this.modalTitle = 'Error';
      this.modalMessage = 'Paciente no encontrado';
      this.showModal = true;
      return;
    }

    // Generar el reporte
    this.generatePatientReportPdf(selectedPatient.idPatient, startDate, endDate);
  }

  private generatePatientReportPdf(patientId: number, startDate: string, endDate: string): void {
    this.reportsService.generatePatientReport(patientId, startDate, endDate)
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          if (response.body && response.body.size > 16 * 1024) {
            this.reportsService.downloadPdf(response);
          } else {
            this.showNoDataModal('patient');
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al generar el reporte:', error);
          if (error.status === 404 || (error.error instanceof Blob && error.error.size <= 16 * 1024)) {
            this.showNoDataModal('patient');
          } else {
            this.modalTitle = 'Error';
            this.modalMessage = 'Ocurrió un error al generar el reporte';
            this.showModal = true;
          }
        }
      });
  }
}
