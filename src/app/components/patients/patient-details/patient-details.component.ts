import { Component, OnInit } from '@angular/core';
import { PatientsService } from '../patients.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Patient} from "../patient";
import {PlanStatus} from "../plan-status";
import {firstValueFrom} from "rxjs";

@Component({
  selector: 'app-patient-details',
  standalone: true,
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css'],
  imports: [NgIf, NgForOf, CommonModule],
})
export class PatientDetailsComponent implements OnInit {
  patient: Patient = {
    idPatient: 0,
    name: '',
    paternalSurname: '',
    maternalSurname: '',
    dni: '',
    birthdate: '',
    age: 0,
    planId: 0,
    planStatus: PlanStatus.EN_ESPERA,
    tutors: [],
    presumptiveDiagnosis: '',
    status: false,
  };
  isLoading: boolean = true;

  constructor(
    private patientsService: PatientsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      void this.loadPatient(id);
    } else {
      console.error('ID de paciente no proporcionado.');
      void this.router.navigate(['/patients']);
    }
  }

  async loadPatient(id: number): Promise<void> {
    try {
      const data = await firstValueFrom(this.patientsService.getPatientById(id));
      this.patient = {
        ...data,
        tutors: data.tutors || [],
      };

      if (!Object.values(PlanStatus).includes(data.planStatus as PlanStatus)) {
        console.warn(`Estado de plan inválido: ${data.planStatus}`);
      }

      this.isLoading = false;
    } catch (error) {
      console.error('Error al cargar los detalles del paciente:', error);
      this.isLoading = false;
    }
  }

  goBack(): void {
    void this.router.navigate(['/patients']);
  }

  goToMedicalHistory(): void {
    void this.router.navigate(['/patients/details', this.patient.idPatient, 'medical-history']);
  }

  editPatient(): void {
    if (!this.patient) {
      console.error('El paciente no está cargado.');
      return;
    }
    void this.router.navigate(['/patients/edit', this.patient.idPatient]);
  }

  renewPlan(): void {
    if (!this.patient?.idPatient) {
      console.error('No se puede renovar el plan: paciente no cargado o sin ID.');
      return;
    }
    void this.router.navigate(['/patients/renew-plan', this.patient.idPatient]);
  }

  getPlanStatusLabel(status: PlanStatus): string {
    switch (status) {
      case PlanStatus.EN_ESPERA:
        return 'En Espera';
      case PlanStatus.EN_CURSO:
        return 'En Curso';
      case PlanStatus.COMPLETADO:
        return 'Completado';
      default:
        return 'Desconocido';
    }
  }
}
