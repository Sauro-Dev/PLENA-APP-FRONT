import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RoomsService } from '../rooms.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-edit-room',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-room.component.html',
  styleUrl: './edit-room.component.css',
})
export class EditRoomComponent implements OnInit {

  IdRoom: string = '';
  roomForm: FormGroup;

  private roomService = inject(RoomsService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  @ViewChild('nameInput') nameInput: any;
  @ViewChild('addressInput') descriptionInput: any;
  @ViewChild('isTherapeuticInput') isTherapeuticInput: any;

  constructor() {
    this.roomForm = this.fb.group({
      name: [''],
      address: [''],
      isTherapeutic: [''],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.IdRoom = idParam;
      this.loadRoomData();
    }
  }

  onSubmit(): void {
    if (this.roomForm.valid) {
      const updatedRoom = this.roomForm.value;
      this.roomService.updateRoom(this.IdRoom, updatedRoom).subscribe(
        () => {
          alert('Ambiente actualizado correctamente');
          this.location.back();
        },
        (error) => {
          console.error('Error al actualizar el Ambiente:', error);
        }
      );
    }
  }

    loadRoomData(): void {
      this.roomService.getRoomById(this.IdRoom).subscribe(
        (data) => {
          console.log(data);
          this.roomForm.patchValue({ 
            name: data.name,
            address: data.address,
            isTherapeutic: data.isTherapeutic,
          });
      },
      (error) => {
        console.error('Error al cargar el área:', error);
      }
    );
  }
}