import { Component, OnInit } from '@angular/core';
import { PatientsService } from '../patients.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-patient-details',
  standalone: true,
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css'],
  imports: [RouterLink, NgIf, NgForOf, CommonModule],
})
export class PatientDetailsComponent implements OnInit {
  patient: any = null; // Detalles del paciente
  isLoading: boolean = true; // Estado de carga

  constructor(
    private patientsService: PatientsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id']; // Obtener ID de la URL
    if (id) {
      this.loadPatient(id);
    } else {
      console.error('ID de paciente no proporcionado.');
      this.router.navigate(['/patients']); // Redirigir si no hay ID
    }
  }

  // Método para cargar los detalles del paciente
  loadPatient(id: number): void {
    this.patientsService.getPatientById(id).subscribe(
      (data) => {
        this.patient = {
          ...data,
          tutors: data.tutors || [],
        };
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar los detalles del paciente:', error);
        this.isLoading = false;
      }
    );
  }

  // Método para redirigir al formulario de edición
  editPatient(): void {
    if (!this.patient) {
      console.error('El paciente no está cargado.');
      return;
    }
    this.router.navigate(['/patients/edit', this.patient.idPatient]);
  }

  // Método para redirigir al historial médico en una nueva pestaña
  viewMedicalHistory(): void {
    if (!this.patient) {
      console.error('El paciente no está cargado.');
      return;
    }
    const url = `/patients/history/${this.patient.idPatient}`;
    window.open(url, '_blank');
  }
}
