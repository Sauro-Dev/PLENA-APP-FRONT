import { Component } from '@angular/core';
import { RegisterService } from './register.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedRole: string | null = null;
  isAdminSelected: boolean = false;

  showAdminDialog: boolean = false;
  adminPassword: string = '';

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        username: [''],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
        name: [''],
        paternalSurname: ['', Validators.required],
        maternalSurname: ['', Validators.required],
        dni: ['', [Validators.required, Validators.pattern('\\d{8}')]],
        email: [
          '',
          [
            Validators.required, Validators.email,
            Validators.pattern(
              /^[a-zA-ZñÑ0-9._%+-]+@[a-zA-ZñÑ0-9.-]+\.[a-zA-Z]{2,4}$/
            ),
          ],
        ],
        address: [''],
        birthdate: ['', Validators.required],
        phone: ['', Validators.required],
        phoneBackup: ['', Validators.required],
        role: ['', Validators.required],
        isAdmin: [false],
        paymentPerSession: [null],
        paymentPerMonth: [null],
        adminPassword: [''],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password && confirmPassword && password !== confirmPassword
      ? { passwordsDontMatch: true }
      : null;
  }

  selectRole(role: string): void {
    let backendRole: string;

    if (role === 'Terapeuta') {
      backendRole = 'THERAPIST';
    } else if (role === 'Secretario/a') {
      backendRole = 'SECRETARY';
    } else if (role === 'Admin') {
      backendRole = 'ADMIN';
    } else {
      backendRole = '';
    }

    this.selectedRole = role;
    this.registerForm.patchValue({ role: backendRole });

    this.registerForm.get('paymentPerSession')?.clearValidators();
    this.registerForm.get('paymentPerMonth')?.clearValidators();

    if (role === 'Terapeuta') {
      this.registerForm.get('paymentPerSession')?.setValidators([Validators.min(1)]);
    } else if (role === 'Secretario/a') {
      this.registerForm.get('paymentPerMonth')?.setValidators([Validators.min(1)]);
    }
    

    this.registerForm.get('paymentPerSession')?.updateValueAndValidity();
    this.registerForm.get('paymentPerMonth')?.updateValueAndValidity();

    this.registerForm.get('adminPassword')?.clearValidators();
    this.registerForm.get('adminPassword')?.updateValueAndValidity();
  }

  promptAdminPassword(event: MouseEvent): void {
    if (event) {
      event.preventDefault();
    }
  
    this.registerForm.patchValue({ adminPassword: '' });
  
    this.registerForm
      .get('adminPassword')
      ?.setValidators([Validators.required]);
    this.registerForm.get('adminPassword')?.updateValueAndValidity();
  
    this.showAdminDialog = true;
  }

  toggleAdminSelection(event: MouseEvent): void {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      this.promptAdminPassword(event);
    } else {
      this.isAdminSelected = false;
      this.registerForm.patchValue({ isAdmin: false });
    }
  }

  confirmAdminPassword(): void {
    const adminPassword = this.registerForm.get('adminPassword')?.value;

    if (adminPassword === 'admin123') {
      this.isAdminSelected = true;
      this.registerForm.patchValue({ isAdmin: true });
      this.showAdminDialog = false;

      this.registerForm.get('adminPassword')?.clearValidators();
      this.registerForm.get('adminPassword')?.updateValueAndValidity();
    } else {
      alert('Contraseña incorrecta');
    }
  }

  cancelAdminDialog(): void {
    this.showAdminDialog = false;
    this.isAdminSelected = false;
    this.registerForm.patchValue({ isAdmin: false });

    this.registerForm.get('adminPassword')?.clearValidators();
    this.registerForm.get('adminPassword')?.updateValueAndValidity();
  }

  onSubmit(): void {
    
    if (this.registerForm.valid) {
      const confirmed = window.confirm(
        '¿Estás seguro de que deseas guardar este registro?'
      );

      if (confirmed) {
        const formValue = this.registerForm.value;

        if (this.selectedRole === 'Terapeuta') {
          formValue.paymentPerSession = formValue.paymentPerSession 
          ? (Number(formValue.paymentPerSession) * 1.0) 
          : null;
          formValue.paymentPerMonth = null;
        } else if (this.selectedRole === 'Secretario/a') {
          formValue.paymentPerMonth = formValue.paymentPerMonth 
          ? (Number(formValue.paymentPerMonth) * 1.0) 
          : 0.0;
          formValue.paymentPerSession = null;
        } else {
          formValue.paymentPerSession = null;
          formValue.paymentPerMonth = null;
        }

        this.registerService.registerUser(formValue).subscribe(
          (response) => {
            this.router.navigate(['/users']);
          },
          (error) => {
            console.error('Error al registrar', error);
          }
        );
      }
    } else {
      console.error('Formulario inválido');
    }
  }

  onCancel(): void {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas cancelar el registro?'
    );

    if (confirmed) {
      this.router.navigate(['/users']);
    }
  }
}
