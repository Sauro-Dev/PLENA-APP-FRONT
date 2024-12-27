import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from "../users.service";
import { Router } from '@angular/router';
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: 'app-user-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-update.component.html',
  styleUrls: ['./user-update.component.css'],
})
export class UserUpdateComponent {
  profile: any = {};
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  showPasswordField: Record<string, boolean> = {
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  };
  isLoading: boolean = true;
  isSaving: boolean = false;
  isPasswordModalOpen: boolean = false;
  isAlertVisible: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';
  isPasswordTouched: boolean = false;
  isReloginModalOpen: boolean = false;
  maxBirthdate: string;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private authService: AuthService

  ) {
    const today = new Date();
    this.maxBirthdate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.usersService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = {
          ...data,
          birthdate: data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : null
        };
        this.authService.setAuthenticatedUser(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.isLoading = false;
      },
    });
  }

  saveProfile(): void {
    const {
      username,
      name,
      paternalSurname,
      maternalSurname,
      dni,
      email,
      phone,
      address,
      phoneBackup,
    } = this.profile;

    if (!username || username.length < 3 || username.length > 20) {
      alert('El nombre de usuario debe tener entre 3 y 20 caracteres.');
      return;
    }
    if (!name || !dni || !email || !phone) {
      alert('Los campos obligatorios no pueden estar vacíos.');
      return;
    }
    if (!/^\d{8}$/.test(dni)) {
      alert('El DNI debe contener exactamente 8 números.');
      return;
    }
    if (!/^\d{9}$/.test(phone)) {
      alert('El teléfono debe contener exactamente 9 dígitos.');
      return;
    }
    if (phoneBackup && !/^\d{9}$/.test(phoneBackup)) {
      alert('El teléfono secundario debe contener exactamente 9 dígitos.');
      return;
    }

    const payload = {
      ...this.profile,
      birthdate: this.profile.birthdate ? new Date(this.profile.birthdate).toISOString().split('T')[0] : null,
      address: address || null,
      phoneBackup: phoneBackup || null,
    };

    this.isSaving = true;

    this.usersService.updateProfile(payload).subscribe({
      next: () => {
        alert('Perfil actualizado con éxito.');
        this.isSaving = false;
        this.loadProfile();

        this.usersService.getMyProfile().subscribe({
          next: (updatedProfile) => {
            this.authService.setAuthenticatedUser(updatedProfile);
            setTimeout(() => {
              this.router.navigate(['/profile']);
            });
          },
          error: (fetchError) => {
            console.error('Error al refrescar el perfil:', fetchError);
            alert('Hubo un problema al cargar el perfil actualizado. Por favor, vuelva a intentar.');
            this.isSaving = false;
          },
        });
      },
      error: (error) => {
        console.error('Error al actualizar el perfil:', error);
        alert('Error al actualizar el perfil. Por favor, revisa los datos ingresados.');
        this.isSaving = false;
      },
    });
  }

  cancelUpdate(): void {
    if (confirm('¿Estás seguro de que deseas cancelar los cambios? Serás redirigido a tu perfil.')) {
      this.router.navigate(['/profile']);
    }
  }

  openPasswordModal(): void {
    this.isPasswordModalOpen = true;
  }

  closePasswordModal(): void {
    this.isPasswordModalOpen = false;
    this.resetPasswordFields();
  }

  resetPasswordFields(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.isPasswordTouched = false;
  }

  validatePasswordForm(): boolean {
    this.isPasswordTouched = true;

    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.showAlert('Todos los campos son obligatorios.', 'error');
      return false;
    }
    if (this.newPassword.length < 4 || this.newPassword.length > 100) {
      this.showAlert('La nueva contraseña debe tener entre 4 y 100 caracteres.', 'error');
      return false;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.showAlert('Las contraseñas no coinciden.', 'error');
      return false;
    }

    return true;
  }

  updatePassword(): void {
    if (!this.validatePasswordForm()) {
      return;
    }

    const payload = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    };

    this.usersService.updatePassword(payload).subscribe({
      next: () => {
        this.showAlert('Contraseña actualizada correctamente.', 'success');
        this.closePasswordModal();

        setTimeout(() => {
          this.isReloginModalOpen = true;
        }, 2000);
      },
      error: (err) => {
        console.error('Error al actualizar la contraseña:', err);
        this.showAlert('No se pudo actualizar la contraseña. Revisa los datos e intenta de nuevo.', 'error');
      },
    });
  }

  closeReloginModal(): void {
    this.isReloginModalOpen = false;
  }

  redirectToLogin(): void {
    this.isReloginModalOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(fieldName: string): void {
    this.showPasswordField[fieldName] = !this.showPasswordField[fieldName];
  }

  showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.isAlertVisible = true;

    setTimeout(() => {
      this.isAlertVisible = false;
    }, 2000);
  }
}
