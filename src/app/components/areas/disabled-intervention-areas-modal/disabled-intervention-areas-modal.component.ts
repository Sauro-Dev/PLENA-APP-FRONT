import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AreasService} from "../areas.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-disabled-intervention-areas-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disabled-intervention-areas-modal.component.html',
  styleUrl: './disabled-intervention-areas-modal.component.css'
})
export class DisabledInterventionAreasModalComponent implements OnInit {
  disabledAreas: any[] = [];
  isLoading: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private areasService: AreasService) {}

  ngOnInit(): void {
    this.loadDisabledAreas();
  }

  loadDisabledAreas(): void {
    this.isLoading = true;

    // Llamada al servicio para obtener las áreas deshabilitadas
    this.areasService.getDisabledAreas().subscribe(
      (data) => {
        this.disabledAreas = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al obtener las áreas deshabilitadas:', error);
        this.isLoading = false;
      }
    );
  }

  enableArea(areaId: number): void {
    this.areasService.enableArea(areaId).subscribe(
      () => {
        this.disabledAreas = this.disabledAreas.filter((area) => area.id !== areaId);
      },
      (error) => {
        console.error('Error al habilitar el área:', error);
      }
    );
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
