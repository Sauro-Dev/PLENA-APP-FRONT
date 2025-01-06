import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { PatientsService } from "../patients.service";
import { FormsModule } from "@angular/forms";
import {filter} from "rxjs/operators";
import {Material} from "../../storage/material";

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [RouterLink, RouterModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];

  filteredPatients: any[] = [];
  searchQuery: string = '';
  itemsPerPage: number = 12;
  currentPage: number = 1;
  paginatedPatients: any[] = [];
  showFilters: boolean = false;  // Nuevo para manejar el desplegable de filtros en móvil

  constructor(private patientService: PatientsService, private router: Router) {}

  ngOnInit(): void {
    this.loadPatients();
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

  protected readonly Math = Math;
  protected readonly filter = filter;
}
