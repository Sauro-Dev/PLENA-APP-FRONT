import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Material } from '../material';
import { StorageService } from '../storage.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-storage',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css'],
})
export class StorageComponent implements OnInit {
  materials: Material[] = [];
  filteredMaterials: Material[] = [];
  searchTerm: string = '';
  itemsPerPage: number = 10;
  currentPage: number = 1;
  paginatedMaterials: Material[] = [];
  materialFilter: string = '';
  showFilters: boolean = false;

  // Variable para almacenar el ID del material seleccionado para eliminar
  selectedMaterialId: string | null = null;

  constructor(private storageService: StorageService, private router: Router) {}

  ngOnInit() {
    this.loadMaterials();
  }

  // Cargar materiales desde el servicio
  loadMaterials(): void {
    this.storageService.getMaterials().subscribe((materials: Material[]) => {
      this.materials = materials;
      this.filteredMaterials = [...this.materials];
      this.paginate();
    });
  }

  // Búsqueda en los materiales
  onSearch(): void {
    if (this.searchTerm.trim() === '') {
      this.filteredMaterials = [...this.materials];
    } else {
      this.filteredMaterials = this.materials.filter(
        (material) =>
          material.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          material.estado.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.paginate();
  }

  // Paginación
  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedMaterials = this.filteredMaterials.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  // Navegación entre páginas
  goToPage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

  // Filtros por estado
  onFilter(): void {
    if (this.materialFilter === '') {
      this.filteredMaterials = this.materials;
      this.paginate();
    } else {
      this.filteredMaterials = this.materials.filter(
        (material) => material.estado === this.materialFilter
      );
      this.paginate();
    }
  }

  // Mostrar/ocultar filtros
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Navega al formulario de edición de un material
  navigateToEdit(id: string | undefined): void {
    this.router.navigate([`/storage/material-edit`, id]);
  }

  // Abrir modal de confirmación para la eliminación
  confirmDelete(id: string | undefined): void {
    this.selectedMaterialId = id || null;
  }

  // Eliminar un material
  delete(): void {
    if (this.selectedMaterialId === null) {
      return;
    }
    this.storageService.deleteMaterial(this.selectedMaterialId).subscribe(
      () => {
        this.loadMaterials();
        this.selectedMaterialId = null; // Oculta el modal tras eliminar
      },
      (error) => {
        console.error('Error al eliminar un material', error);
      }
    );
  }

  protected readonly Math = Math;
}
