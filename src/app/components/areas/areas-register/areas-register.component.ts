import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreasRegisterService } from './areas-register.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-areas-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './areas-register.component.html',
  styleUrls: ['./areas-register.component.css'],
})
export class AreasRegisterComponent implements OnInit {
  areaForm!: FormGroup;
  showRegisterModal: boolean = false;
  showCancelModal: boolean = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private areasRegisterService: AreasRegisterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.areaForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });
  }

  openRegisterModal(): void {
    if (this.areaForm.valid) {
      this.showRegisterModal = true;
    } else {
      this.areaForm.markAllAsTouched();
    }
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  confirmRegister(): void {
    const { name, description } = this.areaForm.value;
    this.areasRegisterService.registerArea(name, description).subscribe(
      (response) => {
        this.successMessage =
          'El área de intervención se ha registrado correctamente.';
        this.errorMessage = '';
        this.closeRegisterModal();
        setTimeout(() => {
          this.successMessage = '';
          this.router.navigate(['/areas']);
        }, 3000);
      },
      (error) => {
        this.errorMessage =
          'Ha ocurrido un error al registrar el área. Por favor, inténtelo de nuevo.';
        this.successMessage = '';
        this.closeRegisterModal();
        console.error('Error al registrar el área', error);
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
    this.router.navigate(['/areas']);
  }
}
