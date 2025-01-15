import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users/users.service';
import { CommonModule, NgForOf } from '@angular/common';
import { ReportsService } from './reports.service';
import { CalendarService } from '../calendar/calendar.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Session } from '../calendar/session';

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
  selectedTherapistId: string = '';
  startDate: string = '';
  endDate: string = '';
  showDownloadButton: boolean = false;
  generalStartDate: string = '';
  generalEndDate: string = '';
  useCustomDateGeneral: boolean = false;
  todayDate: string = '';
  errorMessage: string = '';
  showNoDataModal: boolean = false;

  constructor(
    private usersService: UsersService,
    private reportsService: ReportsService,
    private calendarService: CalendarService
  ) {}

  ngOnInit(): void {
    // Establecer fechas por defecto para enero de 2025
    const firstDayOfJanuary2025 = new Date(2025, 0, 1);
    const lastDayOfJanuary2025 = new Date(2025, 0, 31);

    this.generalStartDate = this.formatDate(firstDayOfJanuary2025);
    this.generalEndDate = this.formatDate(lastDayOfJanuary2025);
    this.todayDate = this.formatDate(new Date());
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
        alert('Por favor, seleccione ambas fechas');
        return;
      }

      startDate = this.generalStartDate;
      endDate = this.generalEndDate;
    }

    if (startDate && endDate) {
      this.checkSessionsInRange(startDate, endDate);
    } else {
      this.generateReport(startDate, endDate);
    }
  }

  private generateReport(startDate?: string, endDate?: string): void {
    this.reportsService.generateGeneralReport(startDate, endDate).subscribe({
      next: (response) => {
        this.reportsService.downloadPdf(response, 'reporte_general_sesiones.pdf');
        this.errorMessage = '';
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al generar el reporte', error);
        if (error.status === 404 || (error.error && error.error.message)) {
          this.errorMessage = 'No hay sesiones registradas';
        } else {
          alert('Ocurrió un error al generar el reporte');
        }
      }
    });
  }
  checkSessionsInRange(startDate: string, endDate: string): void {
    this.calendarService.getSessionsByMonth(startDate).subscribe({
      next: (sessions) => {
        const sessionsInRange = sessions.filter(session => session.sessionDate >= startDate && session.sessionDate <= endDate);
        if (sessionsInRange.length === 0) {
          this.showNoDataModal = true;
        } else {
          this.generateReport(startDate, endDate);
        }
      },
      error: (error) => {
        console.error('Error al verificar sesiones:', error);
      }
    });
  }

  openReportModal(): void {
    const modal = document.getElementById('reportModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeNoDataModal(): void {
    this.showNoDataModal = false;
  }

  closeReportModal(): void {
    const modal = document.getElementById('reportModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.showDownloadButton = false;
  }

  downloadReport(): void {
    // Aquí puedes agregar la lógica para descargar el reporte
    console.log('Descargando reporte');
  }
}
