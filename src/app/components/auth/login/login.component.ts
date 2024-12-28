import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  failedAttempts: number = 0;
  showForgotPassword: boolean = false;
  recoveryUsername: string = '';
  recoveryDNI: string = '';
  newPassword: string = '';
  recoveryErrorMessage: string = '';
  showPassword: boolean = false;
  showNewPassword: boolean = false;
  showNotificationModal: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);

        const decodedToken: any = jwtDecode(response.token);
        const profile = { username: decodedToken.username, role: decodedToken.role };

        this.authService.setAuthenticatedUser(profile);


        if (profile.role === 'ADMIN') {
          this.router.navigate(['/users']);
        } else if (profile.role === 'SECRETARY') {
          this.router.navigate(['/patients']);
        } else if (profile.role === 'THERAPIST') {
          this.router.navigate(['/calendar']);
        }

        this.errorMessage = '';
        this.failedAttempts = 0;
      },
      error: (error) => {
        console.error('Error en el login:', error);
        this.errorMessage = 'Usuario o contraseña incorrectos.';
        this.failedAttempts++;

        if (this.failedAttempts >= 3) {
          this.showForgotPassword = true;
        }
      },
    });
  }

  recoverPassword() {
    const recoveryData = {
      username: this.recoveryUsername,
      dni: this.recoveryDNI,
      newPassword: this.newPassword,
    };

    this.authService.forgotPassword(recoveryData).subscribe({
      next: () => {
        this.recoveryErrorMessage = '';
        this.showNotification(
          'Contraseña actualizada con éxito. Intenta iniciar sesión.',
          'success'
        );
        this.showForgotPassword = false;
        this.failedAttempts = 0;
        this.resetRecoveryForm();
      },
      error: (error) => {
        console.error('Error en la recuperación de contraseña:', error);
        this.showNotification(
          'Datos inválidos. Verifique e intente de nuevo.',
          'error'
        );
      },
    });
  }

  resetRecoveryForm() {
    this.recoveryUsername = '';
    this.recoveryDNI = '';
    this.newPassword = '';
    this.recoveryErrorMessage = '';
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotificationModal = true;
  }

  closeNotificationModal() {
    this.showNotificationModal = false;
  }
}
