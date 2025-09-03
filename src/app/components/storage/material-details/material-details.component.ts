import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StorageService } from '../storage.service';
import { Material } from '../material';
import { AreaInterventionResponse } from '../areaIntervention';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-material-details',
  templateUrl: './material-details.component.html',
  styleUrls: ['./material-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class MaterialDetailsComponent implements OnInit {
  material: Material | null = null;
  allInterventionAreas: AreaInterventionResponse[] = [];
  interventionAreas: AreaInterventionResponse[] = [];
  isAssignInterAreaModalOpen = false;
  isLoading = false; // Variable para manejar el estado de carga

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const idMaterial = this.route.snapshot.paramMap.get('idMaterial');
    if (idMaterial) {
      this.loadMaterialDetails(idMaterial);
      this.loadInterventionAreas(idMaterial);
      this.getInterventionAreas(idMaterial);
      this.getAllInterventionAreas();
    }
  }

  getAllInterventionAreas(): void {
    this.storageService.getAllInterventionAreas().subscribe(
      (data) => {
        // Filtra todas las áreas para quedarnos solo con las que no están asignadas a ningún material
        this.allInterventionAreas = data.filter((area) => !area.assignedTo);
      },
      (error) => {
        console.error(
          'Error al obtener todas las áreas de intervención:',
          error
        );
      }
    );
  }

  // Método para desasignar un material
  unassignInterArea(area: AreaInterventionResponse): void {
    const idMaterial = this.route.snapshot.paramMap.get('idMaterial');
    if (idMaterial) {
      this.isLoading = true; // Activar el estado de carga
      this.storageService.unassignInterArea(idMaterial, area).subscribe(
        () => {
          // Recargar las áreas de intervención después de desasignar
          this.loadInterventionAreas(idMaterial);
          this.isLoading = false; // Desactivar el estado de carga
        },
        (error) => {
          console.error('Error al desasignar material', error);
          this.isLoading = false; // Desactivar el estado de carga en caso de error
        }
      );
    }
  }

  getInterventionAreas(idMaterial: string): void {
    this.storageService.getInterventionAreas(idMaterial).subscribe(
      (data) => {
        this.interventionAreas = data; // Asignamos las áreas de intervención a la variable
      },
      (error) => {
        console.error('Error al obtener áreas de intervención:', error);
      }
    );
  }

  // Método para cargar los detalles del material
  loadMaterialDetails(idMaterial: string): void {
    this.storageService.getMaterialById(idMaterial).subscribe(
      (data) => {
        this.material = data;
      },
      (error) => {
        console.error('Error al cargar los detalles del material', error);
      }
    );
  }

  // Método para abrir el modal de asignación
  openAssignModal(): void {
    // Filtrar áreas no asignadas dentro del total: eliminamos las que están en this.interventionAreas
    const filteredAreas = this.allInterventionAreas.filter(
      (area) =>
        !this.interventionAreas.some(
          (assignedArea) => assignedArea.id === area.id
        ) // Excluir las áreas ya asignadas al material actual
    );

    this.allInterventionAreas = filteredAreas;
    this.isAssignInterAreaModalOpen = true; // Abre el modal
  }

  // Método para cerrar el modal de asignación
  closeAssignModal() {
    this.isAssignInterAreaModalOpen = false;
  }

  // Método para cargar las áreas de intervención
  loadInterventionAreas(materialId: string): void {
    this.isLoading = true; // Activar el estado de carga antes de la solicitud
    this.storageService.getInterventionAreas(materialId).subscribe(
      (data) => {
        this.interventionAreas = data;
        this.isLoading = false; // Desactivar el estado de carga después de obtener los datos
      },
      (error) => {
        console.error('Error al cargar las áreas de intervención:', error);
        this.isLoading = false; // Desactivar el estado de carga en caso de error
      }
    );
  }

  assignMaterialInterArea(area: AreaInterventionResponse): void {
    const idMaterial = this.route.snapshot.paramMap.get('idMaterial');
    if (idMaterial) {
      this.isLoading = true; // Activar el estado de carga

      this.storageService.assignMaterialInterArea(idMaterial, +area.id).subscribe(
        () => {
          // Recargar las áreas de intervención después de asignar
          this.loadInterventionAreas(idMaterial);
          this.isLoading = false; // Desactivar el estado de carga
        },
        (error) => {
          console.error('Error asignando el área al material:', error);
          this.isLoading = false; // Desactivar el estado de carga en caso de error
        }
      );
    }
  }
}
