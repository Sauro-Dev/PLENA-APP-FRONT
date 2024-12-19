import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from "../users.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-update.component.html',
  styleUrls: ['./user-update.component.css'],
})
export class UserUpdateComponent {
  profile: any = {}; // Datos del perfil
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = true; // Para controlar la carga
  isSaving: boolean = false; // Para controlar la actualización

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  // Cargar los datos actuales del perfil
  loadProfile(): void {
    this.usersService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.isLoading = false;
      },
    });
  }

  // Guardar los cambios del perfil
  saveProfile(): void {
    if (this.newPassword && this.newPassword !== this.confirmNewPassword) {
      alert('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    const payload = {
      ...this.profile,
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    };

    this.isSaving = true;
    this.usersService.updateProfile(payload).subscribe({
      next: () => {
        this.isSaving = false;
        alert('Perfil actualizado con éxito.');
        this.router.navigate(['/profile']); // Redirigir al perfil
      },
      error: (error) => {
        console.error('Error al actualizar el perfil:', error);
        this.isSaving = false;
      },
    });
  }

  cancelUpdate(): void {
    if (confirm('¿Estás seguro de que deseas cancelar los cambios? Serás redirigido a tu perfil.')) {
      this.router.navigate(['/profile']);
    }
  }
}
