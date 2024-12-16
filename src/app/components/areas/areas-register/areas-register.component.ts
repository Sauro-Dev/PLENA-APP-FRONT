import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { AreasRegisterService } from "./areas-register.service";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-areas-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './areas-register.component.html',
  styleUrls: ['./areas-register.component.css']
})
export class AreasRegisterComponent implements OnInit {
  areaForm!: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private areasRegisterService: AreasRegisterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.areaForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.areaForm.valid) {
      const { name, description } = this.areaForm.value;
      this.areasRegisterService.registerArea(name, description).subscribe(
        (response) => {
          this.successMessage = 'El área de intervención se ha registrado correctamente.';
          this.errorMessage = '';
          setTimeout(() => {
            this.successMessage = '';
            this.router.navigate(['/areas']);
          }, 3000);
        },
        (error) => {
          this.errorMessage = 'Ha ocurrido un error al registrar el área. Por favor, inténtelo de nuevo.';
          this.successMessage = '';
          console.error('Error al registrar el área', error);
        }
      );
    } else {
      this.areaForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    const confirmation = confirm('¿Estás seguro de que deseas cancelar el registro?');
    if (confirmation) {
      this.router.navigate(['/areas']);
    }
  }
}
