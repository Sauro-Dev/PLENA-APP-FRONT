import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouterModule } from '@angular/router'; // Importar Router y RouterModule
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { UsersService } from "../users.service";
import { FormsModule } from "@angular/forms";

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

  constructor(private usersService: UsersService, private router: Router) {} // Inyectar Router

  ngOnInit(): void {
    this.loadUsers();
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
          this.router.navigate(['/login']); // Redirección al login
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
