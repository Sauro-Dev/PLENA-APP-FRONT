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

  // Controla la visibilidad de la contraseña
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  // Alterna la visibilidad de la contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
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
      },
      error: (error) => {
        console.error('Error en el login:', error);
        alert('Usuario o contraseña incorrectos.');
      },
    });
  }
}
