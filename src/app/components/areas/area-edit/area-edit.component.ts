import { Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AreasService } from '../areas.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
@Component({
  selector: 'app-area-edit',
  templateUrl: './area-edit.component.html',
  styleUrls: ['./area-edit.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  standalone: true, 
})
export class AreaEditComponent implements OnInit {
  areaId: string = '';
  areaForm: FormGroup;

  private areaService = inject(AreasService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private location = inject(Location);


  @ViewChild('nameInput') nameInput: any;
  @ViewChild('descriptionInput') descriptionInput: any;

  constructor() {

    this.areaForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
    this.areaId = '';
  }

  ngOnInit(): void {
    this.areaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.areaId) {
      this.loadAreaData();
    }
  }

  

  onSubmit(): void {
    if (this.areaForm.valid) {
      const updatedArea = this.areaForm.value;
      this.areaService.update(this.areaId, updatedArea).subscribe(
        () => {
          alert('Área actualizada correctamente');
          this.location.back();
        },
        (error) => {
          console.error('Error al actualizar el área:', error);
        }
      );
    }
  }
  loadAreaData(): void {
    this.areaService.getAreaById(this.areaId).subscribe(
      (data) => {
        this.areaForm.patchValue({ 
          name: data.name,
          description: data.description,
        });
      },
      (error) => {
        console.error('Error al cargar el área:', error);
      }
    );
  }
  
}