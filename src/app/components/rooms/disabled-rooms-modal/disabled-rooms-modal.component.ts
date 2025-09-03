import {Component, OnInit, Output} from '@angular/core';
import { EventEmitter } from '@angular/core';
import {RoomsService} from "../rooms.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-disabled-rooms-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disabled-rooms-modal.component.html',
  styleUrl: './disabled-rooms-modal.component.css'
})
export class DisabledRoomsModalComponent implements OnInit {
  disabledRooms: any[] = [];
  isLoading: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private roomsService: RoomsService) {}

  ngOnInit(): void {
    this.loadDisabledRooms();
  }

  loadDisabledRooms(): void {
    this.isLoading = true;
    this.roomsService.getDisabledRooms().subscribe(
      (data) => {
        this.disabledRooms = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar las salas deshabilitadas:', error);
        this.isLoading = false;
      }
    );
  }

  enableRoom(roomId: number): void {
    this.roomsService.enableRoom(roomId).subscribe(
      (response) => {
        console.log(response);
        this.disabledRooms = this.disabledRooms.filter((room) => room.id !== roomId);
      },
      (error) => {
        console.error('Error al habilitar la sala:', error);
      }
    );
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
