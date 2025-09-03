import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const roleGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);

  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);

      const allowedRoles = route.data?.['roles'] || []; 

      if (decodedToken.role && allowedRoles.includes(decodedToken.role.toLowerCase())) {
        return true;
      }
    } catch (error) {
      console.error('Error al decodificar el token', error);
    }
  }

  alert('No tienes acceso a este apartado');
  return false;
};