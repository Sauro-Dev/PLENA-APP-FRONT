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
          alert('Sala registrada correctamente');
          this.router.navigate(['/rooms']);
        },
        (error) => {
          console.error('Error al registrar la sala', error);
          alert('Hubo un error al registrar la sala');
        }
      );
    }
  }

  onCancel(): void {
    const confirmCancel = confirm(
      '¿Estás seguro de que deseas cancelar el registro?'
    );
    if (confirmCancel) {
      this.roomForm.reset();
      this.router.navigate(['/rooms']);
    }
  }
}
