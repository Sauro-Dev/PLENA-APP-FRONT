import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { PatientsService } from "../patients.service";
import {filter} from "rxjs/operators";
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import {PlansService} from "../plans.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [RouterLink, RouterModule, HttpClientModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];

  existingPlans: number[] = []; // Para almacenar las sesiones que ya existen
  filteredPatients: any[] = [];
  searchQuery: string = '';
  itemsPerPage: number = 12;
  currentPage: number = 1;
  paginatedPatients: any[] = [];
  showFilters: boolean = false;  // Nuevo para manejar el desplegable de filtros en móvil

  showPlanModal: boolean = false;
  planForm: FormGroup;
  showViewPlansModal: boolean = false;
  plans: any[] = [];

  constructor(
    private patientService: PatientsService,
    private plansService: PlansService,  // Cambiado a plansService
    private router: Router,
    private fb: FormBuilder
  ) {
    this.planForm = this.fb.group({
      numOfSessions: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(6)
      ]]
    });
  }


  ngOnInit(): void {
    this.loadPatients();
    this.loadPlans();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe(
      (data) => {
        this.patients = data || [];
        this.filteredPatients = [...this.patients];
        this.paginate();
      },
      (error) => {
        console.error('Error al obtener los pacientes:', error);
        if (error.status === 400) {
          console.error('Solicitud incorrecta. Verifica el modelo.');
        } else if (error.status === 403) {
          console.error('Acceso denegado. Redirigiendo al login.');
          this.router.navigate(['/login']);
        }
      }
    );
  }

  // Función de búsqueda
  onSearch(): void {
    this.filteredPatients = this.patients.filter(patient =>
      patient.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      patient.paternalSurname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      patient.dni.toString().includes(this.searchQuery)
    );
    this.currentPage = 1;
    this.paginate();
  }

  // Función de cambio de número de ítems por página
  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.paginate();
  }

  // Paginación
  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedPatients = this.filteredPatients.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  openPlanModal(): void {
    this.loadPlans(); // Añadir esta línea
    this.showPlanModal = true;
  }

  closePlanModal(): void {
    this.showPlanModal = false;
    this.planForm.reset();
  }

  getPlanName(sessions: number): string {
    const planNames = ['A', 'B', 'C', 'D', 'E', 'F'];
    return `Plan ${planNames[sessions - 1]}`;
  }

  loadPlans(): void {
    this.plansService.getAllPlans().subscribe({
      next: (plans) => {
        this.plans = plans
          .map(plan => ({
            ...plan,
            name: this.getPlanName(plan.numOfSessions)
          }))
          .sort((a, b) => a.numOfSessions - b.numOfSessions);

        // Guardar las sesiones existentes
        this.existingPlans = plans.map(plan => plan.numOfSessions);
      },
      error: (error) => {
        // ... manejo de error existente ...
      }
    });
  }

  // Método para verificar si un número de sesiones ya existe
  isExistingPlan(sessions: number): boolean {
    return this.existingPlans.includes(sessions);
  }

  openViewPlansModal(): void {
    this.showViewPlansModal = true;
    this.loadPlans();
  }

  closeViewPlansModal(): void {
    this.showViewPlansModal = false;
  }

  savePlan(): void {
    if (this.planForm.valid) {
      const planData = {
        numOfSessions: Number(this.planForm.value.numOfSessions)
      };

      this.plansService.createPlan(planData).subscribe({
        next: () => {
          // Primero actualizamos la lista de planes
          this.loadPlans();

          // Luego cerramos el modal y mostramos el mensaje de éxito
          this.closePlanModal();
          Swal.fire({
            title: '¡Éxito!',
            text: 'Plan registrado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#1e40af'
          });
        },
        error: (error) => {
          if (error.status === 403) {
            this.router.navigate(['/login']);
          } else {
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error al registrar el plan',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#1e40af'
            });
          }
        }
      });
    }
  }

  protected readonly Math = Math;
}
