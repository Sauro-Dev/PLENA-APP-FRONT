import { Component, OnInit } from '@angular/core';
import { PatientsService } from '../patients.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Patient} from "../patient";
import {PlanStatus} from "../plan-status";
import {Plan} from "../plan";
import {PlansService} from "../plans.service";

@Component({
  selector: 'app-patient-details',
  standalone: true,
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css'],
  imports: [RouterLink, NgIf, NgForOf, CommonModule],
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
  plans: Plan[] = [];
  currentPlan: Plan | null = null;
  constructor(
    private patientsService: PatientsService,
    private plansService: PlansService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      // Cargar los planes primero
      this.loadPlans().then(() => {
        this.loadPatient(id);
      });
    } else {
      console.error('ID de paciente no proporcionado.');
      this.router.navigate(['/patients']);
    }
  }

  async loadPlans(): Promise<void> {
    try {
      const plans = await this.plansService.getAllPlans().toPromise();
      if (plans) { // Verificamos que plans no sea undefined
        this.plans = plans.map(plan => ({
          idPlan: Number(plan.id),
          numOfSessions: Number(plan.numOfSessions),
          weeks: Number(plan.weeks),
          name: this.getPlanName(plan.numOfSessions)
        }));
      }
    } catch (error: any) { // Especificamos el tipo como 'any'
      console.error('Error al cargar planes:', error);
      if (error && error.status === 403) {
        this.router.navigate(['/login']);
      }
    }
  }

  loadPatient(id: number): void {
    this.patientsService.getPatientById(id).subscribe(
      (data: Patient) => {
        this.patient = {
          ...data,
          tutors: data.tutors || [],
        };

        // Encontrar el plan actual del paciente
        this.currentPlan = this.plans.find(plan => plan.idPlan === this.patient.planId) || null;

        if (!Object.values(PlanStatus).includes(data.planStatus as PlanStatus)) {
          console.warn(`Estado de plan inválido: ${data.planStatus}`);
        }

        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar los detalles del paciente:', error);
        this.isLoading = false;
      }
    );
  }

  getPlanName(sessions: number): string {
    const planNames = ['A', 'B', 'C', 'D', 'E', 'F'];
    return `Plan ${planNames[sessions - 1]}`;
  }

  getCurrentPlanName(): string {
    if (!this.currentPlan) return 'No asignado';
    return this.getPlanName(this.currentPlan.numOfSessions);
  }

  editPatient(): void {
    if (!this.patient) {
      console.error('El paciente no está cargado.');
      return;
    }
    this.router.navigate(['/patients/edit', this.patient.idPatient]);
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

  renewPlan(): void {
    if (!this.patient || !this.patient.idPatient) {
      console.error('No se puede renovar el plan: paciente no cargado o sin ID.');
      return;
    }
    this.router.navigate(['/patients/renew-plan', this.patient.idPatient]);
  }
}
