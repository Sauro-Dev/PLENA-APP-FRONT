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
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = true;
  isSaving: boolean = false;
  isPasswordModalOpen: boolean = false;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.usersService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
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

    // Validaciones básicas
    if (!username || username.length < 3 || username.length > 20) {
      alert('El nombre de usuario debe tener entre 3 y 20 caracteres.');
      return;
    }
    if (!name || !dni || !email || !phone) { // Campos obligatorios
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
      address: address || null, // Opcional
      phoneBackup: phoneBackup || null, // Opcional
    };

    this.isSaving = true;

    this.usersService.updateProfile(payload).subscribe({
      next: () => {
        alert('Perfil actualizado con éxito.');
        this.router.navigate(['/profile']);
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
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  updatePassword(): void {
    // Validar entradas de usuario
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      alert('Todos los campos de la contraseña son obligatorios.');
      return;
    }
    if (this.newPassword.length < 4 || this.newPassword.length > 100) {
      alert('La nueva contraseña debe tener entre 4 y 100 caracteres.');
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const payload = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    };

    // Llamada al método del servicio
    this.usersService.updatePassword(payload).subscribe({
      next: () => {
        alert('Contraseña actualizada correctamente.');
        this.closePasswordModal();
        // Limpiar campos del formulario modal
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
      },
      error: (err) => {
        console.error('Error al actualizar la contraseña:', err);
        alert('No se pudo actualizar la contraseña. Revisa los datos e intenta de nuevo.');
      },
    });
  }
}
