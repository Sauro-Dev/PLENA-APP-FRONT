import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomsService } from "../../rooms.service";
import { Room } from "../../room";
import { StorageService } from "../../../storage/storage.service";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-details-room',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './details-room.component.html',
  styleUrls: ['./details-room.component.css'],
})
export class DetailsRoomComponent implements OnInit {
  room: Room | null = null;
  assignedMaterials: any[] = [];
  isAssignModalOpen = false;


  unassignedMaterials: any[] = [];
  filteredMaterials: any[] = [];
  searchQuery: string = '';
  materialFilter: string ='';

  constructor(
    private route: ActivatedRoute,
    private roomsService: RoomsService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('idRoom');
    if (roomId) {
      this.loadRoomDetails(roomId);
      this.loadAssignedMaterials(roomId);
    }
  }

  // Método para cargar los detalles de la sala
  loadRoomDetails(roomId: string): void {
    this.roomsService.getRoomById(roomId).subscribe(
      (data) => {
        this.room = data;
      },
      (error) => {
        console.error('Error al cargar los detalles del ambiente', error);
      }
    );
  }

  // Método para cargar los materiales asignados a la sala
  loadAssignedMaterials(roomId: string): void {
    this.storageService.getMaterialsByRoom(roomId).subscribe(
      (data) => {
        this.assignedMaterials = data;
        this.filteredMaterials = [...this.assignedMaterials];
      },
      (error) => {
        console.error('Error al cargar los materiales asignados', error);
      }
    );
    this.loadUnassignedMaterials();
  }

  //Metodo para cargar los materiales que no estan asignados a ninguna sala
  loadUnassignedMaterials(): void {
    this.storageService.getUnassignedMaterials().subscribe(
      (data) => {
        this.unassignedMaterials = data;
      },
      (error) => {
        console.error('Error al cargar los materiales no asignados', error);
        alert('Error al cargar los materiales no asignados. Por favor, intenta nuevamente.');
      }
    );
  }

  // Método para desasignar un material
  unassignMaterial(materialId: string): void {
    this.storageService.unassignMaterialFromRoom(materialId).subscribe(
      () => {
        // Después de desasignar, recargar los materiales asignados
        const roomId = this.route.snapshot.paramMap.get('idRoom');
        if (roomId) {
          this.loadAssignedMaterials(roomId);
          this.loadUnassignedMaterials();
        }
      },
      (error) => {
        console.error('Error al desasignar material', error);
      }
    );
  }
  // Metodo para asignar un material
  assignMaterial(materialId: string, roomId: number): void {
    this.storageService.assignMaterialToRoom(materialId, roomId).subscribe(
      () => {
        const roomIdFromRoute = this.route.snapshot.paramMap.get('idRoom');
        if (roomIdFromRoute) {
          this.loadAssignedMaterials(roomIdFromRoute);

          // Actualiza la lista de materiales no asignados en la caché
          this.unassignedMaterials = this.unassignedMaterials.filter(material => material.idMaterial !== materialId);
        }
        this.isAssignModalOpen = false;
      },
      (error) => {
        console.error('Error al asignar material', error);
      }
    );
  }

  // COMPORTAMIENTOS DEL MODAL (CERRAR Y ABRIR MODAL)
  openAssignModal() {
    this.isAssignModalOpen = true;
  }
  closeAssignModal() {
    this.isAssignModalOpen = false;
    this.loadUnassignedMaterials();
  }

  // FILTROS
  onSearch(): void {
    this.filteredMaterials = this.assignedMaterials.filter((material) =>
      material.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  onFilter(): void{
    if (this.materialFilter === '') {
      this.filteredMaterials = this.assignedMaterials;
    } else {
      this.filteredMaterials = this.assignedMaterials.filter((material) =>
        material.estado === this.materialFilter
      );
    }
  }

}
