import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Room } from '../room';
import { RoomsService } from '../rooms.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-room',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-room.component.html',
  styleUrls: ['./add-room.component.css'],
})
export class AddRoomComponent {
  roomForm: FormGroup;
  showRegisterModal: boolean = false;
  showCancelModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private roomsService: RoomsService,
    private router: Router
  ) {
    this.roomForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      isTherapeutic: [false],
    });
  }

  onSubmit(): void {
    if (this.roomForm.valid) {
      const newRoom: Room = this.roomForm.value;

      this.roomsService.registerRoom(newRoom).subscribe(
        (room) => {
          this.router.navigate(['/rooms']);
        },
        (error) => {
          console.error('Error al registrar la sala', error);
        }
      );
    } else {
      this.roomForm.markAllAsTouched();
    }
  }

  // Abrir modal de registro
  openRegisterModal(): void {
    this.showRegisterModal = true;
  }

  // Cerrar modal de registro
  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  // Confirmar registro
  confirmRegister(): void {
    this.closeRegisterModal();
    if (this.roomForm.valid) {
      const newRoom: Room = this.roomForm.value;
      this.roomsService.registerRoom(newRoom).subscribe(
        (room) => {
          this.router.navigate(['/rooms']);
        },
        (error) => {
          console.error('Error al registrar la sala:', error);
        }
      );
    } else {
      this.roomForm.markAllAsTouched();
    }
  }

  // Abrir modal de cancelación
  openCancelModal(): void {
    this.showCancelModal = true;
  }

  // Cerrar modal de cancelación
  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  // Confirmar cancelación
  confirmCancel(): void {
    this.closeCancelModal();
    this.roomForm.reset();
    this.router.navigate(['/rooms']);
  }
}
