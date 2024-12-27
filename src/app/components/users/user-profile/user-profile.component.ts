import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsersService } from "../users.service";
import {RouterLink} from "@angular/router";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  profile: any;
  isLoading: boolean = true;

  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.usersService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.authService.setAuthenticatedUser(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener el perfil:', error);
        this.isLoading = false;
      },
    });
  }

}
