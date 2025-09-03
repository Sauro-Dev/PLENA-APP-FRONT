import { Component, OnInit } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { UsersService } from '../users.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {AuthService} from "../../auth/auth.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-users-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './users-details.component.html',
  styleUrl: './users-details.component.css',
})
export class UsersDetailsComponent implements OnInit {
  user: any;
  editableUser: any = {};
  showEditModal = false;
  showNotificationModal = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showCancelModal = false;
  isLoading: boolean = false;
  maxBirthdate: string = '';

  constructor(
    private usersService: UsersService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    this.loadUserDetails(userId);
    const currentDate = new Date();
    this.maxBirthdate = currentDate.toISOString().split('T')[0];
  }

  loadUserDetails(userId: string | null): void {
    if (userId) {
      this.usersService.getUserDetails(+userId).subscribe(
        (data) => {
          this.user = {
            ...data,
          };
          this.editableUser = { ...data };
        },
        (error) => {
          console.error('Error fetching user details', error);
        }
      );
    }
  }

  openEditModal(): void {
    this.showEditModal = true;
  }

  closeEditModal(): void {
    if (JSON.stringify(this.user) !== JSON.stringify(this.editableUser)) {
      this.showCancelModal = true;
    } else {
      this.showEditModal = false;
    }
  }

  confirmCancelEdit(): void {
    this.showEditModal = false;
    this.showCancelModal = false;
  }

  cancelCancelEdit(): void {
    this.showCancelModal = false;
  }

  saveUserDetails(): void {
    this.isLoading = true;
    this.usersService.updateUserDetails(this.user.id, this.editableUser).subscribe(
      () => {
        this.user = { ...this.editableUser };
        this.showEditModal = false;
        this.showNotification('Información actualizada correctamente', 'success');

        const authenticatedUser = this.authService.getAuthenticatedUser();
        if (authenticatedUser && authenticatedUser.username === this.user.username) {
          this.requestReauthentication();
        }

        this.isLoading = false;

      },
      (error) => {
        console.error('Error al actualizar la información', error);
        this.showNotification('Error al actualizar la información', 'error');
        this.isLoading = false;
      }
    );
  }

  requestReauthentication(): void {
    this.showNotification(
      'Se han actualizado tus datos. Por favor, inicia sesión nuevamente por seguridad.',
      'success'
    );

    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
    }, 3000);
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotificationModal = true;
  }

  closeNotificationModal(): void {
    if (this.showNotificationModal) {
      this.showNotificationModal = false;
    }
  }

  isAdmin(): boolean {
    const authenticatedUser = this.authService.getAuthenticatedUser();
    return authenticatedUser && authenticatedUser.role === 'ADMIN';
  }
}
