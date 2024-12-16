import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../storage.service';
import { Material } from '../material';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-material-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './material-edit.component.html',
  styleUrls: ['./material-edit.component.css'],
})
export class MaterialEditComponent implements OnInit {
  material: Material | undefined;
  editForm: FormGroup;
  estados: string[] = ['NUEVO', 'BUENO', 'REGULAR', 'DESGASTADO', 'ROTO'];  // Aquí defines la propiedad 'estados'

  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      estado: ['', Validators.required],  // Estado es requerido
      stock: [0, [Validators.required, Validators.min(0)]],
      esCompleto: [false],
      esSoporte: [false],
    });
  }

  ngOnInit(): void {
    const idMaterial = this.route.snapshot.paramMap.get('idMaterial');
    if (idMaterial) {
      this.storageService.getMaterialById(idMaterial).subscribe(
        (material) => {
          this.material = material;
          this.editForm.patchValue(material);
        },
        (error) => {
          console.error('Error al obtener el material:', error);
        }
      );
    }
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const updatedMaterial = { ...this.material, ...this.editForm.value };
      const idMaterial = this.material?.idMaterial;
      if (idMaterial) {
        this.storageService.updateMaterial(idMaterial, updatedMaterial).subscribe(
          () => {
            alert('Material actualizado correctamente');
            this.router.navigate(['/storage']);
          },
          (error) => {
            console.error('Error al actualizar el material:', error);
          }
        );
      }
    }
  }
}
