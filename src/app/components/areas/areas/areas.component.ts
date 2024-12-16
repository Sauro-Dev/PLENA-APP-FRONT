import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AreasService } from "../areas.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [
    RouterLink, CommonModule, FormsModule
  ],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.css'
})
export class AreasComponent implements OnInit {
  areas: any[] = []; // Lista completa de áreas
  filteredAreas: any[] = []; // Áreas filtradas según la paginación
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Número de elementos por página
  searchQuery: string = ''; // Término de búsqueda
  totalPages: number = 10;
  
  constructor(private areasService: AreasService, private router: Router) {}

  ngOnInit(): void {
    this.loadAreas();
  }

  
  loadAreas(): void {
    this.areasService.getAreas().subscribe(
      (data) => {
        this.areas = data;
        this.applyFilters(); // Aplicar filtros y paginación inicial
      },
      (error) => {
        console.error('Error al obtener las áreas de intervención', error);
      }
    );
  }

  // Aplicar filtros y paginación
  applyFilters(): void {
    let filtered = this.areas;
    if (this.searchQuery) {
      filtered = filtered.filter(area => 
        area.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        area.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.filteredAreas = filtered;
    this.totalPages = Math.ceil(this.filteredAreas.length / this.itemsPerPage);
    this.goToPage(1);
  }

  // Búsqueda de áreas por nombre
  onSearch(): void {
    this.currentPage = 1; // Reiniciar a la primera página
    this.applyFilters(); // Aplicar filtros y actualizar lista
  }

  // Cambiar el número de elementos por página
  paginate(): void {
    this.currentPage = 1; // Reiniciar a la primera página
    this.applyFilters(); // Aplicar filtros y actualizar lista
  }

  // Cambiar de página
  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters(); // Actualizar lista basada en la página seleccionada
  }
  deleteArea(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta área?')) {
      this.areasService.deleteArea(id).subscribe(
        () => {
          this.loadAreas(); // Recargar las áreas después de eliminar
        },
        (error) => {
          console.error('Error al eliminar el área', error);
          // Aquí podrías agregar una notificación al usuario
        }
      );
    }
  }

  protected readonly Math = Math; // Permitir uso de Math en el template
}
