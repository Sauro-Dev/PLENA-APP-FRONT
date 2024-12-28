import { Routes } from '@angular/router';
import { authGuard } from './components/auth/auth.guard';
import { roleGuard } from './components/auth/role-guard.guard';

export const routes: Routes = [
  {
    path: 'users',
    loadChildren: () =>
      import('./components/users/users.routes').then((m) => m.default),
    canActivate: [authGuard, roleGuard],
    data: { breadcrumb: 'Usuarios', roles: ['admin']},
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: { breadcrumb: 'Iniciar Sesión' },
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./components/calendar/calendar/calendar.component').then(
        (m) => m.CalendarComponent
      ),
      canActivate: [authGuard, roleGuard],
      data: { breadcrumb: 'Calendario', roles: ['secretary', 'therapist', 'admin'] },
  },
  {
    path: 'areas',
    loadChildren: () =>
      import('./components/areas/areas.routes').then((m) => m.default),
    canActivate: [authGuard, roleGuard],
    data: { breadcrumb: 'Áreas', roles: ['therapist', 'admin'] },
  },
  {
    path: 'rooms',
    loadChildren: () =>
      import('./components/rooms/rooms.routes').then((m) => m.default),
    canActivate: [authGuard, roleGuard],
    data: { breadcrumb: 'Ambientes' , roles: ['therapist', 'admin', 'secretary']},
  },
  {
    path: 'storage',
    loadChildren: () =>
      import('./components/storage/storage.routes').then((m) => m.default),
    canActivate: [authGuard, roleGuard],
    data: { breadcrumb: 'Inventario' , roles: ['admin']},
  },
  {
    path: 'patients',
    loadChildren: () =>
      import('./components/patients/patients.routes').then((m) => m.default),
    canActivate: [authGuard, roleGuard],
    data: { breadcrumb: 'Pacientes', roles: ['secretary', 'therapist', 'admin'] },
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/users/user-profile/user-profile.component').then(
        (m) => m.UserProfileComponent
      ),
      canActivate: [authGuard, roleGuard],
    data: { breadcrumb: 'Mi Perfil', roles: ['secretary', 'therapist', 'admin'] },

  },
  {
    path: 'update-profile',
    loadComponent: () =>
      import('./components/users/update-profile/user-update.component').then(
        (m) => m.UserUpdateComponent
      ),
      canActivate: [authGuard, roleGuard],
    data: { breadcrumb: ' Actualizar mi Perfil', roles: ['secretary', 'therapist', 'admin'] },

  }
];
