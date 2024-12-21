import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
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

  constructor(private authService: AuthService, private router: Router) {}

  // Alterna la visibilidad de la contraseña
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
    console.log('Datos enviados al servicio forgotPassword:', {
      username: this.recoveryUsername,
      dni: this.recoveryDNI,
      newPassword: this.newPassword,
    });

    const recoveryData = {
      username: this.recoveryUsername,
      dni: this.recoveryDNI,
      newPassword: this.newPassword,
    };

    this.authService.forgotPassword(recoveryData).subscribe({
      next: () => {
        this.recoveryErrorMessage = '';
        alert('Contraseña actualizada con éxito. Intenta iniciar sesión.');
        this.showForgotPassword = false;
        this.failedAttempts = 0;
        this.resetRecoveryForm();
      },
      error: (error) => {
        console.error('Error en la recuperación de contraseña:', error);
        this.recoveryErrorMessage = 'Datos inválidos. Verifique e intente de nuevo.';
      },
    });
  }

  resetRecoveryForm() {
    this.recoveryUsername = '';
    this.recoveryDNI = '';
    this.newPassword = '';
    this.recoveryErrorMessage = '';
  }
}
