import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users/users.service';
import { NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  imports: [
    NgForOf,
    FormsModule
  ],
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  therapists: { id: string; name: string }[] = [];
  selectedTherapistId: string = '';
  startDate: string = '';
  endDate: string = '';
  showDownloadButton: boolean = false;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.usersService.getTherapists().subscribe(therapists => {
      this.therapists = therapists;
    });
  }

  onTherapistChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTherapistId = selectElement.value;
    console.log('Selected Therapist ID:', this.selectedTherapistId);
  }

  openReportModal(): void {
    const modal = document.getElementById('reportModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeReportModal(): void {
    const modal = document.getElementById('reportModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.showDownloadButton = false;
  }

  generateReport(): void {
    // Aquí puedes agregar la lógica para generar el reporte basado en las fechas seleccionadas
    console.log('Generando reporte desde', this.startDate, 'hasta', this.endDate);
    this.showDownloadButton = true;
  }

  downloadReport(): void {
    // Aquí puedes agregar la lógica para descargar el reporte
    console.log('Descargando reporte');
  }
}
