import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AreasService } from '../areas.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
@Component({
  selector: 'app-area-edit',
  templateUrl: './area-edit.component.html',
  styleUrls: ['./area-edit.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
})
export class AreaEditComponent implements OnInit {
  areaId: string = '';
  areaForm: FormGroup;
  showConfirmModal: boolean = false;
  showCancelModal: boolean = false;

  private areaService = inject(AreasService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  constructor() {
    this.areaForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      enabled: [true],
    });
  }

  ngOnInit(): void {
    this.areaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.areaId) {
      this.loadAreaData();
    }
  }

  loadAreaData(): void {
    this.areaService.getAreaById(this.areaId).subscribe(
      (data) => {
        this.areaForm.patchValue({
          name: data.name,
          description: data.description,
          enabled: data.enabled,
        });
      },
      (error) => {
        console.error('Error al cargar el área:', error);
      }
    );
  }

  openConfirmModal(): void {
    if (this.areaForm.valid) {
      this.showConfirmModal = true;
    } else {
      this.areaForm.markAllAsTouched();
    }
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
  }

  confirmEdit(): void {
    const updatedArea = this.areaForm.value;
    this.areaService.update(this.areaId, updatedArea).subscribe(
      () => {
        this.closeConfirmModal();
        this.location.back();
      },
      (error) => {
        console.error('Error al actualizar el área:', error);
      }
    );
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancel(): void {
    this.closeCancelModal();
    this.location.back();
  }
}
