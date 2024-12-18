import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  menuOpen: boolean = false; // Variable para manejar la visibilidad del menú lateral

  constructor(private router: Router) {}

  // Alterna el estado del menú lateral
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Cierra el menú lateral
  closeMenu() {
    this.menuOpen = false;
  }

  // Cierra sesión y redirige al login
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    this.closeMenu(); // Cierra la barra lateral después de cerrar sesión
  }
}
