import { Component } from '@angular/core';
import { RegisterService } from './register.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  ValidatorFn,
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
  showRegisterModal: boolean = false;
  showCancelModal: boolean = false;
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
        dni: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{8}$')],
          [this.dniTakenValidator.bind(this)],
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.pattern(
              /^[a-zA-ZñÑ0-9._%+-]+@[a-zA-ZñÑ0-9.-]+\.[a-zA-Z]{2,4}$/
            ),
          ],
          [this.emailTakenValidator.bind(this)],
        ],
        address: ['', Validators.required],
        birthdate: ['', [Validators.required, this.dateRangeValidator]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
        phoneBackup: ['', [Validators.pattern('^[0-9]{9}$')]],
        role: ['', Validators.required],
        isAdmin: [false],
        paymentSession: [null],
        paymentMonthly: [null],
        adminPassword: [''],
      },
      {
        validators: [
          this.phonesNotEqualValidator,
          this.passwordsMatchValidator,
        ],
      }
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

  onlyNumber(event: KeyboardEvent): void {
    if (!/[0-9]/.test(event.key) &&
      event.key !== 'Backspace' &&
      event.key !== 'Delete' &&
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Tab') {
      event.preventDefault();
    }
  }

  dniTakenValidator(control: AbstractControl): Promise<ValidationErrors | null> {
    const dni = control.value;
    return new Promise((resolve) => {
      if (!dni) {
        resolve(null);
      } else {
        this.registerService.checkDNI(dni).subscribe({
          next: (isTaken) => {
            resolve(isTaken ? { dniTaken: true } : null);
          },
          error: () => resolve(null)
        });
      }
    });
  }

  emailTakenValidator(control: AbstractControl): Promise<ValidationErrors | null> {
    const email = control.value;
    return new Promise((resolve) => {
      if (!email) {
        resolve(null);
      } else {
        this.registerService.checkEmail(email).subscribe({
          next: (isTaken) => {
            resolve(isTaken ? { emailTaken: true } : null);
          },
          error: () => resolve(null)
        });
      }
    });
  }

  phonesNotEqualValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const phone = group.get('phone')?.value;
    const phoneBackup = group.get('phoneBackup')?.value;
    if (phone && phoneBackup && phone === phoneBackup) {
      return { phonesSame: true };
    }
    return null;
  };

  passwordsMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordsDontMatch: true }
      : null;
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  confirmRegister(): void {
    const formValue = this.registerForm.value;

    if (this.selectedRole === 'Terapeuta') {
      formValue.role = this.isAdminSelected ? 'ADMIN' : 'THERAPIST';
      formValue.paymentSession = formValue.paymentSession ? Number(formValue.paymentSession) : null;
      formValue.paymentMonthly = null; // Cambiado
    } else if (this.selectedRole === 'Secretario/a') {
      formValue.role = 'SECRETARY';
      formValue.paymentMonthly = formValue.paymentMonthly ? Number(formValue.paymentMonthly) : null;
      formValue.paymentSession = null;
    }
 else {
      formValue.role = '';
      console.error('Rol inválido');
    }

    this.registerService.registerUser(formValue).subscribe({
      next: () => {
        this.closeRegisterModal();
        this.router.navigate(['/users']);
      },
      error: (error) => {
        console.error('Error al registrar', error);
      }
    });
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  confirmCancel(): void {
    this.closeCancelModal();
    this.router.navigate(['/users']);
  }

  selectRole(role: string): void {
    this.selectedRole = role;

    if (role === 'Terapeuta') {
      this.registerForm.patchValue({ role: 'THERAPIST' });
      this.registerForm
        .get('paymentSession')
        ?.setValidators([Validators.required, Validators.min(0)]);
      this.registerForm.get('paymentMonthly')?.clearValidators();
    } else if (role === 'Secretario/a') {
      this.registerForm.patchValue({ role: 'SECRETARY' });
      this.registerForm
        .get('paymentMonthly')?.setValidators([Validators.required, Validators.min(0)]);
      this.registerForm.get('paymentSession')?.clearValidators();
    }

    this.registerForm.get('paymentSession')?.updateValueAndValidity();
    this.registerForm.get('paymentMonthly')?.updateValueAndValidity();
  }

  toggleAdminSelection(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isAdminSelected = checkbox.checked;

    if (checkbox.checked) {
      this.registerForm
        .get('adminPassword')
        ?.setValidators([Validators.required]);
      this.showAdminDialog = true;
    } else {
      this.registerForm.get('adminPassword')?.clearValidators();
      this.registerForm.get('adminPassword')?.setValue('');
    }
    this.registerForm.get('adminPassword')?.updateValueAndValidity();
  }

  confirmAdminPassword(): void {
    const adminPassword = this.registerForm.get('adminPassword')?.value;
    if (adminPassword === 'admin123') {
      this.isAdminSelected = true;
      this.registerForm.patchValue({ isAdmin: true });
      this.showAdminDialog = false;
      this.registerForm.get('adminPassword')?.clearValidators();
      this.registerForm.get('adminPassword')?.setValue('');
      this.registerForm.get('adminPassword')?.updateValueAndValidity();
    } else {
      this.registerForm
        .get('adminPassword')
        ?.setErrors({ invalidPassword: true });
      this.isAdminSelected = false;
    }
  }

  cancelAdminDialog(): void {
    this.showAdminDialog = false;
    this.isAdminSelected = false;
    this.registerForm.patchValue({ isAdmin: false });

    this.registerForm.get('adminPassword')?.setValue('');
    this.registerForm.get('adminPassword')?.clearValidators();
    this.registerForm.get('adminPassword')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;

      formValue.role = this.selectedRole === 'Terapeuta'
        ? (this.isAdminSelected ? 'ADMIN' : 'THERAPIST')
        : 'SECRETARY';

      formValue.paymentSession = formValue.paymentSession ? Number(formValue.paymentSession) : null;
      formValue.paymentMonthly = formValue.paymentMonthly ? Number(formValue.paymentMonthly) : null;

      this.registerService.registerUser(formValue).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (error) => {
          console.error('Error al registrar', error);
        }
      });
    } else {
      console.error('Formulario inválido');
    }
  }
}
