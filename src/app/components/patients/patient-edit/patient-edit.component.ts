import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../patients.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RegisterPatient } from '../register-patient';

@Component({
  selector: 'app-patient-edit',
  standalone: true,
  templateUrl: './patient-edit.component.html',
  styleUrls: ['./patient-edit.component.css'],
  imports: [
    FormsModule,
    NgIf
  ]
})
export class PatientEditComponent implements OnInit {
  patient: RegisterPatient | null = null; // Usamos RegisterPatient para la edición
  isLoading: boolean = true;
  isSaving: boolean = false;

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
      this.router.navigate(['/patients']);
    }
  }

  // Método para cargar los detalles del paciente
  loadPatient(id: number): void {
    this.patientsService.getPatientById(id).subscribe(
      (data) => {
        this.patient = {
          name: data.name,
          paternalSurname: data.paternalSurname,
          maternalSurname: data.maternalSurname || '',
          dni: data.dni || '',
          birthDate: new Date(data.birthdate), // Convertimos a Date
          age: data.age,
          allergies: data.allergies || '',
          idPlan: data.idPlan || 0,
          tutors: data.tutors || [] // Aseguramos que siempre sea un array
        };
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar los detalles del paciente:', error);
        this.isLoading = false;
      }
    );
  }

  // Método para guardar los cambios
  savePatient(): void {
    if (!this.patient) {
      console.error('El paciente no está cargado.');
      return;
    }

    this.isSaving = true;

    this.patientsService.updatePatient(this.route.snapshot.params['id'], this.patient).subscribe(
      () => {
        this.isSaving = false;
        alert('Paciente actualizado con éxito.');
        this.router.navigate(['/patients/details', this.route.snapshot.params['id']]);
      },
      (error) => {
        console.error('Error al actualizar el paciente:', error);
        this.isSaving = false;
      }
    );
  }

  // Método para cancelar la edición
  cancel(): void {
    if (confirm('¿Deseas cancelar los cambios y volver?')) {
      this.router.navigate(['/patients/details', this.route.snapshot.params['id']]);
    }
  }
}
