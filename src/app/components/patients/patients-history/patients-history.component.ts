import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from "@angular/common";
import { PatientsHistoryService } from "../patients-history.service";
import { PatientsService } from "../patients.service";

@Component({
  selector: 'app-patients-history',
  standalone: true,
  templateUrl: './patients-history.component.html',
  styleUrls: ['./patients-history.component.css'],
  imports: [CommonModule]
})
export class PatientsHistoryComponent implements OnInit {
  patient: any = {};
  history: any[] = [];
  isLoading = true;
  hasMedicalHistory: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private patientsHistoryService: PatientsHistoryService,
    private patientsService: PatientsService
  ) {}

  ngOnInit(): void {
    this.loadPatientHistory();
  }

  loadPatientHistory(): void {
    const patientId = this.route.snapshot.params['id'];
    this.patientsHistoryService.findMedicalHistoryByPatientId(patientId).subscribe({
      next: (data) => {
        console.log('Datos del historial médico:', data); // Log the data for debugging
        this.hasMedicalHistory = data && data.idMedicalHistory !== undefined;
        console.log('¿El paciente tiene historial médico?', this.hasMedicalHistory); // Log if the patient has medical history
        if (this.hasMedicalHistory) {
          this.patient = { name: data.patientName }; // Assuming the response contains patientName
          this.history = [data];
        } else {
          this.loadPatientDetails(patientId);
          this.history = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el historial del paciente', error);
        this.isLoading = false;
      }
    });
  }

  loadPatientDetails(patientId: number): void {
    this.patientsService.getPatientById(patientId).subscribe({
      next: (patientData) => {
        this.patient = { name: patientData.name || 'Unknown' };
      },
      error: (error) => {
        console.error('Error al cargar los detalles del paciente', error);
        this.patient = { name: 'Unknown' };
      }
    });
  }

  createMedicalHistory(): void {
    const patientId = this.route.snapshot.params['id'];
    if (this.hasMedicalHistory) {
      this.errorMessage = 'El paciente ya tiene un historial médico.';
      return;
    }
    const newHistory = { idPatient: patientId, name: 'Historia Clínica General' };
    this.patientsHistoryService.registerMedicalHistory(newHistory).subscribe({
      next: (data) => {
        console.log('Historial Médico creado', data);
        this.loadPatientHistory(); // Reload the patient history after creation
      },
      error: (error) => {
        console.error('Error al crear el historial médico', error);
        this.errorMessage = 'Error al crear el historial médico. Por favor, inténtelo de nuevo.';
      }
    });
  }
}
