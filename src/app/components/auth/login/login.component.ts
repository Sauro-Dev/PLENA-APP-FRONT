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

  // Con esto se alterna el ojito de la contraseña
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        localStorage.setItem('token', response.token);
        const decodedToken: any = jwtDecode(response.token);
        const role = decodedToken.role;

        if (role === 'ADMIN') {
          this.router.navigate(['/users']);
        }
        if (role === 'SECRETARY') {
          this.router.navigate(['/patients']);
        }
        if (role === 'THERAPIST') {
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
