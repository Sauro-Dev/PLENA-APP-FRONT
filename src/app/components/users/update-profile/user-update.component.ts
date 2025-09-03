import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from "../users.service";
import {Router, RouterModule} from '@angular/router';
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: 'app-user-update',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-update.component.html',
  styleUrls: ['./user-update.component.css'],
})
export class UserUpdateComponent {
  profile: any = {};
  originalProfile: any = {};
  isLoading: boolean = false;
  isSaving: boolean = false;
  maxBirthdate: string;
  isReauthModalOpen: boolean = false;
  isCancelModalOpen: boolean = false;

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
    this.isLoading = true;
    this.usersService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = {
          ...data,
          birthdate: data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : null
        };
        this.originalProfile = { ...this.profile };
        this.authService.setAuthenticatedUser(data);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar el perfil:', error);
        this.isLoading = false;
      },
    });
  }

  saveProfile(): void {
    const { username, name, paternalSurname, maternalSurname, dni, email, phone, phoneBackup } = this.profile;

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
      address: this.profile.address || null,
      phoneBackup: phoneBackup || null,
    };

    this.isSaving = true;

    this.usersService.updateProfile(payload).subscribe({
      next: () => {
        this.isReauthModalOpen = true;
        this.isSaving = false;


        this.originalProfile = { ...this.profile };
      },
      error: (error: any) => {
        console.error('Error al actualizar el perfil:', error);
        alert('Error al actualizar el perfil. Por favor, revisa los datos ingresados.');
        this.isSaving = false;
      },
    });
  }

  navigateToLogin(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  cancelUpdate(): void {
    this.isCancelModalOpen = true;
  }

  confirmCancel(): void {
    this.isCancelModalOpen = false;
    this.router.navigate(['/profile']);
  }

  closeCancelModal(): void {
    this.isCancelModalOpen = false;
  }
}
