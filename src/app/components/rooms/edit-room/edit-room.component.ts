import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomsService } from '../rooms.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-edit-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-room.component.html',
  styleUrls: ['./edit-room.component.css'],
})
export class EditRoomComponent implements OnInit {
  IdRoom: string = '';
  roomForm: FormGroup;
  showSaveModal: boolean = false;
  showCancelModal: boolean = false;
  enabled: boolean = true;

  private roomService = inject(RoomsService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  constructor() {
    this.roomForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      isTherapeutic: [false],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.IdRoom = idParam;
      this.loadRoomData();
    }
  }

  loadRoomData(): void {
    this.roomService.getRoomById(this.IdRoom).subscribe(
      (data) => {
        this.roomForm.patchValue({
          name: data.name,
          address: data.address,
          isTherapeutic: data.isTherapeutic,
        });
        this.enabled = data.enabled;
      },
      (error) => {
        console.error('Error al cargar el ambiente:', error);
      }
    );
  }

  changeRoomStatus(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.roomService.enableRoom(Number(this.IdRoom)).subscribe(() => {
        this.enabled = true;
        console.log('Sala habilitada correctamente.');
      });
    } else {
      this.roomService.disableRoom(Number(this.IdRoom)).subscribe(() => {
        this.enabled = false;
        console.log('Sala deshabilitada correctamente.');
      });
    }
  }


  openSaveModal(): void {
    this.showSaveModal = true;
  }

  closeSaveModal(): void {
    this.showSaveModal = false;
  }

  confirmSave(): void {
    this.showSaveModal = false;
    this.onSubmit();
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancel(): void {
    this.showCancelModal = false;
    this.location.back();
  }

  onSubmit(): void {
    if (this.roomForm.valid) {
      const updatedRoom = this.roomForm.value;
      this.roomService.updateRoom(this.IdRoom, updatedRoom).subscribe(
        () => {
          this.location.back();
        },
        (error) => {
          console.error('Error al actualizar el Ambiente:', error);
        }
      );
    }
  }
}
