import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { StorageService } from '../storage.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-material-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './material-register.component.html',
  styleUrls: ['./material-register.component.css'],
})
export class MaterialRegisterComponent {
  registerForm: FormGroup;
  estados: string[] = ['NUEVO', 'BUENO', 'REGULAR', 'DESGASTADO', 'ROTO'];

  // Estado para modales
  showRegisterModal = false;
  showCancelModal = false;

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      estado: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      esCompleto: [false],
      esSoporte: [false],
      descripcion: [''],
    });
  }

  openRegisterModal(): void {
    if (this.registerForm.valid) {
      this.showRegisterModal = true;
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  confirmRegister(): void {
    const formValue = this.registerForm.value;

    this.storageService.registerMaterial(formValue).subscribe(
      () => {
        this.closeRegisterModal();
        this.router.navigate(['/storage']);
      },
      (error) => {
        console.error('Error al registrar el material', error);
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
    this.registerForm.reset();
    this.router.navigate(['/storage']);
  }
}
