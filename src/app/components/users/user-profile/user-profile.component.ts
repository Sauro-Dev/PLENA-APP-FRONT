import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsersService } from "../users.service";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../auth/auth.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  profile: any;
  isLoading: boolean = true;
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  showPasswordField: Record<string, boolean> = {
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  };
  isPasswordModalOpen: boolean = false;
  isAlertVisible: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';
  isPasswordTouched: boolean = false;
  isProfileReloginModalOpen: boolean = false;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.usersService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.authService.setAuthenticatedUser(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener el perfil:', error);
        this.isLoading = false;
      },
    });
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
        this.isProfileReloginModalOpen = true;
      },
      error: (err) => {
        console.error('Error al actualizar la contraseña:', err);
        this.showAlert('No se pudo actualizar la contraseña. Revisa los datos e intenta de nuevo.', 'error');
      },
    });
  }

  showAlert(message: string, type: 'success' | 'error'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.isAlertVisible = true;

    setTimeout(() => {
      this.isAlertVisible = false;
    }, 2000);
  }

  togglePasswordVisibility(fieldName: string): void {
    this.showPasswordField[fieldName] = !this.showPasswordField[fieldName];
  }

  closeReloginModal(): void {
    this.isProfileReloginModalOpen = false;
  }

  redirectToLogin(): void {
    this.isProfileReloginModalOpen = false;
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
