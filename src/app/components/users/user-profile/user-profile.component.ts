import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsersService } from "../users.service";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  profile: any; // Aquí se almacenarán los datos del perfil
  isLoading: boolean = true; // Para controlar la carga

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  // Cargar perfil del usuario autenticado
  loadProfile(): void {
    this.isLoading = true;
    this.usersService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener el perfil:', error);
        this.isLoading = false;
      },
    });
  }

}
