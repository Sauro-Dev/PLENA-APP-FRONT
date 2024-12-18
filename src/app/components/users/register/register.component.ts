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
  maxDate: string;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private router: Router
  ) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];

    this.registerForm = this.fb.group(
      {
        username: ['', Validators.required],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
        name: ['', Validators.required],
        paternalSurname: ['', Validators.required],
        maternalSurname: ['', Validators.required],
        dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.pattern(
              /^[a-zA-ZñÑ0-9._%+-]+@[a-zA-ZñÑ0-9.-]+\.[a-zA-Z]{2,4}$/
            ),
          ],
        ],
        address: ['', Validators.required],
        birthdate: ['', [Validators.required, this.dateRangeValidator]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
        phoneBackup: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{9}$')],
        ],
        role: ['', Validators.required],
        isAdmin: [false],
        paymentSession: [null],
        paymentMonth: [null],
        adminPassword: [''],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const date = new Date(control.value);
    const minDate = new Date('1900-01-01');
    const maxDate = new Date();

    if (date < minDate || date > maxDate) {
      return { outOfRange: true };
    }

    return null;
  }

  passwordsMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password && confirmPassword && password !== confirmPassword
      ? { passwordsDontMatch: true }
      : null;
  }

  limitInputLength(event: KeyboardEvent, maxLength: number): void {
    const input = event.target as HTMLInputElement;

    if (input.value.length >= maxLength && event.key !== 'Backspace') {
      event.preventDefault();
    }
  }

  selectRole(role: string): void {
    let backendRole: string;

    if (role === 'Terapeuta') {
      backendRole = 'THERAPIST';
      this.registerForm
        .get('paymentSession')
        ?.setValidators([Validators.required, Validators.min(0)]);
      this.registerForm.get('paymentMonth')?.clearValidators();
    } else if (role === 'Secretario/a') {
      backendRole = 'SECRETARY';
      this.registerForm
        .get('paymentMonth')
        ?.setValidators([Validators.required, Validators.min(0)]);
      this.registerForm.get('paymentSession')?.clearValidators();
    } else {
      backendRole = '';
      this.registerForm.get('paymentSession')?.clearValidators();
    }

    this.selectedRole = role;
    this.registerForm.patchValue({ role: backendRole });

    this.registerForm.get('paymentSession')?.updateValueAndValidity();
    this.registerForm.get('paymentMonth')?.updateValueAndValidity();
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

      // Eliminar el validador de adminPassword
      this.registerForm.get('adminPassword')?.clearValidators();
      this.registerForm.get('adminPassword')?.updateValueAndValidity();
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
      this.registerForm.get('adminPassword')?.setErrors({ invalidPassword: true });
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
    if (this.registerForm.valid && this.selectedRole) {
      const formValue = this.registerForm.value;

      if (this.selectedRole === 'Terapeuta') {
        formValue.paymentSession = formValue.paymentSession
          ? Number(formValue.paymentSession)
          : null;
        formValue.paymentMonth = null;
      } else if (this.selectedRole === 'Secretario/a') {
        formValue.paymentMonth = formValue.paymentMonth
          ? Number(formValue.paymentMonth)
          : null;
        formValue.paymentSession = null;
      } else {
        formValue.paymentSession = null;
        formValue.paymentMonth = null;
      }

      this.registerService.registerUser(formValue).subscribe(
        () => {
          this.router.navigate(['/users']);
        },
        (error) => {
          console.error('Error al registrar', error);
        }
      );
    } else {
      console.error('Formulario inválido o rol no seleccionado');
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
