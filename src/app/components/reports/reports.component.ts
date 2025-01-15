import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users/users.service';
import {CommonModule, NgForOf} from '@angular/common';
import { ReportsService } from './reports.service';
import { FormsModule } from '@angular/forms';
import {HttpErrorResponse} from "@angular/common/http";

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

  showNoDataModal: boolean = false;

  constructor(
    private usersService: UsersService,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    // Opcional: establecer fechas por defecto para el mes anterior
    const today = new Date();
    const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    this.generalStartDate = this.formatDate(firstDayOfPreviousMonth);
    this.generalEndDate = this.formatDate(lastDayOfPreviousMonth);
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
      // Validar que ambas fechas estén seleccionadas
      if (!this.generalStartDate || !this.generalEndDate) {
        alert('Por favor, seleccione ambas fechas');
        return;
      }

      startDate = this.generalStartDate;
      endDate = this.generalEndDate;
    }

    this.reportsService.generateGeneralReport(startDate, endDate).subscribe({
      next: (response) => {
        this.reportsService.downloadPdf(response, 'reporte_general_sesiones.pdf');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al generar el reporte', error);

        if (error.status === 404 || (error.error && error.error.message)) {
          this.showNoDataModal = true;
        } else {
          alert('Ocurrió un error al generar el reporte');
        }
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

  generateReport(): void {
    if (this.selectedTherapistId) {
      this.reportsService.generateTherapistReport(
        Number(this.selectedTherapistId),
        this.startDate,
        this.endDate
      ).subscribe({
        next: () => {
          this.closeReportModal();
        },
        error: (error) => {
          console.error('Error generando reporte:', error);
        }
      });
    } else {
      // Reporte general
      this.reportsService.generateGeneralReport(
        this.startDate,
        this.endDate
      ).subscribe({
        next: () => {
          this.closeReportModal();
        },
        error: (error) => {
          console.error('Error generando reporte:', error);
        }
      });
    }
  }

  downloadReport(): void {
    // Aquí puedes agregar la lógica para descargar el reporte
    console.log('Descargando reporte');
  }
}
