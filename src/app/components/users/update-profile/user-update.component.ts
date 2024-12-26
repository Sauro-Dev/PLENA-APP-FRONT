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

  constructor(
    private usersService: UsersService,
    private router: Router,
    private authService: AuthService // Inyectamos AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.usersService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.authService.setAuthenticatedUser(data); // Establecemos datos iniciales
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.isLoading = false;
      },
    });
  }

  saveProfile(): void {
    if (this.newPassword && this.newPassword !== this.confirmNewPassword) {
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
        const updatedPassword = this.newPassword || this.currentPassword;

        // Volvemos a autenticar al usuario con las credenciales actualizadas
        this.authService.login(this.profile.username, updatedPassword).subscribe({
          next: (response) => {
            // Guardar el token actualizado
            localStorage.setItem('token', response.token);

            // Actualizar los datos del usuario globalmente
            this.authService.setAuthenticatedUser(this.profile);

            this.router.navigate(['/profile']);
          },
          error: (error) => {
            console.error('Error al iniciar sesión nuevamente:', error);
            this.isSaving = false;
          },
        });
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
