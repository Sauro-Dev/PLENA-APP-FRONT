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
    this.showEditModal = false;
  }

  saveUserDetails(): void {
    this.isLoading = true;
    this.usersService.updateUserDetails(this.user.id, this.editableUser).subscribe(
      () => {
        this.user = { ...this.editableUser };
        this.showEditModal = false;
        this.isLoading = false;
        alert('Información actualizada correctamente');
      },
      (error) => {
        console.error('Error al actualizar la información', error);
        this.isLoading = false;
        alert('Error al actualizar la información');
      }
    );
  }

  isAdmin(): boolean {
    const authenticatedUser = this.authService.getAuthenticatedUser();
    return authenticatedUser && authenticatedUser.role === 'ADMIN';
  }
}
