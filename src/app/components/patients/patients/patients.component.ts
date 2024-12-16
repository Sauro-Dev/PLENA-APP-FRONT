import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { PatientsService } from "../patients.service";
import { FormsModule } from "@angular/forms";

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
  itemsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private patientService: PatientsService, private router: Router) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe(
      (data) => {
        this.patients = data || []; 
        this.filteredPatients = [...this.patients];
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
    this.paginate();
  }

  // Paginación
  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    const paginatedPatients = this.filteredPatients.slice(startIndex, endIndex);

    if (paginatedPatients.length === 0 && this.currentPage > 1) {
      this.currentPage = 1;
      this.paginate();
    } else {
      this.filteredPatients = paginatedPatients;
    }
  }

  // Función para cambiar de página
  goToPage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

  protected readonly Math = Math;
}
