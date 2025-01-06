import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { UsersService } from "../users.service";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../auth/auth.service";
import {filter} from "rxjs/operators";
import {Material} from "../../storage/material";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterLink, RouterModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchQuery: string = '';
  selectedRole: string = '';
  sortOrder: string = 'asc';
  itemsPerPage: number = 12;
  currentPage: number = 1;
  paginatedUsers: any[] = [];
  showAdminModal: boolean = false;
  adminUsername: string = '';
  newUsername: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  notificationTitle: string = '';
  notificationMessage: string = '';
  showNotificationModal: boolean = false;
  showForcedLogoutModal: boolean = false;
  showFilters: boolean = false;  // Nuevo para manejar el desplegable de filtros en móvil

  constructor(private usersService: UsersService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.checkAdminFirstLogin();
  }

  checkAdminFirstLogin(): void {
    const firstLogin = localStorage.getItem('firstLogin') === 'true';
    const profile = this.authService.getAuthenticatedUser();

    if (!profile) {
      console.warn('Perfil de usuario no cargado.');
      return;
    }

    if (profile.role === 'ADMIN' && firstLogin) {
      this.showAdminModal = true;
      this.adminUsername = profile.username;
    }
  }

  closeModal(): void {
    this.showAdminModal = false;
  }

  saveAdminCredentials(): void {
    if (this.newUsername.length > 20) {
      this.showNotification(
        'Error',
        'El nombre de usuario no puede exceder los 20 caracteres.'
      );
      return;
    }

    if (this.newPassword.length < 6) {
      this.showNotification(
        'Error',
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showNotification(
        'Error',
        'Las contraseñas no coinciden. Por favor, verifica.'
      );
      return;
    }

    const payload = {
      username: this.newUsername || this.adminUsername,
      newPassword: this.newPassword,
    };

    this.usersService.updateAdminCredentials(payload).subscribe({
      next: () => {
        this.showNotification('Éxito', 'Credenciales actualizadas correctamente.');

        setTimeout(() => {
          this.showForcedLogoutModal = true;
        }, 3000);

        localStorage.removeItem('firstLogin');
      },
      error: (err) => {
        console.error('Error al actualizar las credenciales:', err);
        this.showNotification(
          'Error',
          'Ocurrió un error al intentar actualizar las credenciales.'
        );
      },
    });
  }

  forceLogout(): void {
    this.authService.logout();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  showNotification(title: string, message: string, autoClose: boolean = true): void {
    this.notificationTitle = title;
    this.notificationMessage = message;
    this.showNotificationModal = true;

    if (autoClose) {
      setTimeout(() => {
        this.closeNotificationModal();
      }, 3000);
    }
  }

  closeNotificationModal(): void {
    this.showNotificationModal = false;
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe(
      (data) => {
        this.users = data;
        this.filteredUsers = [...this.users];
      },
      (error) => {
        if (error.status === 403) {
          console.error('Acceso denegado: Se requiere rol ADMIN');
          this.router.navigate(['/login']);
        } else {
          console.error('Error fetching users', error);
        }
      }
    );
  }

  onSearch(): void {
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.currentPage = 1;
    this.paginate();
  }

  onFilter(): void {
    if (this.selectedRole) {
      this.filteredUsers = this.users.filter(user => user.role === this.selectedRole);
    } else {
      this.filteredUsers = [...this.users];
    }
    this.currentPage = 1;
    this.paginate();
  }

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

  onItemsPerPageChange(): void {
    this.paginate();
  }

  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  protected readonly Math = Math;
  protected readonly filter = filter;
}
