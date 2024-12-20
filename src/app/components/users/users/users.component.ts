import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { UsersService } from "../users.service";
import { FormsModule } from "@angular/forms";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterLink, RouterModule, HttpClientModule, CommonModule, FormsModule], // Agregar RouterModule a los imports
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'] // Cambiado a styleUrls
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = []; // Para almacenar los usuarios filtrados
  searchQuery: string = '';
  selectedRole: string = '';
  sortOrder: string = 'asc';
  itemsPerPage: number = 10;
  currentPage: number = 1;

  // Variables para controlar la modal
  showAdminModal: boolean = false;
  adminUsername: string = '';
  newUsername: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private usersService: UsersService, private router: Router, private authService: AuthService ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.checkAdminFirstLogin();
  }

  checkAdminFirstLogin(): void {
    const firstLogin = localStorage.getItem('firstLogin') === 'true';
    const profile = this.authService.getAuthenticatedUser();

    if (profile.role === 'ADMIN' && firstLogin) {
      this.showAdminModal = true;
      this.adminUsername = profile.username;
    }
  }

  closeModal(): void {
    this.showAdminModal = false;
  }


  saveAdminCredentials(): void {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden. Por favor, verifica.');
      return;
    }

    const payload = {
      username: this.newUsername || this.adminUsername, // Si no cambia el username, usar el actual
      password: this.newPassword,
    };

    this.usersService.updateProfile(payload).subscribe({
      next: () => {
        alert('Credenciales actualizadas correctamente.');

        // Autenticar automáticamente con las nuevas credenciales
        this.authService.login(payload.username, payload.password).subscribe({
          next: () => {
            alert('Autenticado automáticamente con las nuevas credenciales.');
            this.authService.setAuthenticatedUser({ username: payload.username });

            // Actualizar el token con el nuevo
            const updatedToken = localStorage.getItem('token');
            if (updatedToken) {
              console.log('Nuevo token almacenado:', updatedToken);
            }

            this.showAdminModal = false; // Cerrar el modal
            this.router.navigate(['/dashboard']); // Redirigir al dashboard u otra página
          },
          error: (err) => {
            console.error('Error al autenticar con las nuevas credenciales:', err);
            alert('Actualización exitosa, pero no se pudo autenticar automáticamente. Por favor, inicia sesión manualmente.');
            this.router.navigate(['/login']); // Redirigir al login en caso de error
          },
        });

        localStorage.removeItem('firstLogin'); // Deshabilitar la marca de primer inicio de sesión
      },
      error: (err) => {
        console.error('Error al actualizar las credenciales:', err);
        alert('Ocurrió un error al intentar actualizar las credenciales.');
      },
    });
  }


  loadUsers(): void {
    this.usersService.getUsers().subscribe(
      (data) => {
        this.users = data;
        this.filteredUsers = [...this.users];
      },
      (error) => {
        if (error.status === 403) {
          // Redirigir al login o mostrar mensaje de error
          console.error('Acceso denegado: Se requiere rol ADMIN');
          this.router.navigate(['/login']);
        } else {
          console.error('Error fetching users', error);
        }
      }
    );
  }

  // Función de búsqueda
  onSearch(): void {
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.currentPage = 1; // Resetear a la primera página
    this.paginate();
  }

  // Función de filtrado
  onFilter(): void {
    if (this.selectedRole) {
      this.filteredUsers = this.users.filter(user => user.role === this.selectedRole);
    } else {
      this.filteredUsers = [...this.users]; // Mostrar todos si no se selecciona rol
    }
    this.currentPage = 1; // Resetear a la primera página
    this.paginate();
  }

  // Función de ordenación
  onSort(): void {
    this.filteredUsers.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (this.sortOrder === 'asc') {
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      } else {
        return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
      }
    });
    this.paginate();
  }

  // Función de cambio de número de ítems por página
  onItemsPerPageChange(): void {
    this.paginate();
  }

  // Paginación
  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    const paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);

    // Si el número de usuarios es menor que el inicio de la página, volver a la primera página
    if (paginatedUsers.length === 0 && this.currentPage > 1) {
      this.currentPage = 1;
      this.paginate();
    } else {
      this.filteredUsers = paginatedUsers;
    }
  }

  // Funciones para cambiar de página
  goToPage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

  protected readonly Math = Math;
}
